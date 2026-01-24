'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { StageResult } from '@/components/placements/stage-result';
import { Loader2 } from 'lucide-react';

export default function StageResultPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const stageName = params.stageName as string;
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<{
    stageName: string;
    isPassed: boolean;
    score: number;
    total: number;
    percentage: number;
    nextStage: string;
    track: string | null;
    timeSpent?: number;
    feedback?: string;
  } | null>(null);

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/placements/${applicationId}`);
      if (res.ok) {
        const data = await res.json();

        // Find the stage result
        const stage = data.assessmentStages?.find(
          (s: { stageName: string; isPassed: boolean; score?: number; total?: number; percentage?: number; timeSpent?: number }) => s.stageName === stageName
        );

        if (stage) {
          setResultData({
            stageName,
            isPassed: stage.isPassed,
            score: stage.score || 0,
            total: stage.total || 100,
            percentage: stage.percentage || 0,
            nextStage: data.status,
            track: data.finalTrack,
            timeSpent: stage.timeSpent,
          });
        } else if (stageName === 'voice') {
          // Handle voice assessment
          const voiceAssessment = data.voiceAssessment;
          if (voiceAssessment) {
            setResultData({
              stageName: 'voice',
              isPassed: voiceAssessment.isPassed,
              score: Math.round(voiceAssessment.totalScore || 0),
              total: 100,
              percentage: voiceAssessment.totalScore || 0,
              nextStage: data.status,
              track: data.finalTrack,
              feedback: voiceAssessment.feedback,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, stageName]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Result not found</h2>
          <p className="text-gray-600 mt-2">Please complete the assessment first.</p>
        </div>
      </div>
    );
  }

  return (
    <StageResult
      {...resultData}
      track={resultData.track || undefined}
      applicationId={applicationId}
    />
  );
}
