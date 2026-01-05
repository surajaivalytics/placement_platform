'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Circle, Clock, XCircle, Loader2, ArrowRight, 
  FileText, Code, Mic, MessageSquare, Award, TrendingUp 
} from 'lucide-react';

interface AssessmentStage {
  id: string;
  stageName: string;
  score: number | null;
  total: number | null;
  percentage: number | null;
  isPassed: boolean;
  submittedAt: Date | null;
}

interface Application {
  id: string;
  company: string;
  status: string;
  currentStage: string | null;
  eligibilityStatus: string | null;
  finalTrack: string | null;
  finalDecision: string | null;
  createdAt: Date;
  assessmentStages: AssessmentStage[];
  voiceAssessment: {
    assessedAt?: string | Date;
    isPassed?: boolean;
    score?: number;
  } | null;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/placements/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
        
        // Auto-redirect to eligibility page if not completed
        if (data.status === 'eligibility_check') {
          router.push(`/dashboard/placements/${applicationId}/eligibility`);
          return;
        }
      } else {
        alert('Application not found');
        router.push('/dashboard/placements');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageConfig = (company: string) => {
    if (company === 'TCS') {
      return [
        { name: 'foundation', title: 'Foundation Test', icon: FileText, duration: '90 min' },
        { name: 'advanced', title: 'Advanced Quant+Logical', icon: TrendingUp, duration: '45 min' },
        { name: 'coding', title: 'Coding Test', icon: Code, duration: '90 min' },
        { name: 'interview', title: 'Interview', icon: MessageSquare, duration: '30 min' },
      ];
    } else {
      return [
        { name: 'aptitude', title: 'Aptitude Test', icon: FileText, duration: '60 min' },
        { name: 'essay', title: 'Essay Writing', icon: FileText, duration: '30 min' },
        { name: 'coding', title: 'Coding Test', icon: Code, duration: '60 min' },
        { name: 'voice', title: 'Voice Assessment', icon: Mic, duration: '2 min' },
        { name: 'interview', title: 'Interview', icon: MessageSquare, duration: '30 min' },
      ];
    }
  };

  const getStageStatus = (stageName: string) => {
    if (!application) return 'pending';
    
    const stage = application.assessmentStages.find(s => s.stageName === stageName);
    if (stageName === 'voice') {
      const voiceStage = application.voiceAssessment;
      if (voiceStage?.assessedAt) {
        return voiceStage.isPassed ? 'passed' : 'failed';
      }
    }
    
    if (stage?.submittedAt) {
      return stage.isPassed ? 'passed' : 'failed';
    }
    
    if (application.status === stageName) {
      return 'current';
    }
    
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      eligibility_check: { label: 'Eligibility Check', className: 'bg-blue-100 text-blue-800' },
      foundation: { label: 'Foundation Test', className: 'bg-purple-100 text-purple-800' },
      advanced: { label: 'Advanced Test', className: 'bg-indigo-100 text-indigo-800' },
      coding: { label: 'Coding Test', className: 'bg-green-100 text-green-800' },
      aptitude: { label: 'Aptitude Test', className: 'bg-blue-100 text-blue-800' },
      essay: { label: 'Essay Writing', className: 'bg-purple-100 text-purple-800' },
      voice: { label: 'Voice Assessment', className: 'bg-pink-100 text-pink-800' },
      interview: { label: 'Interview', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    };
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const handleStartStage = (stageName: string) => {
    router.push(`/dashboard/placements/${applicationId}/${stageName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const statusBadge = getStatusBadge(application.status);
  const stages = getStageConfig(application.company);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{application.company} Placement</h1>
          <p className="text-muted-foreground mt-1">
            Application ID: {application.id.slice(0, 8)}
          </p>
        </div>
        <Badge className={statusBadge.className}>
          {statusBadge.label}
        </Badge>
      </div>

      {/* Final Result Card (if completed) */}
      {application.finalTrack && (
        <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Award className="w-6 h-6" />
              Congratulations! You&apos;ve been selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-lg text-gray-700 mb-2">You have been assigned to:</p>
              <p className="text-4xl font-bold text-yellow-900 mb-4">{application.finalTrack} Track</p>
              <p className="text-gray-600">
                You will be contacted by the recruitment team for further steps.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Card (if rejected) */}
      {application.finalDecision === 'rejected' && (
        <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <XCircle className="w-6 h-6" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Unfortunately, you did not meet the passing criteria for this placement process. 
              We encourage you to improve and apply again in the future.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.name);
              const stageData = application.assessmentStages.find(s => s.stageName === stage.name);
              const Icon = stage.icon;

              return (
                <div key={stage.name} className="relative">
                  {index < stages.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-full ${
                      status === 'passed' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                  
                  <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                    status === 'current' ? 'border-blue-500 bg-blue-50' :
                    status === 'passed' ? 'border-green-500 bg-green-50' :
                    status === 'failed' ? 'border-red-500 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      status === 'passed' ? 'bg-green-500' :
                      status === 'current' ? 'bg-blue-500 animate-pulse' :
                      status === 'failed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}>
                      {status === 'passed' ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : status === 'failed' ? (
                        <XCircle className="w-6 h-6 text-white" />
                      ) : status === 'current' ? (
                        <Clock className="w-6 h-6 text-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            {stage.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Duration: {stage.duration}
                          </p>
                        </div>

                        {status === 'passed' && stageData && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {stageData.score}/{stageData.total}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {stageData.percentage?.toFixed(1)}%
                            </div>
                          </div>
                        )}

                        {status === 'current' && (
                          <Button
                            onClick={() => handleStartStage(stage.name)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Start Test
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}

                        {status === 'failed' && stageData && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              {stageData.score}/{stageData.total}
                            </div>
                            <div className="text-sm text-red-600">
                              Failed
                            </div>
                          </div>
                        )}
                      </div>

                      {status === 'passed' && stageData?.submittedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Completed on {new Date(stageData.submittedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => router.push('/dashboard/placements')}
          variant="outline"
          className="flex-1"
        >
          Back to Placements
        </Button>
      </div>
    </div>
  );
}
