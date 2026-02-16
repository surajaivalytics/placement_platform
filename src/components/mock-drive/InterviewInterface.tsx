'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, Send, Bot, User, Play, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewInterfaceProps {
    round: any;
    enrollment: any;
}

export function InterviewInterface({ round, enrollment }: InterviewInterfaceProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleStart = async () => {
        setLoading(true);
        try {
            // Call API with empty answer to init
            const res = await fetch('/api/mock-drives/session/interview/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    roundId: round.id,
                    answerText: null
                })
            });

            const data = await res.json();
            if (data.question) {
                setMessages([{ role: 'ai', text: data.question }]);
                setIsStarted(true);
            }
        } catch (e) {
            toast.error('Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        const answer = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: answer }]);
        setLoading(true);

        try {
            const res = await fetch('/api/mock-drives/session/interview/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    roundId: round.id,
                    answerText: answer
                })
            });

            const data = await res.json();

            // Add Feedback if any (system message)
            if (data.feedback) {
                // Optional: Show feedback as a subtle toast or system note
                // setMessages(prev => [...prev, { role: 'system', text: `Feedback: ${data.feedback}` }]);
            }

            if (data.isComplete) {
                setIsComplete(true);
                setMessages(prev => [...prev, { role: 'ai', text: 'Thank you. The interview is now complete.' }]);
                setTimeout(() => {
                    router.push(`/placement/mock-drives/${enrollment.driveId}`);
                }, 3000);
            } else if (data.question) {
                setMessages(prev => [...prev, { role: 'ai', text: data.question }]);
            }
        } catch (e) {
            toast.error('Failed to submit answer');
            // Restore input?
            setInputValue(answer);
        } finally {
            setLoading(false);
        }
    };

    if (!isStarted && !loading && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">AI Technical Interview</h2>
                    <p className="text-slate-500 max-w-md mx-auto mt-2">
                        The AI will ask you a series of technical questions.
                        Answer clearly and concisely. You will receive real-time feedback.
                    </p>
                </div>
                <Button size="lg" onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-700">
                    <Play className="w-4 h-4 mr-2" /> Start Interview
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-4">
            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden bg-slate-50/50 border-slate-200">
                <CardContent className="h-full overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : msg.role === 'system' ? 'bg-orange-100 text-orange-600' : 'bg-white border text-slate-700'}`}>
                                {msg.role === 'ai' ? <Bot className="w-6 h-6" /> : msg.role === 'system' ? <AlertTriangle className="w-5 h-5" /> : <User className="w-6 h-6" />}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-white border-slate-100 text-slate-800 rounded-tl-none' :
                                msg.role === 'system' ? 'bg-orange-50 border-orange-100 text-orange-800 text-xs' :
                                    'bg-indigo-600 text-white rounded-tr-none'
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center animate-pulse">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div className="bg-white border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating answer...
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Input Area */}
            {!isComplete && (
                <div className="relative">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your answer here..."
                        className="min-h-[100px] pr-12 resize-none shadow-md border-slate-200 focus:ring-indigo-500 rounded-xl"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 h-10 w-10"
                        onClick={handleSubmit}
                        disabled={loading || !inputValue.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
