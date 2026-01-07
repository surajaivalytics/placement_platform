'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/types';
import { useViolationDetection, type ViolationLog } from '@/hooks/useViolationDetection';
import { ViolationWarningModal } from '@/components/proctoring/violation-warning-modal';

interface TestInterfaceProps {
    topicOrCompany?: string;
    type: 'topic' | 'company' | 'id';
    testId?: string;
}

type CameraStatus = 'idle' | 'checking' | 'ready' | 'denied' | 'error';
type IdentityStatus = 'loading' | 'pending' | 'verified' | 'failed';

export default function TestInterface({ topicOrCompany, type, testId }: TestInterfaceProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins default
  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState(topicOrCompany || '');
  const [monitoringEvents, setMonitoringEvents] = useState<Array<{ eventType: string; metadata?: Record<string, unknown> }>>([]);
  const [error, setError] = useState<string | null>(null);

  // Proctoring states
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [identityStatus, setIdentityStatus] = useState<IdentityStatus>('loading');
  const [identityReason, setIdentityReason] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violation, setViolation] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  
  // Violation detection states
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<ViolationLog['type'] | null>(null);
  const [isMaxViolations, setIsMaxViolations] = useState(false);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmittingRef = useRef(false);
  const submitTestRef = useRef<() => void>(() => {});

  const handleMonitoringEvent = useCallback(
    (eventType: string, metadata?: Record<string, unknown>) => {
      setMonitoringEvents(prev => [...prev, { eventType, metadata }]);
    },
    [],
  );

  // Violation detection handlers
  const handleViolationDetected = useCallback((violation: ViolationLog) => {
    // Don't show warnings if we're already submitting
    if (isSubmittingRef.current || isSubmitting) return;
    
    setCurrentViolationType(violation.type);
    setViolationLogs(prev => [...prev, violation]);
    setShowWarningModal(true);
    
    // Log to monitoring events
    handleMonitoringEvent(`violation_${violation.type}`, {
      timestamp: violation.timestamp,
      ...violation.metadata,
    });
  }, [handleMonitoringEvent, isSubmitting]);

  const handleMaxViolations = useCallback(async (violations: ViolationLog[]) => {
    if (isMaxViolations || isSubmittingRef.current || isSubmitting) return;
    setIsMaxViolations(true);
    setIsSubmitting(true);
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
      submitTestRef.current();
    }, 2000);
  }, [handleMonitoringEvent, isMaxViolations, isSubmitting]);

  // Initialize violation detection
  const { warningCount, resetViolations } = useViolationDetection({
    maxWarnings: 3,
    onViolation: handleViolationDetected,
    onMaxViolations: handleMaxViolations,
    enabled: examStarted && !isSubmitting, // Disable violation detection when submitting
    videoElementRef: previewVideoRef,
    faceDetectionEnabled: true,
    faceAwayThreshold: 3,
  });

  useEffect(() => {
    type ApiOption = { text?: string; isCorrect?: boolean };
    type ApiQuestion = {
      id: string;
      text?: string;
      options?: ApiOption[];
      explanation?: string;
      topic?: string;
      difficulty?: string;
      section?: string;
    };

    if (type === 'id' && testId) {
      fetch(`/api/tests?id=${testId}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) {
            const apiQuestions: ApiQuestion[] = data.test.questions ?? [];

            if (apiQuestions.length === 0) {
              setError('This test has no questions yet. Please contact your instructor or try again later.');
              setLoading(false);
              return;
            }

            const normalizedQuestions = apiQuestions.map((q) => {
                const optionsArray = Array.isArray(q.options) ? q.options : [];
                
                return {
                    id: q.id,
                    text: q.text || 'Question text not available',
                    options: optionsArray.map((o: ApiOption) => o?.text || 'Option not available'),
                    correctOption: optionsArray.find((o: ApiOption) => o?.isCorrect)?.text || '',
                    explanation: q.explanation || '',
                    topic: q.topic || 'General',
                    difficulty: (q.difficulty as Question['difficulty']) || 'Medium',
                    section: (q.section as Question['section']) || 'General'
                };
            });
            
            const validQuestions = normalizedQuestions.filter((q: Question) => q.options.length > 0);
            
            if (validQuestions.length === 0) {
                setError('This test has invalid questions. Please contact your instructor.');
                setLoading(false);
                return;
            }
            
            setQuestions(validQuestions);
            setTestTitle(data.test.title);
            
            if (data.test.duration) {
                setTimeLeft(data.test.duration * 60);
            }
          } else {
            setError('Test not found. Please check the URL or contact your instructor.');
          }
        })
        .catch(err => {
          console.error('Failed to fetch test:', err);
          setError('Failed to load test. Please check your internet connection and try again.');
        })
        .finally(() => setLoading(false));
    } else {
        setError('No test selected. Please select a test from the available tests.');
        setLoading(false);
    }
  }, [topicOrCompany, type, testId]);

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

  // Sync preview video with stream when exam starts (only once)
  useEffect(() => {
    if (examStarted && previewVideoRef.current && stream && previewVideoRef.current.srcObject !== stream) {
      previewVideoRef.current.srcObject = stream;
      // Force play to ensure video displays
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

  const submitTest = useCallback(async () => {
    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    // Close any open warning modals
    setShowWarningModal(false);

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    let score = 0;
    let correctCount = 0;
    questions.forEach(q => {
        if (answers[q.id] === q.correctOption) {
            score++;
            correctCount++;
        }
    });
    
    const accuracy = (correctCount / questions.length) * 100;
    const finalScore = (score / questions.length) * 100;

    if (testId) {
      try {
        const submitRes = await fetch(`/api/tests/${testId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
          }),
        });

        if (submitRes.ok) {
          const submitData = await submitRes.json();
          const createdResultId = submitData.result?.id;

          // Send monitoring events including violations
          if (createdResultId) {
            const allEvents = [...monitoringEvents];
            
            // Add violation logs as monitoring events
            violationLogs.forEach(violation => {
              allEvents.push({
                eventType: `violation_${violation.type}`,
                metadata: {
                  timestamp: violation.timestamp,
                  ...violation.metadata,
                },
              });
            });

            // TODO: Send violation logs to backend API
            // Example API call:
            // await fetch(`/api/tests/${testId}/violations`, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     resultId: createdResultId,
            //     violations: violationLogs,
            //     warningCount,
            //     autoSubmitted: isMaxViolations,
            //   }),
            // });

            if (allEvents.length > 0) {
              await Promise.all(
                allEvents.map(event =>
                  fetch('/api/monitoring', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      resultId: createdResultId,
                      eventType: event.eventType,
                      metadata: event.metadata,
                    }),
                  })
                )
              );
            }
          }

          router.push(`/dashboard/results/${createdResultId}`);
          return;
        }
      } catch (error) {
        console.error('Error submitting test:', error);
      }
    }

    localStorage.setItem('lastTestResult', JSON.stringify({
        score: finalScore,
        accuracy,
        totalQuestions: questions.length,
        answers,
        questions,
        violations: violationLogs,
        warningCount,
    }));

    router.push('/dashboard/results/latest');
  }, [answers, monitoringEvents, questions, router, testId, stream, violationLogs, warningCount, isSubmitting]);

  useEffect(() => {
    submitTestRef.current = submitTest;
  }, [submitTest]);

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

  useEffect(() => {
    if (!examStarted || !isFullscreen) return;
    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, isFullscreen, timeLeft, submitTest]);

  useEffect(() => {
    // stop camera when unmounting
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [questions[currentQIndex].id]: option });
  };

  const canStart = useMemo(() => {
    // Allow starting if identity is verified (API auto-verifies in development mode)
    return cameraStatus === 'ready' && identityStatus === 'verified' && isFullscreen && !loading && !error;
  }, [cameraStatus, identityStatus, isFullscreen, loading, error]);

  const startExam = async () => {
    if (!canStart) return;
    setExamStarted(true);
    setViolation(null);
    resetViolations(); // Reset violation counter when exam starts
    handleMonitoringEvent('exam_started', { at: Date.now() });
  };

  if (loading) return <div className="p-8">Loading test...</div>;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-8">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Test Not Available
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard/my-tests')}>
                View My Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Proctored exam</p>
          <h1 className="text-2xl font-bold">{type === 'topic' ? 'Topic' : type === 'company' ? 'Company' : 'Test'}: {testTitle}</h1>
        </div>
        <div className="text-xl font-mono bg-gray-100 dark:bg-white px-4 py-2 rounded">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
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

      {!examStarted && (
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
      )}

      {examStarted && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Question {currentQIndex + 1} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{currentQuestion.text}</p>
              <div className="grid gap-3">
                {currentQuestion.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant={answers[currentQuestion.id] === opt ? "default" : "outline"}
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(currentQIndex - 1)}
            >
              Previous
            </Button>
            {currentQIndex === questions.length - 1 ? (
              <Button onClick={submitTest} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </Button>
            ) : (
              <Button onClick={() => setCurrentQIndex(currentQIndex + 1)}>Next</Button>
            )}
          </div>

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
        </>
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
