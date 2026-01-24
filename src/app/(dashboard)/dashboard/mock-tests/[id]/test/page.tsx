"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Save, Flag, Clock, AlertTriangle, ListFilter, Terminal, Play, Send, CheckCircle2 } from "lucide-react";
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useProctoring } from "@/hooks/use-proctoring";
import { logMonitoringEvent } from "@/app/actions/monitoring";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import Loader from "@/components/ui/loader"; // Assuming a Loader component exists, or I'll implement a simple one

const LANGUAGES = [
    { id: "python", name: "Python", version: "3.10.0", fileExt: "py" },
    { id: "java", name: "Java", version: "15.0.2", fileExt: "java" },
    { id: "c++", name: "C++", version: "10.2.0", fileExt: "cpp" },
    { id: "c", name: "C", version: "10.2.0", fileExt: "c" },
    { id: "javascript", name: "JavaScript", version: "18.15.0", fileExt: "js" },
];

const DEFAULT_CODE: Record<string, string> = {
    python: `def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
    "c++": `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    javascript: `// Write your code here\nconsole.log("Hello World");`
};

export default function MockTestRunnerPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // valid option ID or code
    const [markedForReview, setMarkedForReview] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);

    // Coding state
    const [code, setCode] = useState(DEFAULT_CODE['python']);
    const [language, setLanguage] = useState("python");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [verdict, setVerdict] = useState<"Passed" | "Failed" | null>(null);

    // Fetch Test Data
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(`/api/tests/${testId}`);
                if (!res.ok) throw new Error("Failed to load test");
                const data = await res.json();
                setTest(data);
                setQuestions(data.questions || []);
                setTimeLeft(data.duration * 60);

                // Initialize Code if first question is coding (optional, usually first is MCQ)
            } catch (error) {
                console.error("Error fetching test:", error);
                toast.error("Failed to load test parameters.");
                router.push("/dashboard/mock-tests");
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [testId, router]);

    // Timer Logic
    useEffect(() => {
        if (!timeLeft) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Proctoring
    const { warnings, isFullScreen, enterFullScreen } = useProctoring({
        preventTabSwitch: true,
        preventContextMenu: true,
        preventCopyPaste: true,
        forceFullScreen: true,
        onViolation: async (type, msg) => {
            toast.error(msg, { duration: 4000 });
            await logMonitoringEvent(testId, type, msg);
        }
    });

    const currentQuestion = questions[currentQuestionIndex];

    // Parse coding metadata safely
    const getCodingMetadata = (q: any) => {
        if (q.type !== 'coding' || !q.metadata) return null;
        try {
            return JSON.parse(q.metadata);
        } catch (e) {
            return {};
        }
    };

    const handleOptionSelect = (val: string) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
    };

    const toggleMarkReview = () => {
        setMarkedForReview(prev =>
            prev.includes(currentQuestion.id)
                ? prev.filter(id => id !== currentQuestion.id)
                : [...prev, currentQuestion.id]
        );
    };

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        // Reset code to default if needed or keep existing
        if (!answers[currentQuestion.id]) {
            setCode(DEFAULT_CODE[val] || "");
        }
    };

    const runCode = async () => {
        const metadata = getCodingMetadata(currentQuestion);
        if (!metadata || !metadata.testCases || metadata.testCases.length === 0) {
            toast.error("No test cases defined for this problem.");
            return;
        }

        setIsRunning(true);
        setOutput("Compiling and Executing...");
        setVerdict(null);

        try {
            const langConfig = LANGUAGES.find(l => l.id === language);
            const sampleTestCase = metadata.testCases[0]; // Run against first test case for checking

            const response = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: langConfig?.id,
                    version: langConfig?.version,
                    files: [{ content: code }],
                    stdin: sampleTestCase.input
                })
            });

            const data = await response.json();

            if (data.run) {
                const rawOutput = data.run.output?.trim();
                setOutput(rawOutput || (data.run.stderr ? `Error:\n${data.run.stderr}` : "No Output"));

                // Simple Verdict Check
                // Normalize output (trim whitespace/newlines)
                if (rawOutput == sampleTestCase.output?.trim()) {
                    setVerdict("Passed");
                    toast.success("Sample Test Case Passed!");
                } else {
                    setVerdict("Failed");
                    toast.error("Sample Test Case Failed");
                }
            } else {
                setOutput("Execution Error");
            }
        } catch (error) {
            setOutput("Failed to connect to execution engine.");
        } finally {
            setIsRunning(false);
        }
    };

    const saveCodingAnswer = () => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: code }));
        toast.success("Code saved locally. Proceed to next question.");
    };

    const handleSubmitTest = () => {
        // Here we would submit 'answers' to the backend
        console.log("Submitting Answers:", answers);
        toast.success("Test Submitted Successfully!");

        // Save result locally or via API
        // For now, redirect to dashboard
        router.push('/dashboard/mock-tests');
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Test...</div>;

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
        )
    }

    const isCoding = currentQuestion?.type === 'coding' || currentQuestion?.type === 'code'; // Handle 'code' typo possibility from parsing? No, safe to stick to 'coding'

    return (
        <div className="fixed inset-0 bg-gray-100 flex flex-col z-[99999] overflow-hidden select-none">
            {/* Warning Banner */}
            {warnings > 0 && (
                <div className="bg-red-500 text-white px-4 py-1 text-xs text-center font-mono animate-pulse">
                    WARNING: {warnings} Security Violations Recorded.
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-2 flex justify-between items-center shadow-sm z-10 shrink-0 h-16">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-[#181C2E] flex items-center gap-2">
                        {isCoding ? <Terminal className="w-4 h-4 text-gray-500" /> : <ListFilter className="w-4 h-4 text-gray-500" />}
                        {isCoding ? 'Hands-on Coding' : `Section: ${currentQuestion?.category || 'General'}`}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-mono">
                        Q.{currentQuestionIndex + 1}/{questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#181C2E] font-mono font-bold text-lg bg-gray-100 px-3 py-1 rounded border border-gray-300">
                        <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                        {formatTime(timeLeft)}
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleSubmitTest}>Finish Test</Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Area */}
                <div className={`flex-1 flex ${isCoding ? 'bg-white' : 'p-6 md:p-10 overflow-y-auto'}`}>

                    {isCoding ? (
                        // CODING UI
                        (() => {
                            const metadata = getCodingMetadata(currentQuestion);
                            return (
                                <div className="flex w-full h-full">
                                    {/* Left: Problem */}
                                    <div className="w-1/3 bg-white border-r p-6 overflow-y-auto">
                                        <h1 className="text-xl font-bold mb-4">{currentQuestion.text}</h1>
                                        <div className="prose text-sm text-gray-600 whitespace-pre-wrap font-sans mb-6">
                                            {/* Description often in metadata in my new schema design, but text is primary prompt */}
                                            {currentQuestion.text}
                                        </div>

                                        {metadata && (
                                            <>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Input Format</div>
                                                <p className="text-sm text-gray-700 mb-4">{metadata.inputFormat}</p>

                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Output Format</div>
                                                <p className="text-sm text-gray-700 mb-4">{metadata.outputFormat}</p>

                                                <div className="mt-8 bg-gray-50 p-4 rounded-lg border">
                                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sample Test Case</h3>
                                                    <div className="text-xs font-semibold text-gray-400 mb-1">Input</div>
                                                    <code className="text-sm block bg-white p-2 border rounded mb-4 whitespace-pre">{metadata.testCases?.[0]?.input}</code>
                                                    <div className="text-xs font-semibold text-gray-400 mb-1">Output</div>
                                                    <code className="text-sm block bg-white p-2 border rounded whitespace-pre">{metadata.testCases?.[0]?.output}</code>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Right: Editor */}
                                    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                                        <div className="bg-[#2d2d2d] p-2 flex justify-between items-center border-b border-gray-700">
                                            <Select value={language} onValueChange={handleLanguageChange}>
                                                <SelectTrigger className="w-[180px] h-8 bg-[#3d3d3d] border-gray-600 text-gray-200">
                                                    <SelectValue placeholder="Select Language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LANGUAGES.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-white border-0" onClick={runCode} disabled={isRunning}>
                                                    <Play className="w-3 h-3 mr-2" /> {isRunning ? 'Running...' : 'Run'}
                                                </Button>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-white border-0" onClick={() => {
                                                    saveCodingAnswer();
                                                    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(c => c + 1);
                                                }}>
                                                    <Send className="w-3 h-3 mr-2" /> Save & Next
                                                </Button>
                                            </div>
                                        </div>
                                        <textarea
                                            className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
                                            spellCheck={false}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                        <div className="h-1/3 min-h-[150px] bg-[#0f0f0f] border-t border-gray-700 flex flex-col">
                                            <div className="px-4 py-2 bg-[#1a1a1a] text-xs font-bold text-gray-400 border-b border-gray-800 flex justify-between">
                                                <span>CONSOLE OUTPUT</span>
                                                {verdict && <span className={verdict === "Passed" ? "text-green-500" : "text-red-500"}>Status: {verdict}</span>}
                                            </div>
                                            <ScrollArea className="flex-1 p-4 font-mono text-sm text-gray-300">
                                                <pre>{output || "Run your code to see output..."}</pre>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        // MCQ UI
                        <div className="max-w-4xl mx-auto">
                            <Card className="min-h-[400px] border-0 shadow-md">
                                <div className="p-6 md:p-8 space-y-8">
                                    <div className="space-y-4">
                                        <span className="text-gray-500 font-medium">Question {currentQuestionIndex + 1}</span>
                                        <p className="text-lg md:text-xl font-medium text-gray-900 leading-relaxed">
                                            {currentQuestion?.text}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            {currentQuestion?.options?.map((opt: any) => (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => handleOptionSelect(opt.id)}
                                                    className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer hover:bg-gray-50 ${answers[currentQuestion.id] === opt.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${answers[currentQuestion.id] === opt.id ? 'border-blue-600' : 'border-gray-400'}`}>
                                                        {answers[currentQuestion.id] === opt.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                                    </div>
                                                    <Label className="flex-1 cursor-pointer font-normal text-base pointer-events-none">{opt.text}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-between items-center mt-8">
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-gray-600"
                                        disabled={currentQuestionIndex === 0}
                                        onClick={() => setCurrentQuestionIndex(c => c - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`${markedForReview.includes(currentQuestion.id) ? 'bg-amber-100 text-amber-700 border-amber-300' : 'text-amber-600 border-amber-200 hover:bg-amber-50'}`}
                                        onClick={toggleMarkReview}
                                    >
                                        <Flag className={`w-4 h-4 mr-2 ${markedForReview.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                                        {markedForReview.includes(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
                                    </Button>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]" onClick={() => {
                                        if (currentQuestionIndex < questions.length - 1) {
                                            setCurrentQuestionIndex(c => c + 1);
                                        } else {
                                            handleSubmitTest(); // Last question
                                        }
                                    }}>
                                        <Save className="w-4 h-4 mr-2" /> {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Save & Next'}
                                    </Button>
                                </div>
                                <Button
                                    variant="default"
                                    className="bg-[#181C2E] hover:bg-gray-800"
                                    onClick={() => {
                                        if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(c => c + 1);
                                    }}
                                >
                                    Skip <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (Palette) */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col hidden md:flex shrink-0">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-800 mb-4">Question Palette</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div> Answered</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-300"></div> Not Visited</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div> Marked</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-blue-600"></div> Current</div>
                        </div>
                    </div>

                    <div className="flex-1 p-4">
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isCurrent = currentQuestionIndex === idx;
                                const isAnswered = !!answers[q.id];
                                const isMarked = markedForReview.includes(q.id);

                                let bgClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
                                if (isMarked) bgClass = "bg-amber-500 text-white hover:bg-amber-600";
                                else if (isAnswered) bgClass = "bg-green-500 text-white hover:bg-green-600";
                                if (isCurrent) bgClass += " ring-2 ring-blue-600 ring-offset-2 z-10";

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-10 w-10 text-sm font-medium rounded-md flex items-center justify-center transition-all ${bgClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <Button className="w-full bg-[#181C2E] hover:bg-gray-800" onClick={handleSubmitTest}>
                            Submit Final Test
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
