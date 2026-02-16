'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Question } from '@/types';
import { useViolationDetection, type ViolationLog } from '@/hooks/useViolationDetection';
import { ViolationWarningModal } from '@/components/proctoring/violation-warning-modal';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle2, Lock, PlayCircle, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface TestInterfaceProps {
  topicOrCompany?: string;
  type: 'topic' | 'company' | 'id';
  testId?: string;
}

type CameraStatus = 'idle' | 'checking' | 'ready' | 'denied' | 'error';
type IdentityStatus = 'loading' | 'pending' | 'verified' | 'failed';

// Theme Helper
const getTestTheme = (title: string) => {
  const lower = title.toLowerCase();

  if (lower.includes('tcs')) {
    return {
      id: 'tcs',
      primaryBg: 'bg-[#0067b1]',
      primaryText: 'text-[#0067b1]',
      buttonBg: 'bg-[#0067b1] hover:bg-[#004d80]',
      buttonText: 'text-white',
      logo: null,
      bgGradient: 'bg-slate-50', // TCS is corporate/clean
      accentColor: '#0067b1',
      questionPaletteActive: 'bg-[#0067b1] text-white ring-[#0067b1]',
      headerBg: 'bg-white border-b-4 border-[#0067b1]',
      logoHeight: 'h-8'
    };
  }

  if (lower.includes('wipro')) {
    return {
      id: 'wipro',
      primaryBg: 'bg-gradient-to-r from-[#E63312] via-[#005197] to-[#88B04B]', // Wipro Rainbow
      primaryText: 'text-[#E63312]',
      buttonBg: 'bg-gradient-to-r from-[#E63312] to-[#88B04B] hover:opacity-90',
      buttonText: 'text-white',
      logo: null,
      bgGradient: 'bg-gradient-to-br from-gray-50 to-white', // Modern light
      accentColor: '#E63312',
      questionPaletteActive: 'bg-gradient-to-r from-[#E63312] to-[#88B04B] text-white',
      headerBg: 'bg-white border-b-2 border-gray-100', // Cleaner header
      logoHeight: 'h-8'
    };
  }

  // Default Blue/Aptitude Theme
  return {
    id: 'default',
    primaryBg: 'bg-blue-600',
    primaryText: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'text-white',
    logo: null,
    bgGradient: 'bg-slate-50',
    accentColor: '#2563eb',
    questionPaletteActive: 'bg-blue-600 text-white shadow-blue-200',
    headerBg: 'bg-white border-b border-gray-200',
    logoHeight: 'h-8'
  };
};


export default function TestInterface({ topicOrCompany, type, testId }: TestInterfaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
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
  const submitTestRef = useRef<() => void>(() => { });

  // Get dynamic theme
  const theme = useMemo(() => getTestTheme(testTitle), [testTitle]);

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
      // In dev, sometimes this fails if API isn't ready, default to verified if requested (unsafe but good for dev)
      if (process.env.NODE_ENV === 'development') {
        // setIdentityStatus('verified'); // Uncomment if blocked in dev
        setIdentityStatus('failed');
      } else {
        setIdentityStatus('failed');
      }
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

            if (allEvents.length > 0) {
              // Fire and forget monitoring events
              Promise.all(
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
              ).catch(e => console.error("Monitoring events error:", e));
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
    // Allow starting if identity is verified
    return cameraStatus === 'ready' && identityStatus === 'verified' && isFullscreen && !loading && !error;
  }, [cameraStatus, identityStatus, isFullscreen, loading, error]);

  const startExam = async () => {
    if (!canStart) return;
    setExamStarted(true);
    setViolation(null);
    resetViolations(); // Reset violation counter when exam starts
    handleMonitoringEvent('exam_started', { at: Date.now() });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading Test Environment...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-8 pt-20">
        <Card className="border-red-200 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-3 text-2xl">
              <AlertCircle className="w-8 h-8" />
              Test Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg leading-relaxed">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => router.back()} variant="outline" className="h-12 px-6">
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard/my-tests')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 shadow-lg shadow-emerald-100">
                Browse Available Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];

  return (
    <div className={`min-h-screen ${theme.bgGradient} relative font-sans overflow-hidden flex flex-col`}>
      {/* Top Bar - Dynamic Theme */}
      <div className={`${theme.headerBg} px-8 py-4 flex justify-between items-center shadow-sm z-50 transition-colors duration-300`}>
        <div className="flex items-center gap-6">
          {theme.logo ? (
            <img src={theme.logo} alt="Company Logo" className={`${theme.logoHeight} object-contain`} />
          ) : (
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 ${theme.primaryBg} rounded-xl flex items-center justify-center text-white`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none mb-1">{testTitle || "Placement Test"}</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Attempt 1 • Section 1 • Q{currentQIndex + 1}/{questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              if (window.confirm("Are you sure you want to finish the test early? This will submit your current answers.")) {
                submitTestRef.current();
              }
            }}
            variant="destructive"
            className="flex bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 shadow-sm"
          >
            Finish Test
          </Button>

          <div className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-mono font-bold text-xl tracking-wider shadow-inner transition-colors duration-500 border
              ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500' : 'text-gray-400'}`} />
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Side - Question Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">

          {/* Violation Warning Modal */}
          <ViolationWarningModal
            isOpen={showWarningModal}
            warningCount={warningCount}
            maxWarnings={3}
            violationType={currentViolationType}
            onClose={() => setShowWarningModal(false)}
            isMaxViolations={isMaxViolations}
          />

          {/* Fullscreen Violation Alert */}
          {violation && !showWarningModal && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-200 text-red-700 px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{violation}</span>
              {!isFullscreen && (
                <Button size="sm" onClick={enterFullscreen} className="bg-red-600 hover:bg-red-700 text-white rounded-full ml-4 h-8">
                  Fix Now
                </Button>
              )}
            </motion.div>
          )}

          {!examStarted ? (
            <div className="max-w-5xl mx-auto pt-4">
              <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md ring-1 ring-black/5">
                <div className={`${theme.primaryBg} p-10 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                    <div className="w-64 h-64 rounded-full bg-white blur-3xl" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3 relative z-10">Candidate Instructions</h2>
                  <p className="opacity-90 relative z-10 text-lg">Please complete the mandatory security checks to unlock the examination.</p>
                </div>

                <CardContent className="p-10">
                  <div className="grid md:grid-cols-3 gap-6 mb-10">
                    {/* Security Check Cards - consistent styling */}
                    {[
                      {
                        title: 'Camera',
                        status: cameraStatus === 'ready',
                        icon: CheckCircle2,
                        inactiveIcon: Lock,
                        desc: 'Webcam access required',
                        action: cameraStatus !== 'ready' && <Button size="sm" onClick={requestCameraAccess} variant="outline" className="w-full mt-auto">Enable Camera</Button>
                      },
                      {
                        title: 'Identity',
                        status: identityStatus === 'verified',
                        icon: CheckCircle2,
                        inactiveIcon: Lock,
                        desc: 'User verification',
                        action: identityStatus !== 'verified' && <Button size="sm" onClick={fetchIdentityStatus} variant="outline" className="w-full mt-auto">Check Status</Button>
                      },
                      {
                        title: 'Fullscreen',
                        status: isFullscreen,
                        icon: CheckCircle2,
                        inactiveIcon: PlayCircle,
                        desc: 'Anti-cheat monitor',
                        action: !isFullscreen && <Button size="sm" onClick={enterFullscreen} className={`${theme.buttonBg} w-full mt-auto`}>Enable Mode</Button>
                      },
                    ].map((item, i) => (
                      <div key={i} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 h-full ${item.status ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-2.5 bg-white rounded-xl shadow-sm ${item.status ? 'text-emerald-500' : 'text-gray-400'}`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          {item.status && <Badge className="bg-emerald-500 hover:bg-emerald-600">Ok</Badge>}
                        </div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{item.desc}</p>
                        {item.action}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <Button
                      onClick={startExam}
                      disabled={!canStart}
                      size="lg"
                      className={`
                               px-16 py-7 text-xl font-bold rounded-2xl shadow-xl transition-all duration-300 transform
                               ${canStart
                          ? `${theme.buttonBg} text-white shadow-blue-200 hover:-translate-y-1`
                          : 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed'}
                            `}
                    >
                      {canStart ? 'Start Examination Now' : 'Complete Checks to Start'}
                    </Button>
                    {!canStart && <p className="text-sm text-gray-400 font-medium">Complete all 3 checks above to proceed</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-5xl mx-auto h-full flex flex-col"
            >
              <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white flex-1 flex flex-col mb-4">
                <div className="flex-1 p-10 overflow-y-auto">
                  <div className="flex justify-between items-start mb-8">
                    <Badge variant="outline" className={`px-4 py-1.5 text-sm font-bold bg-gray-50 text-gray-600 border-gray-200 rounded-lg`}>
                      {currentQuestion.topic || 'General Aptitude'}
                    </Badge>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Difficulty:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(lvl => (
                          <div key={lvl} className={`w-2 h-2 rounded-full ${['Easy', 'Medium', 'Hard'].indexOf(currentQuestion.difficulty || 'Medium') >= (lvl - 1) ? 'bg-amber-400' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-normal mb-12 max-w-4xl">
                    {currentQuestion.text}
                  </h2>

                  <div className="grid gap-4 max-w-3xl">
                    {currentQuestion.options.map((opt, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => handleAnswer(opt)}
                        className={`
                                 relative p-5 pl-7 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center group
                                 ${answers[currentQuestion.id] === opt
                            ? `${theme.primaryText} border-current bg-blue-50/10 shadow-md` // Use theme color for border/text
                            : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"}
                              `}
                        style={answers[currentQuestion.id] === opt ? { borderColor: theme.accentColor } : {}}
                      >
                        <div className={`
                                 w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center flex-shrink-0 transition-all duration-300
                                 ${answers[currentQuestion.id] === opt
                            ? "border-current scale-110"
                            : "border-gray-300 group-hover:border-gray-400"}
                              `}
                          style={answers[currentQuestion.id] === opt ? { backgroundColor: theme.accentColor, borderColor: theme.accentColor } : {}}
                        >
                          {answers[currentQuestion.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className={`text-lg transition-colors ${answers[currentQuestion.id] === opt ? 'font-medium' : 'text-gray-600'}`}
                          style={answers[currentQuestion.id] === opt ? { color: theme.accentColor } : {}}
                        >
                          {opt}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="bg-gray-50 px-10 py-5 border-t border-gray-100 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                    disabled={currentQIndex === 0}
                    className="text-gray-500 hover:text-gray-900 font-medium hover:bg-gray-200/50"
                  >
                    ← Previous
                  </Button>

                  <Button
                    onClick={() => {
                      if (currentQIndex === questions.length - 1) {
                        submitTestRef.current();
                      } else {
                        setCurrentQIndex(currentQIndex + 1);
                      }
                    }}
                    size="lg"
                    className={`
                           px-8 h-12 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5
                           ${theme.buttonBg} ${theme.buttonText}
                        `}
                  >
                    {currentQIndex === questions.length - 1 ? 'Finish & Submit' : 'Next Question →'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Tools */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">

          {/* Camera Feed */}
          <div className="p-5 border-b border-gray-100">
            <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-md ring-2 ring-gray-100">
              <div className="absolute top-2 left-2 z-10 flex gap-2">
                <span className="bg-red-500/90 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-md font-bold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </span>
              </div>
              {cameraStatus === 'ready' ? (
                <video
                  ref={previewVideoRef}
                  className="h-full w-full object-cover transform scale-x-[-1]"
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs bg-gray-100">Camera Off</div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 px-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200" />
              <p className="text-xs font-bold text-gray-700">Proctoring Active</p>
            </div>
          </div>

          {/* Palette */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex justify-between items-end mb-4 px-1">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Question Palette</h3>
              <span className="text-xs text-gray-400 font-medium">{questions.length} Qs</span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`
                           aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                           ${currentQIndex === idx
                      ? `${theme.questionPaletteActive} shadow-lg transform scale-105 ring-2 ring-offset-2 ring-transparent`
                      : answers[q.id]
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 hover:border-gray-300'}
                        `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> Answered
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <div className={`w-3 h-3 rounded shadow-sm ${theme.id === 'tcs' ? 'bg-[#0067b1]' : theme.id === 'wipro' ? 'bg-[#E63312]' : 'bg-blue-600'}`} /> Current
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                <div className="w-3 h-3 rounded bg-white border border-gray-300" /> Not Answered
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            <Button onClick={submitTest} variant="ghost" className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm">
              Exit Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
