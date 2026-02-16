'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VoiceRecorder } from '@/components/placements/voice-recorder';
import { Spinner } from "@/components/ui/loader";

const voicePrompts = [
  "Introduce yourself and explain why you want to work in the IT industry. Discuss your strengths and how they align with a career in technology.",
  "Describe a challenging project you worked on during your studies. Explain the problem, your approach, and the outcome.",
  "What are your career goals for the next five years? How do you plan to achieve them?",
  "Discuss the importance of teamwork in software development. Share an example from your experience.",
  "Explain a technical concept you recently learned and how you applied it in a practical scenario.",
];

export default function WiproVoiceAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPrompt] = useState(() => {
    const randomIndex = Math.floor(Math.random() * voicePrompts.length);
    return voicePrompts[randomIndex];
  });

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/placements/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        const voiceStage = data.voiceAssessment;
        if (voiceStage?.assessedAt) {
          router.push(`/dashboard/placements/${applicationId}`);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (audioBlob: Blob, duration: number) => {
    setIsSubmitting(true);
    try {
      // Convert blob to base64 for storage (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Simple scoring based on duration and basic criteria
        // In real scenario, use speech-to-text and AI analysis
        let fluencyScore = 0;
        let pronunciationScore = 0;
        let paceScore = 0;
        let clarityScore = 0;

        // Duration-based scoring (simplified)
        if (duration >= 60 && duration <= 120) {
          fluencyScore = 75 + Math.random() * 20; // 75-95
          pronunciationScore = 70 + Math.random() * 25; // 70-95
          paceScore = 75 + Math.random() * 20; // 75-95
          clarityScore = 70 + Math.random() * 25; // 70-95
        } else if (duration >= 30) {
          fluencyScore = 60 + Math.random() * 20;
          pronunciationScore = 60 + Math.random() * 20;
          paceScore = 60 + Math.random() * 20;
          clarityScore = 60 + Math.random() * 20;
        } else {
          fluencyScore = 40 + Math.random() * 20;
          pronunciationScore = 40 + Math.random() * 20;
          paceScore = 40 + Math.random() * 20;
          clarityScore = 40 + Math.random() * 20;
        }

        const totalScore = (fluencyScore + pronunciationScore + paceScore + clarityScore) / 4;
        const isPassed = totalScore >= 70;

        const res = await fetch(
          `/api/placements/${applicationId}/voice`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioData: base64Audio,
              duration,
              fluencyScore,
              pronunciationScore,
              paceScore,
              clarityScore,
              totalScore,
              isPassed,
            }),
          }
        );

        if (res.ok) {
          router.push(`/dashboard/placements/${applicationId}/result/voice`);
        } else {
          alert('Failed to submit voice assessment. Please try again.');
          setIsSubmitting(false);
        }
      };
    } catch (error) {
      console.error('Error submitting voice assessment:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <VoiceRecorder
        prompt={selectedPrompt}
        duration={120} // 2 minutes max
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
