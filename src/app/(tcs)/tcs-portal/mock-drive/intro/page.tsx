"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, Lock, ArrowRight, Loader2, Play } from "lucide-react";
import { createMockDrive, getActiveMockDrive } from "@/app/actions/mock-drive";
import { toast } from "sonner";

export default function TCSMockDriveIntro() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [existingSession, setExistingSession] = useState<any>(null);

    const handleStartDrive = async () => {
        setLoading(true);
        try {
            const res = await createMockDrive("TCS");
            if (res.success) {
                toast.success("Exam Environment Initialized");
                router.push(`/tcs-portal/test/aptitude?session=${res.sessionId}`);
            } else {
                toast.error("Failed to start drive. " + res.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-[#181C2E] text-white py-6 px-4 md:px-10 border-b border-gray-800">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <Badge className="bg-green-500 text-white border-0 mb-2">Simulation Mode</Badge>
                        <h1 className="text-2xl font-bold">TCS National Qualifier Test (NQT)</h1>
                        <p className="text-gray-400 text-sm">Full Hiring Drive Simulation • 2026 Batch Pattern</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-gray-400">Total Duration</div>
                        <div className="text-xl font-bold">180 Minutes</div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Drive Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-[#181C2E]">Assessment Flow</CardTitle>
                                <CardDescription>This drive consists of 3 mandatory rounds. No skipping allowed.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Round 1 */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">1</div>
                                    <div className="flex-1 border-b border-gray-100 pb-4">
                                        <h3 className="font-semibold text-gray-900">Online Assessment (Integrated)</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Combines Aptitude (Numerical, Verbal, Reasoning) and Hands-on Coding.
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">50 MCQs</Badge>
                                            <Badge variant="outline" className="text-xs">2 Coding Problems</Badge>
                                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">90 Mins</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Round 2 */}
                                <div className="flex gap-4 opacity-75">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">2</div>
                                    <div className="flex-1 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-700">Technical Interview</h3>
                                            <Badge variant="secondary" className="text-xs">AI Powered</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Adaptive interview based on your resume and Round 1 performance.
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs text-gray-400">Video + Code Share</Badge>
                                            <Badge variant="outline" className="text-xs text-gray-400">45 Mins</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Round 3 */}
                                <div className="flex gap-4 opacity-75">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">3</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-700">HR Discussion</h3>
                                            <Badge variant="secondary" className="text-xs">AI Powered</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Behavioral and situational assessment to check company fitment.
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs text-gray-400">15 Mins</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-amber-400 bg-amber-50">
                            <CardContent className="p-4 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div className="text-sm text-amber-900">
                                    <strong className="block mb-1">Strict Rules Implemented</strong>
                                    You cannot pause the timer once a round begins. Tab switching is monitored and will lead to auto-submission. Please ensure you have 3 continuous hours available.
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-t-4 border-t-green-500">
                            <CardHeader>
                                <CardTitle className="text-lg">Ready to Begin?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" /> System Check Passed
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Webcam Active
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Microphone Active
                                    </li>
                                </ul>

                                <div className="pt-4">
                                    <Button
                                        className="w-full h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-lg font-bold shadow-xl shadow-blue-900/20"
                                        onClick={handleStartDrive}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
                                        Start Drive
                                    </Button>
                                    <p className="text-xs text-center text-gray-400 mt-3">
                                        By clicking Start, you agree to the Non-Disclosure Agreement.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
