"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Play, RefreshCw } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type InterviewState = 'lobby' | 'connecting' | 'active' | 'ended';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const INTERVIEW_QUESTIONS = [
    "Hello! I am Sarah, your technical interviewer for today. Could you please introduce yourself?",
    "That's great. Can you explain the difference between a process and a thread?",
    "Interesting. Now, what is the time complexity of a binary search algorithm?",
    "Okay. Can you describe a challenging project you've worked on and how you handled it?",
    "Last question. Why do you want to join our organization?",
    "Thank you for your time. We will get back to you shortly with the results. You may leave the meeting now."
];

export default function InterviewPage() {
    const router = useRouter();
    const [state, setState] = useState<InterviewState>('lobby');
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [messages, setMessages] = useState<{ role: 'system' | 'interviewer' | 'user', text: string }[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 means not started
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mock Camera Access
    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthesisRef.current = window.speechSynthesis;
        }

        if (state === 'lobby' || state === 'active') {
            startCamera();
        }
        return () => stopCamera();
    }, [state]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        // Cancel speech if leaving
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
    };

    const speak = (text: string) => {
        if (!synthesisRef.current) return;

        // Cancel any current speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Try to pick a female voice
        const voices = synthesisRef.current.getVoices();
        const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google US English"));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsListening(true); // Auto-switch to "listening" state after speaking
        };

        synthesisRef.current.speak(utterance);
    };

    const handleJoin = () => {
        setState('connecting');
        setTimeout(() => {
            setState('active');
            setCurrentQuestionIndex(0);
            const firstQ = INTERVIEW_QUESTIONS[0];
            setMessages(prev => [...prev, { role: 'interviewer', text: firstQ }]);
            // Give a slight delay before speaking so the user sees the interface first
            setTimeout(() => speak(firstQ), 1000);
        }, 3000);
    };

    const handleNextQuestion = () => {
        setIsListening(false);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < INTERVIEW_QUESTIONS.length) {
            setCurrentQuestionIndex(nextIndex);
            const nextQ = INTERVIEW_QUESTIONS[nextIndex];
            setMessages(prev => [...prev, { role: 'interviewer', text: nextQ }]);
            speak(nextQ);
        } else {
            // End of interview
            speak("Thank you for attending.");
        }
    };

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Capture one sentence/answer at a time
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log("Transcript:", transcript);
                    setMessages(prev => [...prev, { role: 'user', text: transcript }]);
                    setIsListening(false);
                    setTimeout(handleNextQuestion, 1000);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const handleAnswer = () => {
        if (isListening) {
            // If manual stop is clicked
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        // Start Listening
        setIsListening(true);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                toast.info("Listening... Speak now!");
            } catch (e) {
                console.error("Could not start recognition", e);
                // Fallback for demo or if mic fails
                setMessages(prev => [...prev, { role: 'user', text: "I have experience with React and Node.js working on scalable web applications." }]);
                setIsListening(false);
                setTimeout(handleNextQuestion, 1500);
            }
        } else {
            // Fallback if browser doesn't support STT
            toast.error("Speech Recognition not supported in this browser.");
            setMessages(prev => [...prev, { role: 'user', text: "(Browser does not support Speech-to-Text)" }]);
            setIsListening(false);
            setTimeout(handleNextQuestion, 1500);
        }
    };

    const handleEndCall = () => {
        setState('ended');
        stopCamera();
        localStorage.setItem('tcsInterviewCompleted', 'true');
    };

    const handleExit = () => {
        router.push('/tcs-portal');
    };

    if (state === 'lobby') {
        return (
            <div className="min-h-screen bg-[#181C2E] flex items-center justify-center p-4">
                <Card className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]">
                    {/* Video Preview */}
                    <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center">
                        <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                        {!camOn && <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500">Camera Off</div>}

                        <div className="absolute bottom-6 flex gap-4 z-10">
                            <Button
                                variant={micOn ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={() => setMicOn(!micOn)}
                            >
                                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </Button>
                            <Button
                                variant={camOn ? "secondary" : "destructive"}
                                size="icon"
                                className="rounded-full w-12 h-12"
                                onClick={() => setCamOn(!camOn)}
                            >
                                {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-[#181C2E] mb-2">Technical Interview Round</h2>
                            <p className="text-gray-500 mb-6">TCS National Qualifier Test 2026</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://ui.shadcn.com/avatars/04.png" />
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900">Interviewer: Sarah (AI)</p>
                                        <p className="text-xs">Senior Technical Lead</p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed">
                                    Please ensure you are in a quiet room with good lighting. The AI interviewer will interact with you verbally.
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-lg font-medium" onClick={handleJoin}>
                                Join Room
                            </Button>
                            <Button variant="ghost" className="w-full text-gray-500" onClick={() => router.back()}>
                                Go Back
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (state === 'connecting') {
        return (
            <div className="min-h-screen bg-[#181C2E] flex flex-col items-center justify-center text-white space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg animate-pulse">Connecting to Interviewer...</p>
            </div>
        )
    }

    if (state === 'ended') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-[#181C2E]">Interview Ended</h2>
                    <p className="text-gray-500">Thank you for attending the session. HR will reach out to you shortly.</p>
                    <Button onClick={handleExit} className="bg-[#181C2E] text-white px-8">Return to Portal</Button>
                </div>
            </div>
        )
    }

    // Active State
    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row p-4 gap-4">
            {/* Main Video Area */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Interviewer Video Area */}
                <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700 items-center justify-center flex">
                    {/* Fallback Image or Video */}
                    <video
                        src="https://videos.pexels.com/video-files/7710317/7710317-hd_1920_1080_25fps.mp4"
                        className={cn("w-full h-full object-cover object-center transition-opacity duration-300", isSpeaking ? "opacity-100" : "opacity-90")}
                        autoPlay
                        loop
                        muted
                    />

                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm backdrop-blur-md flex items-center gap-2">
                        Sarah (Interviewer)
                        {isSpeaking && <span className="flex gap-1 items-center">
                            <span className="w-1 h-3 bg-green-500 animate-[bounce_1s_infinite]" />
                            <span className="w-1 h-4 bg-green-500 animate-[bounce_1.2s_infinite]" />
                            <span className="w-1 h-2 bg-green-500 animate-[bounce_0.8s_infinite]" />
                        </span>}
                    </div>

                    {/* Speaking Indicator/Overlay */}
                    {isSpeaking && (
                        <div className="absolute inset-0 border-[6px] border-green-500/30 pointer-events-none animate-pulse rounded-2xl" />
                    )}
                </div>

                {/* Controls Bar */}
                <div className="h-24 bg-gray-900 rounded-2xl flex items-center justify-between px-8">
                    <div className="flex items-center gap-4 text-white">
                        {isListening ? (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Mic className="w-5 h-5 animate-pulse" />
                                <span>Listening...</span>
                            </div>
                        ) : isSpeaking ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <Play className="w-5 h-5" />
                                <span>Sarah is speaking...</span>
                            </div>
                        ) : (
                            <span className="text-gray-500">Idle</span>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <Button
                            onClick={handleAnswer}
                            disabled={isSpeaking}
                            className={cn("rounded-full px-8 py-6 text-lg transition-all", isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700")}
                        >
                            {isListening ? "Stop & Submit Answer" : "Answer Question"}
                        </Button>
                    </div>

                    <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={handleEndCall}>
                        <PhoneOff className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Sidebar (Self View + Chat) */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                {/* Self View */}
                <div className="h-48 bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-700">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">You</div>
                </div>

                {/* Chat / Transcript */}
                <div className="flex-1 bg-gray-900 rounded-2xl p-4 flex flex-col border border-gray-800 min-h-0">
                    <div className="flex items-center gap-2 pb-4 border-b border-gray-800 mb-4 shrink-0">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 font-medium text-sm">Live Transcript</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'interviewer' ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
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
