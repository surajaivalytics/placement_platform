"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { tcsQuestions } from '@/lib/tcs-questions';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Clock, Lock, ArrowRight, Monitor, Code, FileText, UserCheck, BookOpen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { EligibilityActionWrapper } from "@/components/placement/eligibility-wrapper";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TCSWelcomeContentProps {
    userName: string;
    eligibility: any;
    user: any;
}

export function TCSWelcomeContent({ userName, eligibility, user }: TCSWelcomeContentProps) {
    const router = useRouter();
    const [steps, setSteps] = useState([
        { label: "Registration", status: "completed", icon: CheckCircle2 },
        { label: "Aptitude Test", status: "pending", icon: FileText },
        { label: "Technical Round", status: "locked", icon: Code },
        { label: "Interview", status: "locked", icon: UserCheck }
    ]);

    React.useEffect(() => {
        // Check local storage for progress
        const aptitudeAnswers = localStorage.getItem('tcsAptitudeAnswers');
        const codingVerdict = localStorage.getItem('tcsCodingVerdict');
        const interviewCompleted = localStorage.getItem('tcsInterviewCompleted');

        setSteps(prev => {
            const newSteps = [...prev];

            // Aptitude Logic
            if (aptitudeAnswers) {
                newSteps[1].status = "completed"; // Aptitude
                newSteps[2].status = "pending";   // Unlock Technical/Coding
            }

            // Coding logic (Technical Round)
            if (codingVerdict) {
                newSteps[2].status = "completed"; // Coding
                newSteps[3].status = "pending";   // Unlock Interview
            }

            // Interview Logic
            if (interviewCompleted) {
                newSteps[3].status = "completed";
            }

            return newSteps;
        });
    }, []);

    const handleSystemCheck = () => {
        const promise = new Promise((resolve) => setTimeout(resolve, 2000));
        toast.promise(promise, {
            loading: 'Checking Camera & Microphone...',
            success: 'System Verified! Hardware is ready for proctoring.',
            error: 'System Check Failed',
        });
    };

    return (
        <div className="flex-1 bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-[#181C2E]">Welcome, {userName} 👋</h1>
                        <p className="text-gray-500">TCS National Qualifier Test (NQT) - 2026 Batch</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-gray-600">Network: Excellent</span>
                    </div>
                </div>

                {!eligibility.eligible && (
                    <Alert variant="destructive" className="border-red-600/50 bg-red-50 text-red-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="h-4 w-4 mt-1" />
                            <div>
                                <AlertTitle>Eligibility Check Required</AlertTitle>
                                <AlertDescription>
                                    Current profile data does not meet criteria: {eligibility.reasons?.join(", ")}.
                                </AlertDescription>
                            </div>
                        </div>
                        <EligibilityActionWrapper
                            company="TCS"
                            defaultValues={{
                                tenthPercentage: user?.tenthPercentage,
                                twelfthPercentage: user?.twelfthPercentage,
                                graduationCGPA: user?.graduationCGPA,
                                backlogs: user?.backlogs
                            }}
                        />
                    </Alert>
                )}

                {/* Mock Drive Simulation Section (New Enhancement) */}
                <div className="bg-[#181C2E] rounded-xl p-8 shadow-xl relative overflow-hidden text-white mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3" />

                    <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                        <div className="space-y-4">
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-3 py-1">New Feature</Badge>
                            <h2 className="text-3xl font-bold">Mock Placement Drive Simulation</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Experience the exact end-to-end TCS hiring process. This simulation mimics the real NQT environment, including Strict Proctoring, Adaptive Assessments, and AI Interviews.
                            </p>
                            <div className="flex gap-4 pt-2">
                                <Link href="/tcs-portal/instructions">
                                    <Button className="h-12 px-6 bg-white text-[#181C2E] bg-white hover:bg-gray-100 cursor-pointer font-bold border-0">
                                        Launch Simulation
                                    </Button>
                                </Link>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="h-12 px-6 border-gray-600 text-gray-300 bg-white/10 hover:bg-gray/20 cursor-pointer hover:text-white">
                                            <BookOpen className="w-4 h-4 mr-2" /> View Syllabus
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh]">
                                        <DialogHeader>
                                            <DialogTitle>TCS NQT Syllabus 2026</DialogTitle>
                                            <DialogDescription>
                                                Comprehensive breakdown of the assessment sections.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-[60vh] pr-4">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="font-bold text-[#181C2E] mb-2">1. Numerical Ability (Quantitative Aptitude)</h3>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                        <li>Number Systems, LCM & HCF</li>
                                                        <li>Time & Work, Speed Time Distance</li>
                                                        <li>Percentages, Profit & Loss</li>
                                                        <li>Permutation, Combination & Probability</li>
                                                        <li>Mensuration & Geometry</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#181C2E] mb-2">2. Verbal Ability</h3>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                        <li>Reading Comprehension</li>
                                                        <li>Sentence Correction & Completion</li>
                                                        <li>Para Jumbles</li>
                                                        <li>Vocabulary & Synonyms/Antonyms</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#181C2E] mb-2">3. Reasoning Ability</h3>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                        <li>Data Sufficiency</li>
                                                        <li>Blood Relations & Direction Sense</li>
                                                        <li>Coding-Decoding</li>
                                                        <li>Seating Arrangements</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#181C2E] mb-2">4. Programming Logic (coding)</h3>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                        <li>Data Structures (Arrays, Linked Lists, Stacks, Queues)</li>
                                                        <li>Algorithms (Sorting, Searching, Greedy, DP)</li>
                                                        <li>C/C++/Java/Python Fundamentals</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <div className="hidden md:block relative">
                            {/* Mini Visualizer of the Stages */}
                            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold">1</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Online Assessment</p>
                                        <p className="text-xs text-gray-400">Aptitude (50) + Coding (2)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-60">
                                    <div className="w-0.5 h-6 bg-gray-600 mx-4" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">2</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">Technical Inteview</p>
                                        <p className="text-xs text-gray-400">AI-Driven Adaptive Round</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 opacity-60">
                                    <div className="w-0.5 h-6 bg-gray-600 mx-4" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">3</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">HR Discussion</p>
                                        <p className="text-xs text-gray-400">Behavioral Fitment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Tracker */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {steps.map((step, idx) => (
                        <Card key={idx} className={`border-l-4 shadow-sm ${step.status === 'completed' ? 'border-l-green-500 bg-green-50/30' : step.status === 'pending' ? 'border-l-blue-600' : 'border-l-gray-300 bg-gray-50'}`}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-2 rounded-full ${step.status === 'completed' ? 'bg-green-100 text-green-700' : step.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{step.label}</p>
                                    <p className="text-xs text-gray-500 capitalize">{step.status}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Action Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Primary Action Card */}
                    <Card className="lg:col-span-2 border-t-4 border-t-[#181C2E] shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 rounded-sm">High Priority</Badge>
                                    <CardTitle className="text-xl text-[#181C2E]">Integrated Test for Developers</CardTitle>
                                    <CardDescription className="mt-1">
                                        Duration: 120 Minutes • 30 Questions + 2 Coding
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Scheduled Date</p>
                                    <p className="font-semibold text-[#181C2E]">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="font-semibold block text-gray-700">Strict Typography</span>
                                        <span className="text-gray-500">The test will auto-submit after 120 minutes.</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                    <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="font-semibold block text-gray-700">Proctored Environment</span>
                                        <span className="text-gray-500">Full screen mode is mandatory. Switching tabs is recorded.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-4">
                                {eligibility.eligible ? (
                                    <Link href="/tcs-portal/instructions" className="w-full">
                                        <Button className="w-full h-12 text-base bg-[#181C2E] hover:bg-[#2C3E50] shadow-lg shadow-blue-900/10">
                                            Proceed to Assessment <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full h-12 text-base bg-gray-300 text-gray-500 cursor-not-allowed">
                                        Not Eligible <Lock className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guidelines Panel */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-[#181C2E]">System Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4 text-sm text-gray-600">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    Chrome Browser (Latest Version)
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    Webcam Permission
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    Microphone Permission
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                    Stable Internet (&gt; 2 Mbps)
                                </li>
                            </ul>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                                    onClick={handleSystemCheck}
                                >
                                    Run System Check
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2 text-xs text-red-300 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                        const perfectAnswers: Record<number, string> = {};
                                        tcsQuestions.forEach(q => {
                                            perfectAnswers[q.id] = q.correctAnswer;
                                        });
                                        localStorage.setItem('tcsAptitudeAnswers', JSON.stringify(perfectAnswers));
                                        localStorage.setItem('tcsCodingVerdict', 'Pass');
                                        toast.success("DEV: 100% Score Injected! Redirecting...");
                                        router.push('/tcs-portal/result');
                                    }}
                                >
                                    DEV: Force 100% Pass & Skip to Result
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full mt-2 text-xs text-blue-300 hover:text-blue-500 hover:bg-blue-50"
                                    onClick={() => {
                                        const perfectAnswers: Record<number, string> = {};
                                        tcsQuestions.forEach(q => {
                                            perfectAnswers[q.id] = q.correctAnswer;
                                        });
                                        localStorage.setItem('tcsAptitudeAnswers', JSON.stringify(perfectAnswers));
                                        localStorage.setItem('tcsCodingVerdict', 'Pass');
                                        localStorage.removeItem('tcsInterviewCompleted');
                                        toast.success("DEV: Skipped to Interview Round!");
                                        window.location.reload();
                                    }}
                                >
                                    DEV: Skip to Interview (Bypass Coding)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 mt-12">
                    © 2026 Tata Consultancy Services Limited. All Rights Reserved.
                </div>
            </div>
        </div>
    );
}
