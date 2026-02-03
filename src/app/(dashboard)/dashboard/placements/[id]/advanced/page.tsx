'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlacementMCQTest } from '@/components/placements/placement-mcq-test';
import { fetchPlacementQuestions } from '@/lib/placement-questions';
import { Spinner } from "@/components/ui/loader";
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  category?: string;
  options: {
    id: string;
    text: string;
  }[];
}

export default function TCSAdvancedTestPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<{ assessmentStages?: Array<{ stageName: string; submittedAt?: string | Date }> } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testDuration, setTestDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const loadTestData = useCallback(async () => {
    try {
      const appRes = await fetch(`/api/placements/${applicationId}`);
      if (!appRes.ok) {
        throw new Error('Failed to load application');
      }
      const appData = await appRes.json();
      setApplication(appData);

      const advancedStage = appData.assessmentStages?.find(
        (s: { stageName: string; submittedAt?: string | Date }) => s.stageName === 'advanced'
      );
      if (advancedStage?.submittedAt) {
        router.push(`/dashboard/placements/${applicationId}`);
        return;
      }

      const questionsData = await fetchPlacementQuestions(applicationId, 'advanced');
      setQuestions(questionsData.questions as Question[]);
      setTestDuration(questionsData.test.duration || 60);
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

  const handleSubmit = async (answers: Record<string, string>) => {
    try {
      const res = await fetch(
        `/api/placements/${applicationId}/stage/advanced`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            score: 0,
            total: questions.length,
            timeSpent: testDuration * 60,
          }),
        }
      );

      if (res.ok) {
        router.push(`/dashboard/placements/${applicationId}/result/advanced`);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to submit test. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred. Please try again.');
    }
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

  if (!application || questions.length === 0) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <PlacementMCQTest
        questions={questions}
        duration={testDuration}
        testTitle="TCS Advanced Quantitative + Logical Test"
        onSubmit={handleSubmit}
        onTimeUp={() => alert('Time is up!')}
      />
    </div>
  );
}
