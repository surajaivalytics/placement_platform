"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Play, ShieldAlert, BadgeCheck, Volume2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateQuestion } from '@/app/actions/interview';
import { useProctoring } from "@/hooks/use-proctoring";
import { Progress } from "@/components/ui/progress";

type AssessmentStage = 'SYSTEM_CHECK' | 'READING' | 'EXTEMPORE' | 'INTERVIEW' | 'FEEDBACK';
type InterviewState = 'lobby' | 'connecting' | 'active' | 'ended';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AIInterviewRunnerProps {
    interviewType: 'Technical' | 'HR';
    companyName: string;
    onFinish: () => void;
}

export function AIInterviewRunner({ interviewType, companyName, onFinish }: AIInterviewRunnerProps) {
    // --- Constants ---
    const READING_PASSAGES = [
        "Artificial Intelligence is revolutionizing the way we work and live. From consistent automation to complex problem-solving, AI systems are becoming integral to modern industry. However, ethical considerations regarding privacy and bias remain paramount.",
        "Cloud computing provides on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user. Large clouds often have functions distributed over multiple locations, each checking to multiple data centers.",
        "The Internet of Things (IoT) describes the network of physical objects—things—that are embedded with sensors, software, and other technologies for the purpose of connecting and exchanging data with other devices and systems over the internet."
    ];

    const EXTEMPORE_TOPICS = [
        "Impact of AI on Job Market",
        "Work from Home vs Office",
        "Cashless Economy: Pros and Cons",
        "Climate Change and Technology",
        "Social Media: Boon or Bane?"
    ];

    // --- State ---
    const [currentStage, setCurrentStage] = useState<AssessmentStage>('SYSTEM_CHECK');

    // System Check State
    const [micPermission, setMicPermission] = useState<boolean | null>(null);
    const [camPermission, setCamPermission] = useState<boolean | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);

    // Reading & Extempore State
    const [currentReadingText, setCurrentReadingText] = useState("");
    const [extemporeTopic, setExtemporeTopic] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [stageStatus, setStageStatus] = useState<'IDLE' | 'PREP' | 'RECORDING' | 'COMPLETED'>('IDLE');
    const [isRecording, setIsRecording] = useState(false);

    // Interview State
    const [messages, setMessages] = useState<{ role: 'interviewer' | 'candidate', text: string }[]>([]);
    const [transcript, setTranscript] = useState("");
    const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
    const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // --- Helpers defined early for hoisting issues ---
    const stopMedia = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    };

    const handleTerminated = (reason: string) => {
        stopMedia();
        toast.error(`Interview Terminated: ${reason}`);
        if (onFinish) onFinish();
    };

    // --- Proctoring Logic ---
    const { isFullScreen, enterFullScreen, warnings } = useProctoring({
        forceFullScreen: currentStage !== 'SYSTEM_CHECK' && currentStage !== 'FEEDBACK',
        preventTabSwitch: currentStage !== 'SYSTEM_CHECK' && currentStage !== 'FEEDBACK',
        preventContextMenu: true,
        preventCopyPaste: true,
        onViolation: (type, msg) => {
            toast.warning(`Warning: ${msg}`);
            // Check warnings in useEffect to trigger termination
        },
        onExitFullScreen: () => {
            if (currentStage !== 'SYSTEM_CHECK' && currentStage !== 'FEEDBACK') {
                toast.error("Please stay in full screen mode!");
            }
        }
    });

    useEffect(() => {
        if (warnings >= 3) {
            handleTerminated("Combined Violations");
        }
    }, [warnings]);

    // --- Effects ---
    const analyzeAudio = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setAudioLevel(average);

        requestAnimationFrame(analyzeAudio);
    };

    const startMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                audio: true
            });
            streamRef.current = stream;
            setMicPermission(true);
            setCamPermission(true);

            if (videoRef.current) videoRef.current.srcObject = stream;
            if (userVideoRef.current) userVideoRef.current.srcObject = stream; // Will assign when rendered

            // Setup Audio Analysis
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            analyzeAudio();

        } catch (err) {
            console.error("Media Error:", err);
            setMicPermission(false);
            setCamPermission(false);
            toast.error("Access denied. Please check your camera/mic permissions.");
        }
    };

    useEffect(() => {
        startMedia();
        return () => stopMedia();
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initial Stage Logic
    useEffect(() => {
        if (currentStage === 'READING') {
            setCurrentReadingText(READING_PASSAGES[Math.floor(Math.random() * READING_PASSAGES.length)]);
            setStageStatus('IDLE');
        } else if (currentStage === 'EXTEMPORE') {
            setExtemporeTopic(EXTEMPORE_TOPICS[Math.floor(Math.random() * EXTEMPORE_TOPICS.length)]);
            setStageStatus('PREP');
            setTimeLeft(30);
        } else if (currentStage === 'INTERVIEW') {
            if (messages.length === 0) processTurn();
        }
    }, [currentStage]);

    // Timers
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft > 0 && (stageStatus === 'PREP' || stageStatus === 'RECORDING')) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (currentStage === 'EXTEMPORE' && stageStatus === 'PREP') {
                            startRecording();
                            setStageStatus('RECORDING');
                            return 60;
                        } else if (stageStatus === 'RECORDING') {
                            stopRecording();
                            return 0;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timeLeft, stageStatus, currentStage]);

    // --- Interview Logic Helpers ---
    const speak = (text: string) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0; utterance.pitch = 1.0; utterance.volume = 1.0;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsListening(true);
            startListening();
        };
        utterance.onerror = (e) => {
            console.error(e);
            setIsSpeaking(false);
            setIsListening(true);
        };
        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Browser does not support speech recognition.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') console.error("Recognition error:", event.error);
        };

        recognition.onend = () => {
            if (isListening && currentStage === 'INTERVIEW') {
                // Continue listening
            } else {
                setIsListening(false);
            }
        };

        try {
            recognition.start();
            setIsListening(true);
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }
    };

    const stopListening = () => {
        setIsListening(false);
        // In real app, stop recognition instance
    };

    const processTurn = async (userResponse?: string) => {
        setIsProcessing(true);
        setIsListening(false);

        if (userResponse) {
            setMessages(prev => [...prev, { role: 'candidate', text: userResponse }]);
            setPreviousAnswers(prev => [...prev, userResponse]);
        }

        try {
            const result = await generateQuestion({
                interviewType: interviewType,
                companyType: companyName,
                candidateName: "Candidate",
                currentQuestionIndex: previousQuestions.length,
                previousQuestions,
                previousAnswers: userResponse ? [...previousAnswers, userResponse] : previousAnswers,
                conversationHistory: messages.map(m => ({
                    role: m.role === 'interviewer' ? 'model' : 'user',
                    content: m.text
                }))
            });

            if (result.question) {
                setMessages(prev => [...prev, { role: 'interviewer', text: result.question }]);
                setPreviousQuestions(prev => [...prev, result.question]);
                speak(result.question);
            } else {
                handleEndCall();
            }

        } catch (error) {
            console.error("Error generating question:", error);
            toast.error("Failed to generate question.");
            setIsListening(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnswerManual = async () => {
        stopListening();
        const finalAnswer = transcript.trim() || "[No clear audio captured]";
        setTranscript("");
        await processTurn(finalAnswer);
    };

    const handleEndCall = () => {
        stopMedia();
        window.speechSynthesis.cancel();
        setCurrentStage('FEEDBACK');
        if (onFinish) onFinish();
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        try {
            const mediaRecorder = new MediaRecorder(streamRef.current);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorder.start();
            setIsRecording(true);
            setStageStatus('RECORDING');
            if (currentStage === 'READING') setTimeLeft(0);
        } catch (e) {
            console.error("Recording error:", e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setStageStatus('COMPLETED');
        }
    };


    // --- Stage Components ---
    const SystemCheckStage = () => (
        <div className="flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full h-[80vh]">
            <Card className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-0 ring-1 ring-black/5">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
                    <h2 className="text-3xl font-bold mb-2 relative z-10">System Compatibility Check</h2>
                    <p className="text-indigo-200 relative z-10">Ensuring a fair and seamless assessment environment.</p>
                </div>

                <div className="p-8 md:p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Camera Check */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-lg", camPermission ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                    {camPermission ? <CheckCircle2 className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Camera Feed</h3>
                                    <p className="text-sm text-gray-500">{camPermission ? "Connected & Active" : "Not Detected"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-2xl overflow-hidden h-48 relative border-2 border-gray-100">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                {!camPermission && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50 font-medium">
                                        No Camera Input
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Microphone Check */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-lg", micPermission ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                                    {micPermission ? <CheckCircle2 className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Microphone Input</h3>
                                    <p className="text-sm text-gray-500">{micPermission ? "Connected & Listening" : "Not Detected"}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 h-48 flex flex-col justify-center items-center border-2 border-dashed border-gray-200 space-y-4">
                                <div className="flex gap-1 h-12 items-end justify-center">
                                    {[...Array(10)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn("w-2 rounded-full transition-all duration-75", audioLevel > (i * 10) + 10 ? "bg-indigo-500" : "bg-gray-200")}
                                            style={{ height: `${Math.max(20, Math.min(100, (audioLevel / 2) + (i * 5)))}%` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-center text-gray-500 font-medium">Speak to test audio levels</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Please ensure you are in a quiet environment.
                        </div>
                        <Button
                            size="lg"
                            className="bg-slate-900 text-white hover:bg-slate-800 px-8 rounded-xl shadow-xl shadow-slate-200"
                            disabled={!micPermission || !camPermission}
                            onClick={() => {
                                console.log("Start Assessment clicked. Moving to READING stage.");
                                setCurrentStage('READING');
                            }}
                        >
                            Start Assessment <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    const ReadingStage = () => (
        <div className="flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full min-h-[80vh]">
            <Card className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-0 ring-1 ring-black/5 flex flex-col md:flex-row h-full md:h-[600px]">
                <div className="w-full md:w-1/3 bg-slate-900 p-6 flex flex-col items-center justify-center relative">
                    <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">RECORDER_MODE</div>
                    <div className="w-48 h-48 rounded-full border-4 border-slate-700 flex items-center justify-center relative mb-8">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-full opacity-50 absolute inset-0 transform scale-x-[-1]" />
                        <div className={cn("w-full h-full rounded-full absolute border-4 transition-all duration-200",
                            isRecording ? "border-red-500 animate-pulse" : "border-transparent")} />
                        <div className="flex gap-1 items-center justify-center h-24 z-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i}
                                    className={cn("w-2 rounded-full transition-all duration-75", isRecording ? "bg-red-500" : "bg-slate-600")}
                                    style={{ height: isRecording ? `${Math.max(20, audioLevel * 2)}%` : '20%' }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="text-center space-y-2 z-10">
                        <h3 className="text-white font-medium">{isRecording ? "Recording..." : "Ready to Record"}</h3>
                        <p className="text-slate-400 text-sm">Read the text displayed on the right clearly and loudly.</p>
                    </div>
                </div>
                <div className="w-full md:w-2/3 p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</div> Reading Comprehension</h2>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-lg leading-relaxed font-medium text-slate-700 shadow-inner">
                            "{currentReadingText}"
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-8">
                        {stageStatus === 'IDLE' && (
                            <Button size="lg" onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8">
                                <Mic className="w-5 h-5 mr-2" /> Start Recording
                            </Button>
                        )}
                        {stageStatus === 'RECORDING' && (
                            <Button size="lg" onClick={stopRecording} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-8 animate-pulse">
                                <div className="w-3 h-3 bg-red-600 rounded-full mr-2" /> Stop Recording
                            </Button>
                        )}
                        {stageStatus === 'COMPLETED' && (
                            <div className="flex gap-4 w-full justify-end">
                                <Button variant="outline" onClick={() => setStageStatus('IDLE')}>Reread</Button>
                                <Button size="lg" onClick={() => setCurrentStage('EXTEMPORE')} className="bg-slate-900 text-white">
                                    Next Stage <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );

    const ExtemporeStage = () => (
        <div className="flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full min-h-[80vh]">
            <Card className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-0 ring-1 ring-black/5 relative">
                <div className="bg-slate-900 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <div className="p-12 text-center max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold tracking-wider uppercase">Extempore Round</span>
                        <h2 className="text-4xl font-bold text-slate-900">"{extemporeTopic}"</h2>
                        <p className="text-slate-500">Speak on this topic for 60 seconds. Coherence and vocabulary will be evaluated.</p>
                    </div>
                    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="128" cy="128" r="120" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                            <circle cx="128" cy="128" r="120" stroke={stageStatus === 'PREP' ? '#6366f1' : '#ec4899'} strokeWidth="8" fill="none"
                                strokeDasharray={2 * Math.PI * 120}
                                strokeDashoffset={2 * Math.PI * 120 * (1 - timeLeft / (stageStatus === 'PREP' ? 30 : 60))}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-bold tabular-nums text-slate-800">{timeLeft}</span>
                            <span className="text-sm font-medium uppercase text-slate-400 mt-2">{stageStatus === 'PREP' ? 'Prep Time' : 'Speaking Time'}</span>
                        </div>
                    </div>
                    {(stageStatus === 'COMPLETED') ? (
                        <Button size="lg" onClick={() => setCurrentStage('INTERVIEW')} className="bg-slate-900 text-white min-w-[200px] h-12 text-lg">
                            Start Interview <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    ) : (
                        <div className="h-12 flex items-center justify-center gap-2 text-slate-400">
                            {stageStatus === 'PREP' ? (
                                <><AlertCircle className="w-5 h-5" /> Think about key points to cover</>
                            ) : (
                                <><Mic className="w-5 h-5 text-red-500 animate-pulse" /> Recording in progress...</>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {currentStage === 'SYSTEM_CHECK' && <SystemCheckStage />}
            {currentStage === 'READING' && <ReadingStage />}
            {currentStage === 'EXTEMPORE' && <ExtemporeStage />}

            {currentStage === 'INTERVIEW' && (
                <div className="w-full h-full bg-black flex flex-col md:flex-row p-2 gap-4 overflow-hidden rounded-xl">
                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-700 items-center justify-center flex min-h-[300px]">
                            <div className="absolute top-4 left-4 z-20 flex gap-2">
                                <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md border",
                                    warnings > 0 ? "bg-red-500/20 border-red-500 text-red-400" : "bg-green-500/20 border-green-500 text-green-400")}>
                                    <ShieldAlert className="w-3 h-3" />
                                    {warnings > 0 ? `Warnings: ${warnings}/3` : "Proctoring Active"}
                                </div>
                                {!isFullScreen && (
                                    <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={enterFullScreen}>Enable Fullscreen</Button>
                                )}
                            </div>

                            <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
                                <div className={cn("w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-500/20 blur-xl transition-all duration-100",
                                    isSpeaking ? "scale-150 opacity-80" : "scale-100 opacity-30")} />
                                <div className={cn("absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-blue-500/30 transition-all duration-300",
                                    isSpeaking ? "scale-110 border-blue-400/50" : "scale-100")} />
                                <div className="absolute flex items-end justify-center gap-1 h-12 md:h-16">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={cn("w-1.5 md:w-2 bg-blue-400 rounded-full transition-all duration-100",
                                            isSpeaking ? "animate-[bounce_0.5s_infinite]" : "h-2")}
                                            style={{ height: isSpeaking ? `${Math.random() * 40 + 20}px` : '4px', animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                                <div className="absolute z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-800 flex items-center justify-center shadow-2xl border-4 border-gray-700">
                                    <span className="text-xl md:text-2xl font-bold text-gray-400">AI</span>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-xs md:text-sm backdrop-blur-md flex items-center gap-2">
                                Sarah (Interviewer)
                                {isSpeaking && <span className="flex gap-1 items-center">
                                    <span className="w-1 h-3 bg-green-500 animate-[bounce_1s_infinite]" />
                                    <span className="w-1 h-4 bg-green-500 animate-[bounce_1.2s_infinite]" />
                                    <span className="w-1 h-2 bg-green-500 animate-[bounce_0.8s_infinite]" />
                                </span>}
                            </div>
                        </div>

                        <div className="h-auto py-4 md:py-0 md:h-24 bg-gray-900 rounded-2xl flex flex-col md:flex-row items-center justify-between px-4 md:px-8 gap-4 shrink-0">
                            <div className="flex items-center gap-4 text-white w-full md:w-auto justify-center md:justify-start">
                                {isListening ? (
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Mic className="w-5 h-5 animate-pulse" />
                                        <span className="text-sm md:text-base">Listening...</span>
                                    </div>
                                ) : isSpeaking ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <Play className="w-5 h-5" />
                                        <span className="text-sm md:text-base">Sarah is speaking...</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 text-sm md:text-base">Idle</span>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 md:gap-6 w-full md:w-auto">
                                <Button onClick={handleAnswerManual} disabled={isSpeaking || isProcessing}
                                    className={cn("rounded-full px-6 py-4 md:px-8 md:py-6 text-base md:text-lg transition-all flex-1 md:flex-none", isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700")}>
                                    {isListening ? "Stop & Submit" : "Start Answering"}
                                </Button>
                                <Button variant="destructive" size="icon" disabled={isProcessing} className="rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0" onClick={() => handleEndCall()}>
                                    <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-80 flex flex-col gap-4 h-[300px] md:h-full shrink-0">
                        <div className="h-32 md:h-48 bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shrink-0">
                            <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">You</div>
                            <div className="absolute top-2 right-2 flex gap-1">
                                {warnings === 0 ? <BadgeCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>

                        <div className="flex-1 bg-gray-900 rounded-2xl p-4 flex flex-col border border-gray-800 min-h-0">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-800 mb-4 shrink-0">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-200 font-medium text-sm">Live Transcript</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm ${msg.role === 'interviewer' ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStage === 'FEEDBACK' && (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Assessment Complete</h2>
                        <p className="mt-4 text-gray-600">Generating performance report...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
