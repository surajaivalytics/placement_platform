'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlacementMCQTest } from '@/components/placements/placement-mcq-test';
import { AlertCircle } from 'lucide-react';
import { parseJsonSafely } from '@/lib/fetch-utils';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  category?: string;
  options: {
    id?: string;
    text: string;
    isCorrect?: boolean;
  }[];
}

export default function SubtopicTestPage({
  params
}: {
  params: Promise<{ id: string; subtopicId: string }>
}) {
  const router = useRouter();
  const [testId, setTestId] = useState<string>('');
  const [subtopicId, setSubtopicId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subtopicName, setSubtopicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id, subtopicId: subId }) => {
      setTestId(id);
      setSubtopicId(subId);

      // Fetch questions for this subtopic
      fetch(`/api/tests/${id}/subtopics/${subId}/questions`)
        .then(parseJsonSafely)
        .then(data => {
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setSubtopicName(data.subtopic?.name || 'Subtopic Test');
          } else {
            setError('No questions available for this subtopic.');
          }
        })
        .catch(err => {
          console.error('Failed to fetch questions:', err);
          setError('Failed to load questions. Please try again.');
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  const handleSubmit = async (answers: Record<string, string>, proctoringData?: any) => {
    try {
      const startTime = Date.now();

      const response = await fetch(`/api/tests/${testId}/subtopics/${subtopicId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          timeSpent: Math.floor((Date.now() - startTime) / 1000),
          proctoringData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to result page
        router.push(`/dashboard/test/${testId}/subtopic/${subtopicId}/result?score=${data.result.score}&total=${data.result.total}&percentage=${data.result.percentage}`);
      } else {
        console.error('Failed to submit test');
        alert('Failed to submit test. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('An error occurred while submitting the test.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-8">
          {/* Animated loader */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-none"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-none animate-spin"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Preparing Your Test</h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider animate-pulse">Loading questions...</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-none shadow-xl border border-gray-100 overflow-hidden">
            {/* Error icon */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-12 text-center border-b border-gray-100">
              <div className="w-20 h-20 bg-red-100 rounded-none flex items-center justify-center mx-auto mb-6 border-4 border-red-200">
                <AlertCircle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">No Questions Available</h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                {error || 'This subtopic doesn\'t have any questions yet. Please check back later or contact support.'}
              </p>
            </div>

            {/* Action button */}
            <div className="p-8 bg-gray-50">
              <button
                onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
                className="w-full bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-none font-black text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl border-b-4 border-primary"
              >
                ← Back to Subtopics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlacementMCQTest
      questions={questions}
      duration={15} // 15 minutes per subtopic
      testTitle={subtopicName}
      onSubmit={handleSubmit}
      applicationId={testId}
    />
  );
}
