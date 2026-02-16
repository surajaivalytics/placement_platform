'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlacementMCQTest } from '@/components/placements/placement-mcq-test';
import { CodingEditor } from '@/components/placements/coding-editor';
import { EssayEditor } from '@/components/placements/essay-editor';
import { VoiceRecorder } from '@/components/placements/voice-recorder';
import { tcsFoundationQuestions } from '@/lib/question-banks/tcs-foundation';
import { tcsAdvancedQuestions } from '@/lib/question-banks/tcs-advanced';
import { tcsCodingProblems } from '@/lib/question-banks/tcs-coding';
import { wiproAptitudeQuestions } from '@/lib/question-banks/wipro-aptitude';
import { wiproCodingProblems } from '@/lib/question-banks/wipro-coding';
import { wiproEssayPrompts } from '@/lib/question-banks/wipro-essay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const voicePrompts = [
  "Introduce yourself and explain why you want to work in the IT industry. Discuss your strengths and how they align with a career in technology.",
  "Describe a challenging project you worked on during your studies. Explain the problem, your approach, and the outcome.",
  "What are your career goals for the next five years? How do you plan to achieve them?",
];

export default function PlacementTestPage() {
  const router = useRouter();
  const params = useParams();
  const testType = params.testType as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [codingSolutions, setCodingSolutions] = useState<Record<number, { code: string; language: string }>>({});

  // Get test configuration
  const getTestConfig = () => {
    switch (testType) {
      case 'tcs-foundation':
        return {
          type: 'mcq',
          title: 'TCS Foundation Test',
          questions: tcsFoundationQuestions,
          duration: 90,
        };
      case 'tcs-advanced':
        return {
          type: 'mcq',
          title: 'TCS Advanced Quantitative + Logical Test',
          questions: tcsAdvancedQuestions,
          duration: 45,
        };
      case 'tcs-coding':
        return {
          type: 'coding',
          title: 'TCS Coding Test',
          problems: tcsCodingProblems.slice(0, 3),
          duration: 90,
        };
      case 'wipro-aptitude':
        return {
          type: 'mcq',
          title: 'Wipro Aptitude Test',
          questions: wiproAptitudeQuestions,
          duration: 60,
        };
      case 'wipro-essay':
        return {
          type: 'essay',
          title: 'Wipro Essay Writing',
          prompt: wiproEssayPrompts[Math.floor(Math.random() * wiproEssayPrompts.length)],
          duration: 30,
        };
      case 'wipro-coding':
        return {
          type: 'coding',
          title: 'Wipro Coding Test',
          problems: wiproCodingProblems.slice(0, 2),
          duration: 60,
        };
      case 'wipro-voice':
        return {
          type: 'voice',
          title: 'Wipro Voice Assessment',
          prompt: voicePrompts[Math.floor(Math.random() * voicePrompts.length)],
          duration: 2,
        };
      default:
        return null;
    }
  };

  const config = getTestConfig();

  const handleMCQSubmit = async (answers: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      // Calculate score
      let score = 0;
      const questions = config?.questions || [];
      questions.forEach((q: { id: string; options: Array<{ text: string; isCorrect: boolean }> }) => {
        const userAnswer = answers[q.id];
        const correctOption = q.options.find((opt: { text: string; isCorrect: boolean }) => opt.isCorrect);
        if (userAnswer === correctOption?.text) {
          score++;
        }
      });

      // Save result to database
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testTitle: config?.title,
          testType: 'company',
          company: testType.split('-')[0].toUpperCase(),
          score,
          total: questions.length,
          answers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/results/${data.resultId}`);
      } else {
        alert('Failed to submit test. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCodingSubmit = async () => {
    setIsSubmitting(true);
    try {
      const score = Object.keys(codingSolutions).length;

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testTitle: config?.title,
          testType: 'company',
          company: testType.split('-')[0].toUpperCase(),
          score,
          total: config?.problems?.length || 0,
          solutions: codingSolutions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/results/${data.resultId}`);
      } else {
        alert('Failed to submit test. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleEssaySubmit = async (essay: string) => {
    setIsSubmitting(true);
    try {
      // Simple scoring
      const words = essay.trim().split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;
      let score = 0;

      if (wordCount >= 200 && wordCount <= 300) score += 40;
      const paragraphs = essay.split('\n\n').filter(p => p.trim().length > 0);
      if (paragraphs.length >= 3) score += 30;
      const sentences = essay.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length >= 10) score += 30;

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testTitle: config?.title,
          testType: 'company',
          company: 'WIPRO',
          score,
          total: 100,
          essayText: essay,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/results/${data.resultId}`);
      } else {
        alert('Failed to submit essay. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting essay:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleVoiceSubmit = async (audioBlob: Blob, duration: number) => {
    setIsSubmitting(true);
    try {
      // Simple scoring based on duration
      let score = 0;
      if (duration >= 60 && duration <= 120) {
        score = 75 + Math.random() * 20;
      } else if (duration >= 30) {
        score = 60 + Math.random() * 20;
      } else {
        score = 40 + Math.random() * 20;
      }

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testTitle: config?.title,
          testType: 'company',
          company: 'WIPRO',
          score: Math.round(score),
          total: 100,
          duration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/results/${data.resultId}`);
      } else {
        alert('Failed to submit voice assessment. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting voice assessment:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Test not found</h2>
          <p className="text-gray-600 mt-2">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  // Render based on test type
  if (config.type === 'mcq' && config.questions) {
    return (
      <PlacementMCQTest
        questions={config.questions as { id: string; text: string; type: "multiple-choice"; options: { text: string; isCorrect?: boolean }[] }[]}
        duration={config.duration}
        testTitle={config.title}
        onSubmit={handleMCQSubmit}
        onTimeUp={() => alert('Time is up!')}
      />
    );
  }

  if (config.type === 'coding' && config.problems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Navigation */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{config.title}</h1>
                  <p className="text-blue-100 mt-1">
                    Problem {currentProblem + 1} of {config.problems.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}
                  disabled={currentProblem === 0}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {config.problems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentProblem(idx)}
                      className={`
                        w-10 h-10 rounded-lg font-semibold transition-all
                        ${idx === currentProblem
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : codingSolutions[idx]
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentProblem === config.problems.length - 1 ? (
                  <Button
                    onClick={handleCodingSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit All'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentProblem(currentProblem + 1)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <CodingEditor
            problem={config.problems[currentProblem]}
            onSubmit={(code, language) => {
              setCodingSolutions({
                ...codingSolutions,
                [currentProblem]: { code, language },
              });
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  if (config.type === 'essay' && config.prompt && typeof config.prompt !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <EssayEditor
          prompt={config.prompt}
          onSubmit={handleEssaySubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  if (config.type === 'voice' && config.prompt && typeof config.prompt === 'string') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
        <VoiceRecorder
          prompt={config.prompt}
          duration={120}
          onSubmit={handleVoiceSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return null;
}
