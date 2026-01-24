"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateQuestion } from '@/app/actions/interview';

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
    const [state, setState] = useState<InterviewState>('lobby');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [messages, setMessages] = useState<{ role: 'system' | 'interviewer' | 'user', text: string }[]>([]);

    // AI State
    const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
    const [previousAnswers, setPreviousAnswers] = useState<string[]>([]);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopCamera();
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // User Camera
    useEffect(() => {
        if (state === 'lobby' || state === 'active') {
            startCamera();
        } else {
            stopCamera();
        }
    }, [state]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            toast.error("Could not access camera/microphone");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // Browser TTS Logic
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice =>
                voice.name.includes('Google UK English Female') ||
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Female')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            } else {
                const fallback = voices.find(v => v.lang === 'en-US' && !v.name.includes('Male'));
                if (fallback) utterance.voice = fallback;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), 3000);
        }
    };

    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }, []);

    const processTurn = async (newAnswer?: string) => {
        setIsProcessing(true);
        setIsListening(false);

        try {
            const currentAnswers = newAnswer ? [...previousAnswers, newAnswer] : previousAnswers;

            const result = await generateQuestion({
                companyType: companyName || 'TCS',
                interviewType: interviewType,
                currentQuestionIndex: previousQuestions.length,
                previousQuestions: previousQuestions,
                previousAnswers: currentAnswers,
                conversationHistory: []
            });

            const nextQuestion = result.question;

            if (newAnswer) {
                setPreviousAnswers(prev => [...prev, newAnswer]);
            }
            setPreviousQuestions(prev => [...prev, nextQuestion]);
            setMessages(prev => [...prev, { role: 'interviewer', text: nextQuestion }]);

            speak(nextQuestion);

            if (nextQuestion.includes("concludes the interview") || nextQuestion.includes("Thank you for taking the time")) {
                setTimeout(() => handleEndCall(), 10000);
            }

        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Failed to generate response");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleJoin = async () => {
        setState('connecting');
        setTimeout(() => {
            setState('active');
            setTimeout(() => {
                processTurn();
            }, 1000);
        }, 1500);
    };

    // Speech Recognition
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const resetSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
                const silenceMsg = "Please take your time. You may continue when you are ready.";
                speak(silenceMsg);
            }
        }, 8000);
    };

    const startListening = () => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.start();
                        setIsListening(true);
                        resetSilenceTimer();
                        toast.info("Listening...");
                    } catch (e: any) { }
                }
            } else {
                toast.error("Speech recognition not supported in this browser.");
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setMessages(prev => [...prev, { role: 'user', text: transcript }]);
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    processTurn(transcript);
                };

                recognition.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        setIsListening(false);
                    }
                };

                recognitionRef.current = recognition;
            }
        }
    }, [previousQuestions, previousAnswers]);

    const handleAnswerManual = () => {
        if (isListening) {
            stopListening();
            return;
        }
        startListening();
    };

    const handleEndCall = async () => {
        setState('ended');
        stopCamera();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // We can call onFinish here or let user click button. 
        // Let's call it when user actively exits FROM ended screen?
        // Actually, let's keep the "Ended" screen shown within this component, 
        // and the "Return" button calls passed 'onFinish'.
    };

    if (state === 'lobby') {
        return (
            <div className="flex items-center justify-center p-4 w-full h-full bg-gray-50">
                <Card className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row h-auto md:h-[500px]">
                    <div className="w-full h-64 md:h-auto md:w-1/2 bg-black relative flex items-center justify-center">
                        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                        {!camOn && <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">Camera Off</div>}
                        <div className="absolute bottom-6 flex gap-4 z-10">
                            <Button variant={micOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setMicOn(!micOn)}>
                                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                            <Button variant={camOn ? "secondary" : "destructive"} size="icon" className="rounded-full w-12 h-12" onClick={() => setCamOn(!camOn)}>
                                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between gap-6 md:gap-0">
                        <div>
                            <h2 className="text-2xl font-bold text-[#181C2E] mb-2">{interviewType} Interview</h2>
                            <p className="text-gray-500 mb-6">AI-Driven Interactive Session</p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Avatar className="h-8 w-8"><AvatarImage src="/images/interviewer.jpg" /><AvatarFallback>AI</AvatarFallback></Avatar>
                                    <div><p className="font-medium text-gray-900">Interviewer: Sarah (AI)</p><p className="text-xs">Senior Technical Lead</p></div>
                                </div>
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed">
                                    Please ensure you are in a quiet room with good lighting. The interaction will be voice-based.
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Button className="w-full h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-lg font-medium" onClick={handleJoin}>Join Interview Room</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (state === 'connecting') {
        return (
            <div className="w-full h-full bg-[#181C2E] flex flex-col items-center justify-center text-white space-y-4 rounded-xl">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg animate-pulse">Connecting to AI Interviewer...</p>
            </div>
        )
    }

    if (state === 'ended') {
        return (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-[#181C2E]">Interview Completed</h2>
                    <p className="text-gray-500">Thank you for attending the session. Your responses have been recorded.</p>
                    <Button onClick={onFinish} className="bg-[#181C2E] text-white px-8">Continue to Next Stage</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-black flex flex-col md:flex-row p-2 gap-4 overflow-hidden rounded-xl">
            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-700 items-center justify-center flex min-h-[300px]">
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
                        <div className={cn(
                            "w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-500/20 blur-xl transition-all duration-100",
                            isSpeaking ? "scale-150 opacity-80" : "scale-100 opacity-30"
                        )} />

                        <div className={cn(
                            "absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-blue-500/30 transition-all duration-300",
                            isSpeaking ? "scale-110 border-blue-400/50" : "scale-100"
                        )} />

                        <div className="absolute flex items-end justify-center gap-1 h-12 md:h-16">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-1.5 md:w-2 bg-blue-400 rounded-full transition-all duration-100",
                                        isSpeaking ? "animate-[bounce_0.5s_infinite]" : "h-2"
                                    )}
                                    style={{
                                        height: isSpeaking ? `${Math.random() * 40 + 20}px` : '4px',
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                />
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

                {/* Controls Bar */}
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
                        <Button
                            onClick={handleAnswerManual}
                            disabled={isSpeaking}
                            className={cn("rounded-full px-6 py-4 md:px-8 md:py-6 text-base md:text-lg transition-all flex-1 md:flex-none", isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700")}
                        >
                            {isListening ? "Stop & Submit" : "Start Answering"}
                        </Button>

                        <Button variant="destructive" size="icon" className="rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0" onClick={handleEndCall}>
                            <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sidebar (Video + Chat) */}
            <div className="w-full md:w-80 flex flex-col gap-4 h-[300px] md:h-full shrink-0">
                <div className="h-32 md:h-48 bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 shrink-0">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">You</div>
                </div>

                <div className="flex-1 bg-gray-900 rounded-2xl p-4 flex flex-col border border-gray-800 min-h-0">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-800 mb-4 shrink-0">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 font-medium text-sm">Live Transcript</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-600 text-xs italic mt-10">
                                Conversation will appear here...
                            </div>
                        )}
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
    );
}
