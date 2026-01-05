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

  // Helper to get option label (A, B, C, D)
  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

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
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col font-sans p-6">
      {/* Test Banner */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#5D5FEF] via-[#7879F1] to-[#A5A6F6] rounded-[32px] p-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">{testTitle}</h1>
              <p className="opacity-90 font-medium">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-[24px] px-8 py-4 flex items-center gap-3 shadow-lg">
                <Clock className="w-8 h-8 text-[#5D5FEF]" />
                <span className="text-4xl font-bold text-slate-800 font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold opacity-90 tracking-wider">Time Remaining</p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-bold tracking-tight">Progress</span>
            <span className="text-slate-800 font-bold">{answeredCount} / {questions.length} answered</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-300 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar - Question Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Questions</h2>
              <div className="grid grid-cols-4 gap-3">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id];
                  const isCurrent = idx === currentQuestion;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`
                        aspect-square rounded-[12px] text-lg font-bold transition-all duration-200
                        ${isCurrent 
                          ? 'bg-white text-[#5D5FEF] ring-2 ring-[#5D5FEF] shadow-md z-10' 
                          : isAnswered 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'bg-[#E2E8F0] text-slate-500 hover:bg-slate-300'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Question {currentQuestion + 1}</h3>
                <span className="bg-[#F3E8FF] text-[#A855F7] px-4 py-1.5 rounded-full text-sm font-bold lowercase">
                  {currentQ.category || 'numerical'}
                </span>
              </div>

              {/* Question Text Box */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[24px] p-8 mb-8">
                <p className="text-xl text-slate-700 leading-relaxed font-medium">
                  {currentQ.text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-4 flex-1">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option.text;
                  const label = getOptionLabel(idx);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option.text)}
                      className={`
                        group w-full text-left p-6 rounded-[24px] border-2 transition-all duration-200
                        ${isSelected
                          ? 'border-[#3B82F6] bg-white shadow-md'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`
                          flex-none flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                          ${isSelected 
                            ? 'border-[#3B82F6] bg-[#3B82F6]' 
                            : 'border-slate-300'
                          }
                        `}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1 text-lg font-bold text-slate-700">
                          {label}. {option.text}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Footer Navigation */}
              <div className="mt-12 flex items-center justify-between">
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  variant="ghost"
                  className="text-slate-500 font-bold hover:bg-slate-100 h-12 px-8 rounded-xl"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-4">
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={() => setShowSubmitConfirm(true)}
                      className="bg-[#10B981] hover:bg-[#059669] text-white h-12 px-12 rounded-xl font-bold text-lg shadow-lg"
                    >
                      Submit Test
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-[#5D5FEF] hover:bg-[#4A4CCF] text-white h-12 px-12 rounded-xl font-bold text-lg shadow-lg"
                    >
                      Save & Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <Card className="max-w-md w-full rounded-[32px] border-none shadow-2xl overflow-hidden scale-in-center">
            <CardHeader className="text-center pt-8">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">Submit Test?</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-8">
              <p className="text-center text-slate-500 font-medium text-lg leading-relaxed">
                You&apos;re about to submit your test. Once submitted, you cannot change your answers.
              </p>
              
              <div className="flex justify-center gap-12 py-4 bg-slate-50 rounded-[24px]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#3B82F6]">{answeredCount}</div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-300">{questions.length - answeredCount}</div>
                  <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Remaining</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSubmit}
                  className="w-full h-14 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xl shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Yes, Submit Now'}
                </Button>
                <Button
                  onClick={() => setShowSubmitConfirm(false)}
                  variant="ghost"
                  className="w-full h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-600"
                  disabled={isSubmitting}
                >
                  Back to Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Camera Preview */}
      {cameraStatus === 'ready' && stream && (
        <div className="fixed bottom-8 right-8 z-[60] w-72 aspect-video rounded-[24px] border-4 border-white shadow-2xl overflow-hidden proctoring-feed">
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Camera
          </div>
          <video 
            ref={previewVideoRef} 
            className="h-full w-full object-cover grayscale-[0.1]" 
            autoPlay 
            playsInline 
            muted 
          />
        </div>
      )}
      {/* Violation Warning Modal */}
      <ViolationWarningModal
        isOpen={showWarningModal}
        warningCount={warningCount}
        maxWarnings={3}
        violationType={currentViolationType}
        onClose={() => setShowWarningModal(false)}
        isMaxViolations={isMaxViolations}
      />
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
