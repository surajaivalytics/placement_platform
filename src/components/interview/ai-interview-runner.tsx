"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter, useParams } from 'next/navigation';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Play, ShieldAlert, BadgeCheck, Volume2, ArrowRight, CheckCircle2, AlertCircle, MonitorPlay, Download, AlertTriangle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateQuestion, saveInterviewResult } from '@/app/actions/interview';
import { generateInterviewEvaluation } from '@/lib/interview-ai';
import { useProctoring } from "@/hooks/use-proctoring";
import { Progress } from "@/components/ui/progress";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

type AssessmentStage = 'SYSTEM_CHECK' | 'READING' | 'EXTEMPORE' | 'INTERVIEW' | 'REPORT' | 'FEEDBACK';
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
    topics?: string;
    companyContext?: string;
    enrollmentId?: string;
    roundId?: string;
}

export function AIInterviewRunner({
    interviewType,
    companyName,
    onFinish,
    topics,
    companyContext,
    enrollmentId,
    roundId
}: AIInterviewRunnerProps) {
    const router = useRouter();
    const params = useParams();

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
    const [selectedVideo, setSelectedVideo] = useState("");
    const [selectedAudio, setSelectedAudio] = useState("");

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
    const [interviewTimeLeft, setInterviewTimeLeft] = useState(1800); // 30 minutes
    const [showTranscript, setShowTranscript] = useState(false);
    const [evaluation, setEvaluation] = useState<any>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');

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
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (userVideoRef.current) {
            userVideoRef.current.srcObject = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    };

    const handleTerminated = (reason: string) => {
        stopMedia();
        toast.error(`Interview Terminated: ${reason}`);
        handleEndCall();
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

    const startMedia = async (videoDeviceId?: string, audioDeviceId?: string) => {
        try {
            // Stop previous media and clean up
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }

            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user",
                    ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {})
                },
                audio: {
                    ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {})
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setMicPermission(true);
            setCamPermission(true);

            if (videoRef.current) videoRef.current.srcObject = stream;
            if (userVideoRef.current) userVideoRef.current.srcObject = stream;

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

    // Handle device switching
    useEffect(() => {
        if (camPermission || micPermission) {
            startMedia(selectedVideo, selectedAudio);
        }
    }, [selectedVideo, selectedAudio]);

    useEffect(() => {
        startMedia();
        return () => stopMedia();
    }, []);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Re-attach camera stream to video elements whenever stage changes
    useEffect(() => {
        const attachStream = () => {
            if (streamRef.current) {
                if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                }
                if (userVideoRef.current && userVideoRef.current.srcObject !== streamRef.current) {
                    userVideoRef.current.srcObject = streamRef.current;
                }
            }
        };

        attachStream();
        // Also check on a small delay to handle mounting race conditions
        const timer = setTimeout(attachStream, 100);
        return () => clearTimeout(timer);
    }, [currentStage, micPermission, camPermission]);

    // Initial Stage Logic
    useEffect(() => {
        if (currentStage === 'READING') {
            // Optional: still keep the logic but we won't show it
            setCurrentReadingText(READING_PASSAGES[Math.floor(Math.random() * READING_PASSAGES.length)]);
            setStageStatus('IDLE');
        } else if (currentStage === 'EXTEMPORE') {
            setExtemporeTopic(EXTEMPORE_TOPICS[Math.floor(Math.random() * EXTEMPORE_TOPICS.length)]);
            setStageStatus('PREP');
            setTimeLeft(30);
        } else if (currentStage === 'INTERVIEW') {
            if (messages.length === 0) processTurn();
            startRecording(); // Start recording the main interview
            if (userVideoRef.current && streamRef.current) {
                userVideoRef.current.srcObject = streamRef.current;
            }
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

    // Interview Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentStage === 'INTERVIEW' && interviewTimeLeft > 0) {
            interval = setInterval(() => {
                setInterviewTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleEndCall();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [currentStage, interviewTimeLeft]);

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
    };

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
            if (enrollmentId && roundId) {
                // Use Persistence API
                const res = await fetch('/api/mock-drives/session/interview/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        enrollmentId,
                        roundId,
                        answerText: userResponse || null,
                        difficulty
                    })
                });

                if (!res.ok) throw new Error("Failed to submit answer");

                const data = await res.json();

                if (data.question) {
                    setMessages(prev => [...prev, { role: 'interviewer', text: data.question }]);
                    setPreviousQuestions(prev => [...prev, data.question]);
                    speak(data.question);
                } else if (data.isComplete) {
                    toast.success("Interview Completed!");
                    handleEndCall();
                }

            } else {
                // Use Stateless Server Action (Fallback/Practice Mode)
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
                    })),
                    topics,
                    companyContext
                });

                if (result.question) {
                    setMessages(prev => [...prev, { role: 'interviewer', text: result.question }]);
                    setPreviousQuestions(prev => [...prev, result.question]);
                    speak(result.question);
                } else {
                    handleEndCall();
                }
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
        if (isProcessing) return;
        stopListening();
        const finalAnswer = transcript.trim() || "[No clear audio captured]";
        setTranscript("");
        await processTurn(finalAnswer);
    };

    const handleEndCall = async () => {
        stopMedia();
        window.speechSynthesis.cancel();
        setIsGeneratingReport(true);
        setCurrentStage('REPORT');

        try {
            const result = await generateInterviewEvaluation(
                interviewType,
                companyName,
                previousQuestions,
                previousAnswers,
                messages.map(m => `${m.role === 'interviewer' ? 'Sarah' : 'Candidate'}: ${m.text}`).join('\n')
            );
            setEvaluation(result);

            if (roundId && enrollmentId) {
                await saveInterviewResult(roundId, enrollmentId, result, messages.map(m => `${m.role === 'interviewer' ? 'Sarah' : 'Candidate'}: ${m.text}`).join('\n'));
            }
        } catch (error) {
            console.error("Evaluation error:", error);
            toast.error("Failed to generate report.");
        } finally {
            setIsGeneratingReport(false);
        }
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
    const SystemCheckStage = () => {
        const [devices, setDevices] = useState<{ label: string, deviceId: string, kind: string }[]>([]);

        useEffect(() => {
            const getDevices = async () => {
                try {
                    // Try to get a temporary stream to trigger permission prompt if not already granted
                    if (!streamRef.current) {
                        await startMedia();
                    }

                    const devs = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devs.filter(d => d.kind === 'videoinput');
                    const audioDevices = devs.filter(d => d.kind === 'audioinput');

                    setDevices(devs.map(d => ({
                        label: d.label || (d.kind === 'videoinput' ? `Camera ${videoDevices.indexOf(d) + 1}` : `Microphone ${audioDevices.indexOf(d) + 1}`),
                        deviceId: d.deviceId,
                        kind: d.kind
                    })));

                    if (videoDevices.length > 0 && !selectedVideo) setSelectedVideo(videoDevices[0].deviceId);
                    if (audioDevices.length > 0 && !selectedAudio) setSelectedAudio(audioDevices[0].deviceId);
                } catch (err) {
                    console.error("Enumerate error:", err);
                }
            };
            getDevices();
            // Refresh on permission changes
            navigator.mediaDevices.ondevicechange = getDevices;
            return () => {
                navigator.mediaDevices.ondevicechange = null;
            };
        }, [camPermission, micPermission]);

        return (
            <div className="flex flex-col min-h-screen bg-[#0a192f] text-white">
                {/* Header */}
                <header className="h-16 px-8 flex items-center justify-between border-b border-gray-800 bg-[#0a192f]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-2xl tracking-tight text-white uppercase font-sans">Avalytics</span>
                        </div>
                        <div className="h-4 w-[1px] bg-gray-700 mx-2" />
                        <span className="text-gray-400 font-medium">{interviewType} Interview</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-semibold">{companyName}</p>
                            <p className="text-[10px] text-gray-500">Mock Drive Session</p>
                        </div>
                        <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                            <AvatarFallback className="bg-blue-600 text-[10px]">SK</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center p-6 bg-[#0a192f] overflow-y-auto">
                    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-center">
                        {/* Camera Preview */}
                        <div className="w-full md:w-3/5">
                            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/10 group">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                {!camPermission && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm space-y-4">
                                        <div className="p-4 bg-red-500/10 rounded-full">
                                            <VideoOff className="w-8 h-8 text-red-500" />
                                        </div>
                                        <p className="text-gray-400 font-medium text-white">Camera access required</p>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-xs font-medium border border-white/10 text-white">
                                        Preview
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Setup Controls */}
                        <div className="w-full md:w-2/5 space-y-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-4 tracking-tight text-white">Device Setup</h1>
                                <p className="text-gray-400 leading-relaxed">Ensure your camera and microphone are working correctly before starting the interview.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Camera</label>
                                    <select
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer text-white"
                                        value={selectedVideo}
                                        onChange={(e) => setSelectedVideo(e.target.value)}
                                    >
                                        {devices.filter(d => d.kind === 'videoinput' && d.deviceId).map(d => (
                                            <option key={`${d.kind}-${d.deviceId}`} value={d.deviceId} className="bg-gray-900 text-white">{d.label || 'Unknown Camera'}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mic</label>
                                    <select
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer text-white"
                                        value={selectedAudio}
                                        onChange={(e) => setSelectedAudio(e.target.value)}
                                    >
                                        {devices.filter(d => d.kind === 'audioinput' && d.deviceId).map(d => (
                                            <option key={`${d.kind}-${d.deviceId}`} value={d.deviceId} className="bg-gray-900 text-white">{d.label || 'Unknown Microphone'}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Volume2 className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Audio Level</p>
                                            <p className="text-[10px] text-gray-500">Checking microphone sensitivity</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 h-6 items-end">
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn("w-1 rounded-full transition-all duration-75", audioLevel > (i * 12.5) ? "bg-blue-500" : "bg-gray-800")}
                                                style={{ height: `${20 + (i * 10)}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={cn(
                                                "px-4 py-3 rounded-xl text-sm font-bold transition-all border",
                                                difficulty === level
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                    : "bg-gray-900/50 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
                                            )}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 italic">Interview questions will adapt based on the selected level.</p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 font-bold shadow-xl shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={!micPermission || !camPermission}
                                onClick={() => setCurrentStage('INTERVIEW')}
                            >
                                Continue to Interview
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        );
    };


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
        <div className="fixed inset-0 overflow-hidden bg-[#0a192f] font-sans text-slate-900 icon-fix">
            {currentStage === 'SYSTEM_CHECK' && <SystemCheckStage />}
            {/* READING and EXTEMPORE stages are skipped for direct interview start */}
            {/* {currentStage === 'READING' && <ReadingStage />} */}
            {/* {currentStage === 'EXTEMPORE' && <ExtemporeStage />} */}

            {currentStage === 'INTERVIEW' && (
                <div className="flex flex-col h-full bg-[#0a192f] text-white">
                    {/* Top Header */}
                    <header className="h-16 px-8 flex items-center justify-between border-b border-gray-800 bg-[#0a192f]/50 backdrop-blur-md z-30 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-2xl tracking-tight text-white line-clamp-1">{companyName}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-gray-700 mx-2" />
                            <span className="text-gray-400 font-medium truncate line-clamp-1">{interviewType} Interview</span>
                        </div>

                        {/* Proctoring Status + Warning */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                            <div className={cn("flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-lg border",
                                warnings > 0 ? "border-red-500/50 text-red-500" : "border-green-500/50 text-green-500")}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", warnings > 0 ? "bg-red-500 animate-pulse" : "bg-green-500")} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{warnings > 0 ? `Warnings: ${warnings}/3` : 'Recording Live'}</span>
                            </div>
                            <div className="px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 tabular-nums">{formatTime(interviewTimeLeft)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold">{companyName}</p>
                                <p className="text-[10px] text-gray-500 truncate max-w-[120px]">Sujal Sadanand Khedekar</p>
                            </div>
                            <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                                <AvatarFallback className="bg-blue-600 text-[10px]">SK</AvatarFallback>
                            </Avatar>
                        </div>
                    </header>

                    {/* Main Stage */}
                    <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative min-h-0">
                        <div className="w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
                            {/* Sarah (AI) */}
                            <div className="w-full md:flex-1 aspect-video md:aspect-auto md:h-[60vh] md:max-h-[600px] bg-gray-900/40 rounded-3xl border border-white/5 relative overflow-hidden group shadow-2xl transition-all duration-500 hover:border-blue-500/20">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-black/60 pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* AI Visualizer Overlay */}
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className={cn("w-32 h-32 md:w-48 md:h-48 rounded-full bg-blue-500/10 blur-3xl transition-all duration-300",
                                            isSpeaking ? "scale-150 opacity-100" : "scale-100 opacity-20")} />

                                        <div className="absolute inset-0 w-full h-full">
                                            <img
                                                src="/image.png"
                                                alt="Sarah"
                                                className="w-full h-full object-cover grayscale-[0.2]"
                                            />
                                        </div>

                                        {/* Speaking Indicator Component */}
                                        <div className="absolute bottom-12 flex items-center justify-center gap-1.5 h-8">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn("w-1.5 bg-blue-400 rounded-full transition-all duration-300",
                                                        isSpeaking ? "bg-blue-400" : "bg-gray-600 h-1.5")}
                                                    style={{
                                                        height: isSpeaking ? `${Math.max(6, Math.random() * 24)}px` : '6px',
                                                        transitionDelay: `${i * 50}ms`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <span className="text-sm font-semibold tracking-wide text-white/90">Sarah (AI Interviewer)</span>
                                    {isSpeaking && (
                                        <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[10px] font-bold text-green-400 animate-pulse uppercase tracking-widest">
                                            Speaking
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Candidate (User) */}
                            <div className="w-full md:flex-1 aspect-video md:aspect-auto md:h-[60vh] md:max-h-[600px] bg-gray-900 rounded-3xl border-2 border-blue-500 relative overflow-hidden shadow-2xl ring-4 ring-blue-500/10 transition-all duration-500">
                                <video ref={userVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                    <span className="text-sm font-semibold tracking-wide text-white/90">Sujal Sadanand Khedekar</span>
                                    {!isSpeaking && isListening && (
                                        <div className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-bold text-blue-400 animate-pulse uppercase tracking-widest">
                                            Listening
                                        </div>
                                    )}
                                </div>
                                {/* Speaker status indicator */}
                                <div className="absolute bottom-6 right-6 flex items-center justify-center gap-1.5 h-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn("w-1 bg-white rounded-full transition-all duration-300",
                                                !isSpeaking && isListening ? "h-4" : "h-1 bg-white/40")}
                                            style={{
                                                height: !isSpeaking && isListening ? `${4 + Math.random() * 12}px` : '4px',
                                                transitionDelay: `${i * 100}ms`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Transcript Toggle */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40">
                            <Button
                                size="icon"
                                variant="outline"
                                className={cn("h-12 w-12 rounded-full transition-all border-gray-800 shadow-xl backdrop-blur-md",
                                    showTranscript ? "bg-blue-600 text-white border-blue-500 scale-110" : "bg-[#0a192f]/50 text-gray-400 hover:bg-gray-800 hover:text-white")}
                                onClick={() => setShowTranscript(!showTranscript)}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Transcript Panel */}
                        {showTranscript && (
                            <div className="absolute right-24 top-1/2 -translate-y-1/2 w-80 max-h-[60vh] bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white/90">Live Transcript</h3>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto space-y-4 scrollbar-hide text-sm flex-1 font-medium text-gray-300 leading-relaxed">
                                    {messages.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-8">Waiting for conversation to start...</p>
                                    ) : (
                                        messages.map((m, i) => (
                                            <div key={i} className={cn("space-y-1", m.role === 'interviewer' ? "text-blue-400" : "text-white")}>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                                                    {m.role === 'interviewer' ? 'Sarah' : 'You'}
                                                </span>
                                                <p className="opacity-90">{m.text}</p>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Bottom Controls */}
                    <footer className="h-24 px-8 border-t border-gray-800 bg-[#0a192f]/50 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
                        <div className="w-1/4" />

                        <div className="flex items-center gap-4">
                            {!isSpeaking && isListening && (
                                <Button
                                    size="lg"
                                    className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-500/10 animate-pulse"
                                    onClick={() => handleAnswerManual()}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                                    Send Answer
                                </Button>
                            )}
                            <Button
                                size="lg"
                                className="h-12 px-10 bg-red-600/90 hover:bg-red-600 text-white rounded-xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-500/10"
                                onClick={() => handleEndCall()}
                            >
                                <PhoneOff className="w-5 h-5" />
                                End Interview
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn("h-12 w-12 rounded-xl transition-all",
                                    showTranscript ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800")}
                                onClick={() => setShowTranscript(!showTranscript)}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="w-1/4 flex justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-800 bg-transparent text-gray-400 hover:text-white rounded-lg h-9"
                                onClick={() => enterFullScreen()}
                            >
                                <MonitorPlay className="w-4 h-4 mr-2" />
                                Fullscreen
                            </Button>
                        </div>
                    </footer>
                </div>
            )}


            {currentStage === 'REPORT' && (
                <div className="fixed inset-0 z-[100] bg-white text-gray-900 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
                    {isGeneratingReport ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 mb-2">Sarah is analyzing your performance</p>
                                <p className="text-gray-500">Evaluating technical skills, communication, and context...</p>
                            </div>
                        </div>
                    ) : evaluation ? (
                        <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[80vh] animate-in zoom-in-95 duration-500">
                            {/* Left Side: Stats and Info */}
                            <div className="w-full md:w-1/2 p-10 md:p-12 border-r border-gray-100 flex flex-col">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full">Interview Result</span>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full">{companyName}</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 leading-tight">{interviewType} Round</h2>
                                    </div>
                                    <Button variant="outline" className="rounded-full border-gray-200 font-bold hover:bg-gray-50 flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        PDF
                                    </Button>
                                </div>

                                <div className="flex-1 flex items-center justify-center py-4">
                                    <div className="w-full h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                                { subject: 'Programming', A: evaluation.scores?.programmingFundamentals || 0, fullMark: 10 },
                                                { subject: 'OOP', A: evaluation.scores?.oopConcepts || 0, fullMark: 10 },
                                                { subject: 'DSA', A: evaluation.scores?.dsaBasics || 0, fullMark: 10 },
                                                { subject: 'SDLC', A: evaluation.scores?.sdlc || 0, fullMark: 10 },
                                                { subject: 'App Dev', A: evaluation.scores?.appDev || 0, fullMark: 10 },
                                                { subject: 'Debugging', A: evaluation.scores?.debugging || 0, fullMark: 10 },
                                                { subject: 'SQL', A: evaluation.scores?.sqlBasics || 0, fullMark: 10 },
                                                { subject: 'Collaboration', A: evaluation.scores?.collaboration || 0, fullMark: 10 },
                                            ]}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                                                <Radar
                                                    name="Performance"
                                                    dataKey="A"
                                                    stroke="#2563eb"
                                                    fill="#2563eb"
                                                    fillOpacity={0.1}
                                                    strokeWidth={3}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="mt-10 grid grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-2">Verdict</p>
                                        <p className={cn(
                                            "text-3xl font-black italic",
                                            evaluation.overallVerdict === 'Hire' ? "text-emerald-600" :
                                                evaluation.overallVerdict === 'Maybe' ? "text-amber-500" : "text-rose-600"
                                        )}>
                                            {evaluation.overallVerdict?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl shadow-gray-200">
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-2">Hireability Score</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-4xl font-black text-white">{evaluation.scores?.overallHireability || 0}</p>
                                            <p className="text-gray-400 font-bold">/10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Detailed Feedback */}
                            <div className="w-full md:w-1/2 p-10 md:p-12 bg-gray-50/50 flex flex-col gap-10">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                                        </div>
                                        Key Strengths
                                    </h3>
                                    <div className="space-y-4">
                                        {evaluation.strengths?.map((s: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <AlertCircle className="text-amber-600 w-5 h-5" />
                                        </div>
                                        Areas for Improvement
                                    </h3>
                                    <div className="space-y-4">
                                        {evaluation.weaknesses?.map((w: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                <p className="text-sm text-gray-600 font-medium leading-relaxed">{w}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 flex gap-4">
                                    <Button
                                        onClick={() => {
                                            if (onFinish) onFinish();
                                            else router.push(`/placement/mock-drives/${params.id}`);
                                        }}
                                        className="flex-1 bg-gray-900 hover:bg-black text-white h-14 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Return to Placement Cell
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-12 bg-white rounded-3xl border border-gray-200 shadow-xl max-w-sm">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-rose-600 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                            <p className="text-gray-500 mb-8 font-medium">We couldn't generate the report right now. Don't worry, your interview data is safe.</p>
                            <Button
                                onClick={() => handleEndCall()}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                            >
                                Retry Analysis
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
