"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock, Play, GraduationCap, FileText, Check, Terminal } from "lucide-react";

import { Spinner } from "@/components/ui/loader";


import { toast } from "sonner";

export default function DashboardClient({ test, session, isEligible }: { test: any, session: any, isEligible: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 1. Group Rounds Logic (Hoisted)
    const groupedRounds: Record<string, any[]> = {};
    if (test && test.subtopics) {
        test.subtopics.forEach((sub: any) => {
            const title = sub.roundTitle || (
                sub.name.includes('Interview') ? 'Personal Interview' : 'Online Assessment'
            );
            if (!groupedRounds[title]) groupedRounds[title] = [];
            groupedRounds[title].push(sub);
        });
    }

    const sortedRoundTitles = Object.keys(groupedRounds).sort((a, b) => {
        // Sort Priority: Assessment < Coding < Technical < HR
        // We can try to infer type or use order.
        // Let's rely on the 'minOrder' of the group.
        const minOrderA = Math.min(...groupedRounds[a].map((s: any) => s.order || 999));
        const minOrderB = Math.min(...groupedRounds[b].map((s: any) => s.order || 999));

        // Tie-breaker: Type priority
        if (minOrderA === minOrderB) {
            const typeA = groupedRounds[a][0].type || '';
            const typeB = groupedRounds[b][0].type || '';

            const getPriority = (t: string, title: string) => {
                t = t.toLowerCase(); title = title.toLowerCase();
                if (t === 'assessment') return 1;
                if (t === 'coding') return 2;
                if (title.includes('technical') || t.includes('technical')) return 3;
                if (title.includes('hr') || t.includes('hr')) return 4;
                return 5;
            };
            return getPriority(typeA, a) - getPriority(typeB, b);
        }

        return minOrderA - minOrderB;
    });

    // Determine Logic based on Dynamic Rounds
    // session.currentRound is 1-based index into sortedRoundTitles
    const currentRoundIndex = (session?.currentRound || 1) - 1;
    const currentRoundTitle = sortedRoundTitles[currentRoundIndex] || "Simulation";
    const currentRoundGroup = groupedRounds[currentRoundTitle] || [];
    const currentRoundType = currentRoundGroup[0]?.type || 'assessment';

    // Timeline calculation - Approximate active step
    // 1: Registration, 2: Eligibility -> These are fixed.
    // 3: Round 1 (Assessment), 4: Round 2 (Interview 1), 5: Round 3...
    // We map visually: Step 1, Step 2, then Step 3... for rounds.

    // Actually, let's keep the simplified mapped steps for the UI for now:
    // Step 1: Reg, 2: Elig, 3: Assessment, 4: Tech, 5: HR.
    // If we have more rounds, this static list might be weird, but for this specific test case it works.

    const getActiveStep = () => {
        if (!session) return isEligible ? 2 : 1;
        // If round 1 -> Step 3
        // If round 2 -> Step 4
        // If round 3 -> Step 5
        return Math.min(5, session.currentRound + 2);
    };

    const activeStep = getActiveStep();


    useEffect(() => {
        // Only redirect if NOT eligible and NO session
        if (!session && !isEligible) {
            router.push(`/exam/${test.id}/eligibility`);
        }
    }, [session, isEligible, test.id, router]);


    // UI Helper for Button Text
    const getButtonText = () => {
        if (loading) return "Processing...";
        if (!session) return "Start " + (sortedRoundTitles[0] || "Assessment");

        if (currentRoundIndex >= sortedRoundTitles.length) return "View Results";

        // Logic based on Type or Title
        if (currentRoundTitle.toLowerCase().includes('technical')) return "Start Technical Interview";
        if (currentRoundTitle.toLowerCase().includes('hr')) return "Start HR Interview";
        if (currentRoundType === 'interview') return "Start Interview";

        // Default
        return `Start ${currentRoundTitle}`;
    };

    const handleStart = async () => {
        setLoading(true);

        if (session && currentRoundIndex >= sortedRoundTitles.length) {
            toast.success("You have completed this drive!");
            router.push(`/exam/${test.id}/result?status=Completed`);
            return;
        }

        // Routing Logic: Everything goes through /test runner now which handles switch logic
        if (!isEligible && !session) {
            router.push(`/exam/${test.id}/eligibility`);
            return;
        }

        // We route to /test. The /test page logic (from previous task) handles "Resume" or "Next Round" 
        // by looking at the session/backend state.
        // Assuming /test page fetches session and knows which round to start.
        router.push(`/exam/${test.id}/test`);
    };

    // UI Helper for Status Badge
    const getStatusText = () => {
        if (!session) return "Ready to Start";
        if (session.currentRound > sortedRoundTitles.length) return "Completed";
        return "In Progress";
    };

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header Banner */}
            <div className="bg-[#181C2E] text-white py-8 px-4 md:px-10 shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex gap-2 mb-2">
                            <Badge className="bg-green-500 text-white border-0">Live Simulation</Badge>
                            <Badge variant="outline" className="text-gray-300 border-gray-600">{test.company}</Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
                        <p className="text-gray-400 text-sm mt-1">Full Recruitment Drive Simulation • {new Date().getFullYear()} Batch</p>
                    </div>
                    <div className="text-left md:text-right hidden md:block bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Duration</div>
                        <div className="text-2xl font-bold font-mono">{test.duration || 180} <span className="text-sm font-normal text-gray-400">min</span></div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">

                {/* Timeline / Progress Tracker */}
                <div className="w-full mb-8 overflow-x-auto pb-4">
                    <div className="min-w-[700px] flex items-center justify-between relative px-10">
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200 -z-10" />

                        {[
                            { label: "Registration", icon: FileText, step: 1 },
                            { label: "Eligibility", icon: GraduationCap, step: 2 },
                            { label: "Assessment", icon: Clock, step: 3 },
                            { label: "Tech Interview", icon: Terminal, step: 4 },
                            { label: "HR Interview", icon: Play, step: 5 }
                        ]
                            .filter((s: any) => {
                                if (test.type !== 'company') {
                                    return s.step <= 3;
                                }
                                return true;
                            })
                            .map((s: any, idx: number) => {
                                const isActive = activeStep >= s.step;
                                const isCurrent = activeStep === s.step;
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-2 z-10">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'bg-green-600 border-green-200 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                            {isActive ? <Check className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-sm font-medium ${isCurrent ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{s.label}</span>
                                    </div>
                                )
                            })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Drive Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-100">
                                <CardTitle className="text-[#181C2E] flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" /> Assessment Rounds
                                </CardTitle>
                                <CardDescription>Complete process breakdown. You are currently in the <strong>Assessment Phase</strong>.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {sortedRoundTitles.map((title: string, roundIdx: number) => {
                                        const subtopics = groupedRounds[title];
                                        const isInterview = title.toLowerCase().includes('interview') ||
                                            title.toLowerCase() === 'hr' ||
                                            subtopics.some((s: any) => s.type === 'interview');
                                        const roundNum = roundIdx + 1;

                                        return (
                                            <div key={title} className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm ${isInterview ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {roundNum}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className={`font-semibold text-lg ${isInterview ? 'text-gray-700' : 'text-gray-900'}`}>{title}</h3>
                                                            {!isInterview && <Badge variant="secondary" className="bg-blue-50 text-blue-700">Mandatory</Badge>}
                                                            {isInterview && <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 bg-purple-50">AI Powered</Badge>}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                            {isInterview
                                                                ? "Interactive AI-driven interview session."
                                                                : `Includes ${subtopics.map((s: any) => s.name).join(', ')}.`}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {subtopics.map((sub: any) => (
                                                                <Badge
                                                                    key={sub.id}
                                                                    variant="outline"
                                                                    className={`text-xs font-medium px-2 py-0.5 ${sub.name.includes('Coding') ? 'border-purple-200 text-purple-700 bg-purple-50/50' :
                                                                        sub.name.includes('Verbal') ? 'border-green-200 text-green-700 bg-green-50/50' :
                                                                            sub.name.includes('Logical') ? 'border-orange-200 text-orange-700 bg-orange-50/50' :
                                                                                'border-blue-200 text-blue-700 bg-blue-50/50'
                                                                        }`}
                                                                >
                                                                    {sub.name}
                                                                </Badge>
                                                            ))}
                                                            {!isInterview && <Badge variant="outline" className="text-xs font-medium px-2 py-0.5 border-gray-200 text-gray-700 bg-gray-50/50">{test.duration} Mins (Total)</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 shadow-sm">
                            <CardContent className="p-4 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-amber-900 leading-relaxed">
                                    <strong className="block mb-1 font-semibold text-amber-950">System Requirements</strong>
                                    Please ensure you have a stable internet connection and a working webcam. Fullscreen mode will be enforced during the assessment.
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-t-4 border-t-green-500 relative overflow-hidden">
                            {/* Abstract Pattern Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />

                            <CardHeader>
                                <CardTitle className="text-xl">Action Center</CardTitle>
                                <CardDescription>Your next step is pending.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-semibold text-amber-600 flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${session ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} /> {getStatusText()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Eligibility</span>
                                        <span className={`font-semibold ${session || isEligible ? 'text-green-600' : 'text-gray-900'}`}>
                                            {session || isEligible ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Current Round</span>
                                        <span className="font-semibold text-gray-900">{session ? `Round ${session.currentRound}` : 'Round 1'}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        className="w-full h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-lg font-bold shadow-xl shadow-blue-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={handleStart}
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size={20} /> : <span className="flex items-center gap-2">{getButtonText()} <ArrowRight className="w-5 h-5" /></span>}
                                    </Button>
                                    <p className="text-xs text-center text-gray-400 mt-3 px-4 leading-normal">
                                        By clicking Launch, you agree to the Terms of Simulation.
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

// Helper icon component
function ArrowRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}
