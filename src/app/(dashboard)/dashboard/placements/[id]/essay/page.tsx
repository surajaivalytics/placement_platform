'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EssayEditor } from '@/components/placements/essay-editor';
import { fetchPlacementQuestions } from '@/lib/placement-questions';
import { Spinner } from "@/components/ui/loader";
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EssayPrompt {
  id: string;
  title: string;
  prompt: string;
  wordLimit: {
    min: number;
    max: number;
  };
  guidelines: string[];
}

export default function WiproEssayTestPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<EssayPrompt | null>(null);
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
      const essayStage = appData.assessmentStages?.find(
        (s: { stageName: string; submittedAt?: string | Date }) => s.stageName === 'essay'
      );
      if (essayStage?.submittedAt) {
        router.push(`/dashboard/placements/${applicationId}`);
        return;
      }

      // Fetch questions from database
      const questionsData = await fetchPlacementQuestions(applicationId, 'essay');

      if (questionsData.questions.length === 0) {
        throw new Error('No essay prompts available');
      }

      // Transform question to essay prompt format
      const question = questionsData.questions[0]; // Get first essay question
      interface EssayMetadata {
        title?: string;
        wordLimit?: { min: number; max: number };
        guidelines?: string[];
      }
      const metadata = (question.metadata || {}) as EssayMetadata;

      const prompt: EssayPrompt = {
        id: question.id,
        title: metadata.title || 'Essay Writing',
        prompt: question.text,
        wordLimit: {
          min: metadata.wordLimit?.min || 300,
          max: metadata.wordLimit?.max || 500,
        },
        guidelines: metadata.guidelines || [
          'Write clearly and concisely',
          'Use proper grammar and punctuation',
          'Organize your thoughts logically',
          'Support your arguments with examples',
        ],
      };

      setSelectedPrompt(prompt);
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

  const handleSubmit = async (essay: string) => {
    if (!selectedPrompt) return;

    setIsSubmitting(true);
    try {
      // Simple scoring based on word count and basic criteria
      // In a real scenario, you'd use AI to evaluate grammar, coherence, etc.
      const words = essay.trim().split(/\s+/).filter(w => w.length > 0);
      const wordCount = words.length;

      // Basic scoring (simplified)
      let score = 0;
      if (wordCount >= selectedPrompt.wordLimit.min && wordCount <= selectedPrompt.wordLimit.max) {
        score += 40; // Word count compliance
      }

      // Check for basic structure (paragraphs)
      const paragraphs = essay.split('\n\n').filter(p => p.trim().length > 0);
      if (paragraphs.length >= 3) {
        score += 30; // Has introduction, body, conclusion
      }

      // Check for sentence variety
      const sentences = essay.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length >= 10) {
        score += 30; // Good sentence variety
      }

      const res = await fetch(
        `/api/placements/${applicationId}/stage/essay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essayText: essay,
            score,
            total: 100,
            timeSpent: 30 * 60, // 30 minutes
          }),
        }
      );

      if (res.ok) {
        router.push(`/dashboard/placements/${applicationId}/result/essay`);
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

  if (!selectedPrompt) {
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
      <EssayEditor
        prompt={selectedPrompt}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
