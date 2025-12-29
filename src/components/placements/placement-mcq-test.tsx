'use client';

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useViolationDetection, type ViolationLog } from '@/hooks/useViolationDetection';
import { ViolationWarningModal } from '@/components/proctoring/violation-warning-modal';

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice';
  category?: string;
  options: {
    id?: string;
    text: string;
    isCorrect?: boolean; // Optional - not sent from API for security
  }[];
}

interface PlacementMCQTestProps {
  questions: Question[];
  duration: number; // in minutes
  testTitle: string;
  onSubmit: (answers: Record<string, string>) => void;
  onTimeUp?: () => void;
}

type CameraStatus = 'idle' | 'checking' | 'ready' | 'denied' | 'error';
type IdentityStatus = 'loading' | 'pending' | 'verified' | 'failed';

export function PlacementMCQTest({
  questions,
  duration,
  testTitle,
  onSubmit,
  onTimeUp,
}: PlacementMCQTestProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Proctoring states
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus>('loading');
  const [identityReason, setIdentityReason] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violation, setViolation] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [monitoringEvents, setMonitoringEvents] = useState<Array<{ eventType: string; metadata?: Record<string, unknown> }>>([]);
  
  // Violation detection states
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<ViolationLog['type'] | null>(null);
  const [isMaxViolations, setIsMaxViolations] = useState(false);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([]);
  const warningCountRef = useRef(0);

  const handleMonitoringEvent = useCallback(
    (eventType: string, metadata?: Record<string, unknown>) => {
      setMonitoringEvents(prev => [...prev, { eventType, metadata }]);
    },
    [],
  );

  // Violation detection handlers
  const handleViolationDetected = useCallback((violation: ViolationLog) => {
    setCurrentViolationType(violation.type);
    setViolationLogs(prev => [...prev, violation]);
    setShowWarningModal(true);
    
    // Log to monitoring events
    handleMonitoringEvent(`violation_${violation.type}`, {
      timestamp: violation.timestamp,
      ...violation.metadata,
    });
  }, [handleMonitoringEvent]);

  // Define submit handlers before violation handlers
  const handleSubmit = useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsSubmitting(true);
    
    // TODO: Send violation logs to backend API
    // Example API call:
    // await fetch(`/api/placements/${applicationId}/violations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     violations: violationLogs,
    //     warningCount: warningCountRef.current,
    //     autoSubmitted: isMaxViolations,
    //   }),
    // });
    
    // Include monitoring events in submission if needed
    onSubmit(answers);
  }, [answers, onSubmit, stream, violationLogs, isMaxViolations]);

  const handleAutoSubmit = useCallback(() => {
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (onTimeUp) {
      onTimeUp();
    }
    setIsSubmitting(true);
    
    // TODO: Send violation logs to backend API
    // Example API call:
    // await fetch(`/api/placements/${applicationId}/violations`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     violations: violationLogs,
    //     warningCount: warningCountRef.current,
    //     autoSubmitted: true,
    //   }),
    // });
    
    onSubmit(answers);
  }, [onTimeUp, onSubmit, answers, stream, violationLogs]);

  const handleMaxViolations = useCallback(async (violations: ViolationLog[]) => {
    if (isMaxViolations || isSubmittingRef.current) return;
    setIsMaxViolations(true);
    setShowWarningModal(true);
    setViolationLogs(violations);
    
    // Log all violations
    violations.forEach(v => {
      handleMonitoringEvent(`violation_${v.type}`, {
        timestamp: v.timestamp,
        ...v.metadata,
      });
    });

    // Auto-submit test after a short delay
    setTimeout(() => {
      handleAutoSubmit();
    }, 2000);
  }, [handleMonitoringEvent, handleAutoSubmit, isMaxViolations]);

  // Initialize violation detection
  const { warningCount, resetViolations } = useViolationDetection({
    maxWarnings: 3,
    onViolation: handleViolationDetected,
    onMaxViolations: handleMaxViolations,
    enabled: examStarted,
    videoElementRef: previewVideoRef,
    faceDetectionEnabled: true,
    faceAwayThreshold: 3,
  });

  useEffect(() => {
    warningCountRef.current = warningCount;
  }, [warningCount]);

  // Identity verification
  const fetchIdentityStatus = async () => {
    setIdentityStatus('loading');
    try {
      const res = await fetch('/api/identity');
      if (!res.ok) {
        throw new Error('Failed to fetch identity status');
      }
      const data = await res.json();
      setIdentityStatus(data.status ?? 'pending');
      setIdentityReason(data.reason ?? null);
    } catch (err) {
      console.error('Identity status error:', err);
      setIdentityStatus('failed');
      setIdentityReason('Unable to confirm identity. Please retry or contact support.');
    }
  };

  useEffect(() => {
    fetchIdentityStatus();
  }, []);

  // Sync preview video with stream when exam starts
  useEffect(() => {
    if (examStarted && previewVideoRef.current && stream && previewVideoRef.current.srcObject !== stream) {
      previewVideoRef.current.srcObject = stream;
      const playPromise = previewVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing preview video:', error);
        });
      }
    }
  }, [examStarted, stream]);

  const forceVerifyIdentity = async () => {
    try {
      const res = await fetch('/api/identity', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to verify identity');
      }
      const data = await res.json();
      setIdentityStatus(data.status ?? 'verified');
      setIdentityReason(null);
    } catch (err) {
      console.error('Force verify error:', err);
      setIdentityStatus('failed');
      setIdentityReason('Dev verify failed. Check server logs.');
    }
  };

  const devIdentityOverride = process.env.NEXT_PUBLIC_DEV_ID_VERIFY === 'true';


  // Fullscreen monitoring
  useEffect(() => {
    const updateFullscreenState = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && examStarted) {
        setViolation('Full-screen mode exited. Re-enter to continue the exam.');
        handleMonitoringEvent('fullscreen_exit', { at: Date.now() });
      } else if (active) {
        setViolation(null);
        if (examStarted) {
          handleMonitoringEvent('fullscreen_resume', { at: Date.now() });
        }
      }
    };

    if (typeof document !== 'undefined') {
      updateFullscreenState();
      document.addEventListener('fullscreenchange', updateFullscreenState);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('fullscreenchange', updateFullscreenState);
      }
    };
  }, [examStarted, handleMonitoringEvent]);

  // Timer effect - only run when exam is started and in fullscreen
  useEffect(() => {
    if (!examStarted || !isFullscreen) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, isFullscreen, timeLeft, handleAutoSubmit]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Camera access
  const requestCameraAccess = async () => {
    setCameraStatus('checking');
    setCameraError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = media;
      }
      setCameraStatus('ready');
      handleMonitoringEvent('camera_ready', { at: Date.now() });
    } catch (err: unknown) {
      console.error('Camera error', err);
      const errorObj = err as { name?: string; message?: string } | undefined;
      const blocked = errorObj?.name === 'NotAllowedError';
      setCameraStatus(blocked ? 'denied' : 'error');
      setCameraError(blocked ? 'Camera permission denied. Allow access to continue.' : 'Unable to access camera. Check device and retry.');
      handleMonitoringEvent('camera_failure', { reason: errorObj?.message });
    }
  };

  const enterFullscreen = async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error', err);
      setViolation('Unable to enter full-screen. Please enable it to continue.');
    }
  };

  const canStart = useMemo(() => {
    return cameraStatus === 'ready' && identityStatus === 'verified' && isFullscreen && !isSubmitting;
  }, [cameraStatus, identityStatus, isFullscreen, isSubmitting]);

  const startExam = async () => {
    if (!canStart) return;
    setExamStarted(true);
    setViolation(null);
    resetViolations(); // Reset violation counter when exam starts
    handleMonitoringEvent('exam_started', { at: Date.now() });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAnswer = (optionText: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionText,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const currentQ = questions[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

  // Show pre-exam security checks if exam hasn't started
  if (!examStarted) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Proctored exam</p>
            <h1 className="text-2xl font-bold">{testTitle}</h1>
          </div>
        </div>

        {/* Violation Warning Modal */}
        <ViolationWarningModal
          isOpen={showWarningModal}
          warningCount={warningCount}
          maxWarnings={3}
          violationType={currentViolationType}
          onClose={() => setShowWarningModal(false)}
          isMaxViolations={isMaxViolations}
        />

        {/* Legacy violation display (for fullscreen exit) */}
        {violation && !showWarningModal && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/40">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">Action required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-amber-800 dark:text-amber-100">{violation}</p>
              {!isFullscreen && (
                <Button size="sm" onClick={enterFullscreen}>
                  Re-enter full-screen
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pre-exam security checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <StatusTile
                title="Camera access"
                status={cameraStatus === 'ready' ? 'pass' : cameraStatus === 'denied' ? 'fail' : 'pending'}
                description={cameraError || 'Allow webcam access to proceed.'}
                actions={
                  <Button size="sm" variant="outline" onClick={requestCameraAccess} disabled={cameraStatus === 'checking'}>
                    {cameraStatus === 'checking' ? 'Checking…' : cameraStatus === 'ready' ? 'Recheck' : 'Enable camera'}
                  </Button>
                }
              >
                <div className="mt-3 rounded border bg-black/70 aspect-video overflow-hidden">
                  <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
                </div>
              </StatusTile>

              <StatusTile
                title="Identity verification"
                status={identityStatus === 'verified' ? 'pass' : identityStatus === 'failed' ? 'fail' : 'pending'}
                description={identityReason || 'We verify your account email before starting.'}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={fetchIdentityStatus} disabled={identityStatus === 'loading'}>
                      {identityStatus === 'loading' ? 'Checking…' : 'Retry check'}
                    </Button>
                    {devIdentityOverride && (
                      <Button size="sm" variant="outline" onClick={forceVerifyIdentity}>
                        Mark verified (dev)
                      </Button>
                    )}
                  </div>
                }
              />

              <StatusTile
                title="Full-screen lock"
                status={isFullscreen ? 'pass' : 'pending'}
                description="Exam must stay in full-screen. Exiting will be recorded."
                actions={
                  <Button size="sm" onClick={enterFullscreen} variant="outline">
                    {isFullscreen ? 'Reconfirm' : 'Enter full-screen'}
                  </Button>
                }
              />
            </div>

            <div className="flex items-center justify-between rounded border px-3 py-2 text-sm text-muted-foreground">
              <p>Exam starts only after all checks are green. Leaving full-screen during the exam will pause your timer and be logged.</p>
              <Button onClick={startExam} disabled={!canStart}>
                {canStart ? 'Start Exam' : 'Complete checks to start'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{testTitle}</CardTitle>
              <p className="text-blue-100 mt-1">
                Question {currentQuestion + 1} of {questions.length}
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

      {/* Violation Warning Modal */}
      <ViolationWarningModal
        isOpen={showWarningModal}
        warningCount={warningCount}
        maxWarnings={3}
        violationType={currentViolationType}
        onClose={() => setShowWarningModal(false)}
        isMaxViolations={isMaxViolations}
      />

      {/* Legacy violation display (for fullscreen exit) */}
      {violation && !showWarningModal && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/40">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">Action required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-amber-800 dark:text-amber-100">{violation}</p>
            {!isFullscreen && (
              <Button size="sm" onClick={enterFullscreen}>
                Re-enter full-screen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">
                {answeredCount} / {questions.length} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigator */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id];
                const isCurrent = idx === currentQuestion;
                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm transition-all
                      ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      ${isAnswered 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Question {currentQuestion + 1}
              </CardTitle>
              {currentQ.category && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {currentQ.category}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <p className="text-lg text-gray-900 leading-relaxed">{currentQ.text}</p>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === option.text;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.text)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      flex items-start gap-3 group
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span className={`${isSelected ? 'text-blue-900 font-medium' : 'text-gray-900'}`}>
                          {option.text}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>

              <div className="flex gap-3">
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Confirm Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to submit the test? You have answered{' '}
                <span className="font-bold">{answeredCount}</span> out of{' '}
                <span className="font-bold">{questions.length}</span> questions.
              </p>
              {answeredCount < questions.length && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    You have <span className="font-bold">{questions.length - answeredCount}</span> unanswered questions.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSubmitConfirm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Preview - Bottom Right Corner */}
      {cameraStatus === 'ready' && stream && (
        <div className="fixed bottom-4 right-4 z-50 w-48 h-36 rounded-md border-0.5 border-primary/50 shadow-2xl overflow-hidden">
          <div className="absolute top-1 left-1 z-10 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded font-semibold">
            Camera
          </div>
          <div className="h-full w-full rounded border-0.5 border-primary/50 bg-black/70 aspect-video overflow-hidden">
            <video 
              ref={previewVideoRef} 
              className="h-full w-full object-cover" 
              autoPlay 
              playsInline 
              muted 
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusTileProps {
  title: string;
  status: 'pass' | 'pending' | 'fail';
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

function StatusTile({ title, status, description, actions, children }: StatusTileProps) {
  const color =
    status === 'pass'
      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-950/40'
      : status === 'fail'
      ? 'text-red-700 bg-red-50 dark:text-red-200 dark:bg-red-950/40'
      : 'text-amber-700 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40';

  return (
    <div className="space-y-2 rounded border p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>
          {status === 'pass' ? 'Ready' : status === 'fail' ? 'Fix required' : 'Pending'}
        </span>
      </div>
      {actions}
      {children}
    </div>
  );
}
