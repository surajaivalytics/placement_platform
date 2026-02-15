'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Save, CheckCircle, AlertTriangle, CameraOff, Camera, Mic, Volume2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useProctoring } from "@/hooks/use-proctoring";
import { WebcamMonitor } from "@/components/proctoring/webcam-monitor";
import { LANGUAGES, LanguageKey } from '@/config/languages';
import { cn } from "@/lib/utils";

interface CodingInterfaceProps {
    round: any;
    enrollment: any;
}

type AssessmentStage = 'SETUP' | 'CODING';

export function CodingInterface({ round, enrollment }: CodingInterfaceProps) {
    const router = useRouter();
    const [currentStage, setCurrentStage] = useState<AssessmentStage>('SETUP');
    const [code, setCode] = useState('// Write your solution here');
    const [language, setLanguage] = useState<LanguageKey>('python');
    const [output, setOutput] = useState('');
    const [testResults, setTestResults] = useState<any[] | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const [audioLevel, setAudioLevel] = useState(0);
    const [micPermission, setMicPermission] = useState<boolean | null>(null);
    const [camPermission, setCamPermission] = useState<boolean | null>(null);
    const [selectedVideo, setSelectedVideo] = useState("");
    const [selectedAudio, setSelectedAudio] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Media Helpers
    const startMedia = async (vId?: string, aId?: string) => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: vId ? { deviceId: { exact: vId } } : true,
                audio: aId ? { deviceId: { exact: aId } } : true
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setCamPermission(true);
            setMicPermission(true);

            // Audio Level Detection
            if (!audioContextRef.current) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 256;
                audioContextRef.current = audioContext;
                analyserRef.current = analyser;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const updateLevel = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setAudioLevel(average);
                    requestAnimationFrame(updateLevel);
                };
                updateLevel();
            }

            return stream;
        } catch (err) {
            console.error("Media error:", err);
            setCamPermission(false);
            setMicPermission(false);
        }
    };

    const stopMedia = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    };

    // Proctoring
    const { warnings, isFullScreen, enterFullScreen } = useProctoring({
        preventTabSwitch: true,
        preventContextMenu: true,
        preventCopyPaste: true,
        forceFullScreen: true,
        enrollmentId: enrollment.id,
        roundId: round.id,
        disabled: isSubmitting, // Use isSubmitting as completion flag here
        onViolation: async (type, msg) => {
            if (isSubmitting) return;
            toast.error(msg, { duration: 4000 });
        }
    });

    // Question State
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [userCodeMap, setUserCodeMap] = useState<Record<string, { code: string; language: string }>>({});

    // Fetch Questions
    useEffect(() => {
        if (!enrollment) return;
        const fetchQuestions = async () => {
            try {
                const res = await fetch(`/api/mock-drives/${enrollment.driveId}/round/${round.id}/questions`);
                if (!res.ok) throw new Error("Failed to load questions");
                const data = await res.json();
                const fetchedQuestions = data.questions || [];
                setQuestions(fetchedQuestions);

                // Initialize map
                const initialMap: Record<string, { code: string; language: string }> = {};
                fetchedQuestions.forEach((q: any) => {
                    const qLang = q.codingMetadata?.language || 'python';
                    initialMap[q.id] = {
                        code: q.codingMetadata?.starterCode || '// Write your solution here',
                        language: qLang
                    };
                });
                setUserCodeMap(initialMap);

                if (fetchedQuestions.length > 0) {
                    const firstQ = fetchedQuestions[0];
                    const qLang = (firstQ.codingMetadata as any)?.language || 'python';
                    setCode(initialMap[firstQ.id].code);
                    setLanguage(qLang as LanguageKey);
                }

            } catch (error) {
                console.error("Error fetching questions:", error);
                toast.error("Failed to load questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [round.id, enrollment?.driveId]);

    const question = questions[currentQIndex];

    // Auto-select first devices
    useEffect(() => {
        const autoSelect = async () => {
            const devs = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = devs.filter(d => d.kind === 'videoinput');
            const audioDevs = devs.filter(d => d.kind === 'audioinput');

            if (videoDevs.length > 0 && !selectedVideo) {
                setSelectedVideo(videoDevs[0].deviceId);
            }
            if (audioDevs.length > 0 && !selectedAudio) {
                setSelectedAudio(audioDevs[0].deviceId);
            }

            // Start media if in setup
            if (currentStage === 'SETUP') {
                startMedia(
                    selectedVideo || videoDevs[0]?.deviceId,
                    selectedAudio || audioDevs[0]?.deviceId
                );
            }
        };
        autoSelect();
    }, [currentStage]);

    // Update Local State when code/language changes
    useEffect(() => {
        if (!question) return;
        setUserCodeMap(prev => ({
            ...prev,
            [question.id]: { code, language }
        }));
    }, [code, language, question?.id]);

    // Autosave Interval
    useEffect(() => {
        if (!question) return;

        const interval = setInterval(async () => {
            try {
                await fetch('/api/mock-drives/session/coding/autosave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        enrollmentId: enrollment.id,
                        roundId: round.id,
                        questionId: question.id,
                        code,
                        language
                    })
                });
                setLastSaved(new Date());
            } catch (e) {
                console.error('Autosave failed', e);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [code, language, question, enrollment.id, round.id]);

    const handleRun = async () => {
        if (!question) return;
        setIsRunning(true);
        setOutput(`Initializing execution for ${LANGUAGES[language].label}...\n`);
        setTestResults(null);

        try {
            const res = await fetch('/api/mock-drives/session/coding/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    roundId: round.id,
                    questionId: question.id,
                    code,
                    language,
                    languageId: LANGUAGES[language].judge0_id
                })
            });

            const data = await res.json();

            if (res.ok && data.results) {
                setTestResults(data.results);
                const passed = data.results.filter((r: any) => r.passed).length;
                const total = data.results.length;

                let outText = `Result: ${passed}/${total} Test Cases Passed\n`;
                if (passed === total) outText += `✅ Success: All test cases passed.\n\n`;
                else outText += `⚠️ Note: Some test cases failed. Review details below.\n\n`;

                data.results.forEach((r: any, i: number) => {
                    const statusStr = r.passed ? 'PASSED' : 'FAILED';
                    outText += `[Test Case ${i + 1}] ${statusStr} (${r.time || '0'}s, ${Math.round(r.memory / 1024) || 0}KB)\n`;
                    if (!r.passed) {
                        if (r.status?.description) outText += `Status: ${r.status.description}\n`;
                        if (r.compile_output) outText += `Compile Error:\n${r.compile_output}\n`;
                        if (r.stderr) outText += `Runtime Error:\n${r.stderr}\n`;
                        if (r.stdout) outText += `Actual Output: ${r.stdout}\n`;
                    }
                    outText += `-------------------\n`;
                });
                setOutput(outText);
            } else {
                const errorMsg = data.error || 'Execution failed';
                const details = data.details ? `\nDetails: ${data.details}` : '';
                setOutput(`Error: ${errorMsg}${details}\n\nPossible reasons:\n1. Execution server (Judge0) is down.\n2. Network timeout.\n3. Question metadata is invalid.`);
                toast.error(`Execution failed: ${errorMsg}`);
            }
        } catch (error: any) {
            console.error("Run error:", error);
            const errorMsg = error.message || 'fetch failed';
            setOutput(`Network Error: ${errorMsg}\n\nCould not reach the execution API. Please ensure the backend is running and the Piston API is accessible.`);
            toast.error("Network Error: Failed to execute code");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/mock-drives/session/coding/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    roundId: round.id,
                    questionId: question.id,
                    code,
                    language
                })
            });

            const data = await res.json();

            if (res.ok) {
                setLastSaved(new Date());
                toast.success('Final Submission Successful!');
            } else {
                toast.error(data.error || 'Submission failed');
                setIsSubmitting(false);
            }
        } catch (e) {
            toast.error('Network error');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

    if (!isFullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-8 max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Security Access Required</h2>
                        <p className="text-gray-500 mt-2">
                            This assessment requires strict full-screen mode.
                        </p>
                    </div>
                    <Button onClick={enterFullScreen} className="w-full bg-[#181C2E] text-white">
                        Enter Secure Mode
                    </Button>
                </div>
            </div>
        );
    }

    if (!question) return <div className="p-8 text-center text-red-500">No questions found in this round.</div>;

    if (currentStage === 'SETUP') {
        return (
            <div className="flex flex-col min-h-screen bg-[#0a192f] text-white select-none">
                <header className="h-16 px-8 flex items-center justify-between border-b border-gray-800 bg-[#0a192f]/50 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl tracking-tight text-white hover:text-blue-400 transition-colors cursor-default">Avalytics</span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-700 mx-2" />
                        <span className="text-gray-400 font-medium">Coding Assessment</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold">{round.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Standard Device Prep</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6 bg-[#0a192f] overflow-y-auto">
                    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center">
                        {/* Preview */}
                        <div className="w-full md:w-3/5">
                            <div className="aspect-video bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl ring-1 ring-white/10 group transition-all duration-500 hover:ring-blue-500/20">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                {!camPermission && camPermission !== null && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm space-y-4 animate-in fade-in duration-300">
                                        <div className="p-5 bg-red-500/10 rounded-3xl border border-red-500/20 ring-4 ring-red-500/5">
                                            <CameraOff className="w-10 h-10 text-red-500" />
                                        </div>
                                        <p className="text-red-100 font-bold text-lg">Camera Access Restricted</p>
                                        <p className="text-gray-400 text-sm max-w-[250px] text-center">Please enable camera in your browser settings to continue.</p>
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6 flex gap-3 animate-in slide-in-from-bottom-4 duration-500">
                                    <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 text-blue-400">
                                        Monitor_Active
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="w-full md:w-2/5 space-y-10 py-8">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Hardware Calibration</span>
                                </div>
                                <h1 className="text-4xl font-black mb-2 tracking-tighter leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">System Integrity Check</h1>
                                <p className="text-gray-400 leading-relaxed font-medium">Verify your environment before starting. Audio and video tracking will be active throughout the challenge.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-3 p-5 bg-gray-900/40 rounded-3xl border border-gray-800 transition-all hover:bg-gray-900/60 group">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Camera className="w-3 h-3 text-blue-500" /> Camera Source
                                        </label>
                                        <DeviceSelector
                                            kind="videoinput"
                                            value={selectedVideo}
                                            onChange={(val) => {
                                                setSelectedVideo(val);
                                                startMedia(val, selectedAudio);
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-3 p-5 bg-gray-900/40 rounded-3xl border border-gray-800 transition-all hover:bg-gray-900/60">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Mic className="w-3 h-3 text-blue-500" /> Audio Input
                                        </label>
                                        <DeviceSelector
                                            kind="audioinput"
                                            value={selectedAudio}
                                            onChange={(val) => {
                                                setSelectedAudio(val);
                                                startMedia(selectedVideo, val);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-500/5 rounded-[32px] border border-blue-500/10 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-2xl ring-1 ring-blue-400/20 group-hover:scale-110 transition-transform">
                                            <Volume2 className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">Audio Status</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Signal Intensity</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 h-8 items-end">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn("w-1.5 rounded-full transition-all duration-100", audioLevel > (i * 8) ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-gray-800")}
                                                style={{ height: `${25 + (i * 6)}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] h-16 text-lg font-black shadow-2xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] border border-blue-400/20"
                                    disabled={!camPermission || !micPermission}
                                    onClick={() => {
                                        stopMedia();
                                        setCurrentStage('CODING');
                                    }}
                                >
                                    Initialize Coding Session <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col z-[99999] overflow-hidden select-none">
            {/* Warning Banner */}
            {warnings > 0 && (
                <div className="bg-red-500 text-white px-4 py-1 text-xs text-center font-mono animate-pulse">
                    WARNING: {warnings} Security Violations Recorded.
                </div>
            )}

            {isSubmitting && lastSaved && (
                <div className="fixed inset-0 bg-white z-[100000] flex items-center justify-center p-6">
                    <Card className="max-w-md w-full border-0 shadow-2xl rounded-3xl overflow-hidden">
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-center text-white">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold">Challenge Won!</h2>
                            <p className="text-green-100 mt-2">Your coding solutions have been submitted.</p>
                        </div>
                        <CardContent className="p-8 space-y-6 text-center">
                            <div className="space-y-2">
                                <p className="text-gray-600">Great job on completing the coding round. Your code will be reviewed against our test suites.</p>
                            </div>
                            <Button
                                className="w-full bg-[#181C2E] hover:bg-gray-800 h-12 text-lg rounded-xl shadow-lg shadow-gray-200"
                                onClick={() => router.push(`/placement/mock-drives/${enrollment.driveId}`)}
                            >
                                Back to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Webcam Monitor */}
            {currentStage === 'CODING' && <WebcamMonitor deviceId={selectedVideo} />}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center shadow-sm z-10 shrink-0 h-14">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-[#181C2E] flex items-center gap-2">
                        Coding Challenge
                    </h2>
                    <div className="flex gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentQIndex(idx);
                                    // Load saved state for new question
                                    const saved = userCodeMap[q.id];
                                    if (saved) {
                                        setCode(saved.code);
                                        setLanguage(saved.language as LanguageKey);
                                    } else {
                                        // Fallback
                                        const qLang = (q.codingMetadata as any)?.language || 'python';
                                        setCode((q.codingMetadata as any)?.starterCode || '// Write your solution here');
                                        setLanguage(qLang as LanguageKey);
                                    }
                                }}
                                className={`px-2 py-0.5 text-xs rounded border ${currentQIndex === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                            >
                                Q{idx + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={language} onValueChange={(val: LanguageKey) => setLanguage(val)}>
                        <SelectTrigger className="items-center gap-2 px-3 py-1 bg-gray-100 rounded-md border border-gray-200 h-9 ring-0 focus:ring-0">
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-black uppercase text-gray-400">Language</span>
                                <SelectValue>
                                    <span className="text-xs font-bold text-gray-700">{LANGUAGES[language]?.label || language}</span>
                                </SelectValue>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                            {Object.entries(LANGUAGES).map(([key, lang]) => (
                                <SelectItem key={key} value={key} className="text-xs font-medium text-gray-700 focus:bg-gray-100 focus:text-blue-600 transition-colors">
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning} className="h-8 text-xs">
                        <Play className="w-3 h-3 mr-2" /> Run
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || isRunning} className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                        {isSubmitting ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-2" />} Submit
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Split Pane - Left: Question, Right: Editor */}
                <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-4 overflow-y-auto flex-1 prose prose-sm max-w-none">
                        <h3 className="text-lg font-bold text-gray-800 m-0 pb-2 border-b">{question.text}</h3>

                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</h4>
                            <p className="text-gray-700 text-sm mt-1">{question.description || question.text}</p>
                        </div>

                        <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Input Format</h4>
                            <p className="text-slate-700 text-sm font-mono mt-1">{question.codingMetadata?.inputFormat || 'N/A'}</p>
                        </div>

                        <div className="mt-2 bg-slate-50 p-3 rounded border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Output Format</h4>
                            <p className="text-slate-700 text-sm font-mono mt-1">{question.codingMetadata?.outputFormat || 'N/A'}</p>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Sample Cases</h4>
                            {question.codingMetadata?.testCases?.slice(0, 2).map((tc: any, i: number) => (
                                <div key={i} className="mb-3">
                                    <div className="bg-gray-800 text-gray-200 p-2 rounded-t text-xs font-mono">Input</div>
                                    <pre className="bg-gray-100 p-2 text-xs font-mono border-x border-b border-gray-200 mb-1">{tc.input}</pre>
                                    <div className="bg-gray-800 text-gray-200 p-2 text-xs font-mono">Output</div>
                                    <pre className="bg-gray-100 p-2 text-xs font-mono border-x border-b border-gray-200 rounded-b">{tc.output}</pre>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            language={LANGUAGES[language]?.monaco || language}
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>

                    {/* Console/Output Panel */}
                    <div className="h-1/3 border-t border-gray-700 flex flex-col bg-[#0f0f0f] text-gray-300">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[#181818] border-b border-gray-700">
                            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Console Output</span>
                            {lastSaved && <span className="text-xs text-green-500 flex items-center gap-1"><Save className="w-3 h-3" /> Auto-saved</span>}
                        </div>
                        <pre className="flex-1 p-4 font-mono text-sm overflow-auto text-green-400">
                            {output || 'Run your code to see output...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components for setup
function DeviceSelector({ kind, value, onChange }: { kind: 'videoinput' | 'audioinput', value: string, onChange: (val: string) => void }) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            const devs = await navigator.mediaDevices.enumerateDevices();
            setDevices(devs.filter(d => d.kind === kind));
        };
        fetchDevices();
        navigator.mediaDevices.ondevicechange = fetchDevices;
        return () => {
            navigator.mediaDevices.ondevicechange = null;
        };
    }, [kind]);

    return (
        <select
            className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer text-white font-medium"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {devices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId} className="bg-gray-900 text-white">
                    {d.label || (kind === 'videoinput' ? `Camera ${i + 1}` : `Microphone ${i + 1}`)}
                </option>
            ))}
        </select>
    );
}
