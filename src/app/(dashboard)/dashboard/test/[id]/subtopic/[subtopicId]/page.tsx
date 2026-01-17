'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlacementMCQTest } from '@/components/placements/placement-mcq-test';
import { Loader2 } from 'lucide-react';

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
        .then(res => res.json())
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

  const handleSubmit = async (answers: Record<string, string>) => {
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
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium animate-pulse">Loading Test...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">{error || 'This subtopic has no questions yet.'}</p>
          <button
            onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Subtopics
          </button>
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
    />
  );
}
