'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Question } from '@/types';

interface LocalTestResult {
    score: number;
    accuracy: number;
    totalQuestions: number;
    answers: Record<string, string>;
    questions: Question[];
}

export default function ResultPage() {
  const [result, setResult] = useState<LocalTestResult | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

 useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultId = params.id as string;
        const response = await fetch(`/api/results?id=${resultId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }

        const data = await response.json();
        setResult(data.result);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {

        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  if (!result) return <div>Loading results...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-primary">{Math.round(result.score)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Accuracy</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{Math.round(result.accuracy)}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{result.totalQuestions}</div></CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ AI Coach Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFeedback ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="prose dark:prose-invert whitespace-pre-line">
              {feedback}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Detailed Analysis</h2>
        {result.questions.map((q: Question, idx: number) => {
            const isCorrect = result.answers[q.id] === q.correctOption;
            return (
                <Card key={q.id} className={isCorrect ? "border-green-200 bg-green-50/50 dark:bg-green-900/10" : "border-red-200 bg-red-50/50 dark:bg-red-900/10"}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-start gap-2">
                            {isCorrect ? <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" /> : <XCircle className="text-red-500 w-5 h-5 mt-0.5" />}
                            <span>Q{idx + 1}: {q.text}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm"><strong>Your Answer:</strong> {result.answers[q.id] || 'Skipped'}</p>
                        {!isCorrect && <p className="text-sm text-green-600 dark:text-green-400"><strong>Correct Answer:</strong> {q.correctOption}</p>}
                        <div className="bg-white dark:bg-gray-800 p-3 rounded text-sm mt-2 border">
                            <strong>Explanation:</strong> {q.explanation}
                        </div>
                    </CardContent>
                </Card>
            );
        })}
      </div>

      <div className="flex justify-center gap-4 pt-6">
        <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
            <Link href="/dashboard/topics">Practice Another Topic</Link>
        </Button>
      </div>
    </div>
  );
}
