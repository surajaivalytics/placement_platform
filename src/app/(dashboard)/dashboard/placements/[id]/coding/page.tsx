'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CodingEditor } from '@/components/placements/coding-editor';
import { fetchPlacementQuestions } from '@/lib/placement-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { Spinner } from "@/components/ui/loader";

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  testCases: {
    input: string;
    output: string;
  }[];
}

export default function TCSCodingTestPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [solutions, setSolutions] = useState<Record<number, { code: string; language: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [selectedProblems, setSelectedProblems] = useState<CodingProblem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTestData = useCallback(async () => {
    try {
      // Fetch application details
      const appRes = await fetch(`/api/placements/${applicationId}`);
      if (!appRes.ok) {
        throw new Error('Failed to load application');
      }
      const appData = await appRes.json();

      // Check if already completed this stage
      const codingStage = appData.assessmentStages?.find(
        (s: { stageName: string; submittedAt?: string | Date }) => s.stageName === 'coding'
      );
      if (codingStage?.submittedAt) {
        router.push(`/dashboard/placements/${applicationId}`);
        return;
      }

      // Fetch questions from database
      const questionsData = await fetchPlacementQuestions(applicationId, 'coding');

      // Transform questions to coding problem format
      interface ApiQuestion {
        id: string;
        text: string;
        difficulty?: string;
        metadata?: {
          inputFormat?: string;
          outputFormat?: string;
          constraints?: string | string[];
          sampleInput?: string;
          sampleOutput?: string;
          explanation?: string;
          testCases?: { input: string; output: string }[];
        };
      }
      const problems: CodingProblem[] = questionsData.questions.map((q: ApiQuestion) => ({
        id: q.id,
        title: q.text,
        description: q.text,
        difficulty: (q.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
        inputFormat: q.metadata?.inputFormat || 'Standard input',
        outputFormat: q.metadata?.outputFormat || 'Standard output',
        constraints: q.metadata?.constraints ?
          (Array.isArray(q.metadata.constraints) ? q.metadata.constraints : [q.metadata.constraints]) :
          ['No specific constraints'],
        sampleInput: q.metadata?.sampleInput || 'No sample input provided',
        sampleOutput: q.metadata?.sampleOutput || 'No sample output provided',
        explanation: q.metadata?.explanation || 'Solve the problem as described',
        testCases: q.metadata?.testCases ?
          (Array.isArray(q.metadata.testCases) ? q.metadata.testCases : []) :
          [],
      }));

      setSelectedProblems(problems);
      setTimeLeft(questionsData.test.duration * 60 || 90 * 60);
    } catch (error) {
      console.error('Error loading test data:', error);
      const message = error instanceof Error ? error.message : 'Failed to load test. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    loadTestData();
  }, [loadTestData]);

  const handleSaveSolution = (code: string, language: string) => {
    setSolutions({
      ...solutions,
      [currentProblem]: { code, language },
    });
  };

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Calculate score (simplified - in real scenario, run test cases)
      const score = Object.keys(solutions).length; // Number of problems attempted

      const res = await fetch(
        `/api/placements/${applicationId}/stage/coding`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solutions,
            score,
            total: 3,
            timeSpent: 90 * 60 - timeLeft,
          }),
        }
      );

      if (res.ok) {
        router.push(`/dashboard/placements/${applicationId}/result/coding`);
      } else {
        alert('Failed to submit test. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }, [applicationId, router, solutions, timeLeft]);

  const handleAutoSubmit = useCallback(() => {
    alert('Time is up! Your test will be auto-submitted.');
    handleFinalSubmit();
  }, [handleFinalSubmit]);

  useEffect(() => {
    if (!isLoading && selectedProblems.length > 0) {
      // Timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, selectedProblems, handleAutoSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (90 * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Please contact the administrator to upload questions for this test.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedProblems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
              <p className="text-gray-600">
                Questions for this test have not been uploaded yet. Please contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">TCS Coding Test</CardTitle>
                <p className="text-blue-100 mt-1">
                  Problem {currentProblem + 1} of {selectedProblems.length}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getTimeColor()} bg-white px-4 py-2 rounded-lg`}>
                  <Clock className="w-6 h-6 inline mr-2" />
                  {formatTime(timeLeft)}
                </div>
                <p className="text-blue-100 text-sm mt-1">Time Remaining</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Problem Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}
                disabled={currentProblem === 0}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Problem
              </Button>

              <div className="flex gap-2">
                {selectedProblems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentProblem(idx)}
                    className={`
                      w-10 h-10 rounded-lg font-semibold transition-all
                      ${idx === currentProblem
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2'
                        : solutions[idx]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentProblem === selectedProblems.length - 1 ? (
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit All'}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentProblem(Math.min(selectedProblems.length - 1, currentProblem + 1))}
                  disabled={currentProblem === selectedProblems.length - 1}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next Problem
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coding Editor */}
        <CodingEditor
          problem={selectedProblems[currentProblem]}
          onSubmit={handleSaveSolution}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
