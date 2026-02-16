import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    ChevronLeft, Trophy, Target, BookOpen, Brain, Sparkles, CheckCircle, XCircle, BarChart, Award
} from "lucide-react";

import RadarChartComponent from './RadarChartComponent';

export default async function RoundReportPage({
    params
}: {
    params: Promise<{ id: string, roundId: string }>
}) {
    const { id: driveId, roundId } = await params;

    const progress = await prisma.mockRoundProgress.findUnique({
        where: { id: roundId },
        include: {
            round: true,
            enrollment: {
                include: {
                    drive: true
                }
            }
        }
    });

    if (!progress || !progress.aiFeedback) {
        notFound();
    }

    let evaluation: any = {};
    try {
        evaluation = JSON.parse(progress.aiFeedback);
    } catch (e) {
        const isLogs = progress.aiFeedback?.includes('TAB_SWITCH') || progress.aiFeedback?.includes('FULLSCREEN_EXIT');
        evaluation = {
            scores: { overallHireability: progress.score / 10 },
            feedback: isLogs ? "AI performance analysis is being processed. Individual scores are shown below." : (progress.aiFeedback || "No detailed feedback available."),
            overallVerdict: "Maybe"
        };
    }

    const { scores, feedback, strengths, weaknesses, overallVerdict } = evaluation;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Nav Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/placement/mock-drives/${driveId}`}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Drive
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 border-slate-200">
                            {progress.round.title} Report
                        </Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                {/* Header Information */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Detailed Performance Analysis</h1>
                        <p className="text-slate-500 max-w-2xl">
                            Comprehensive evaluation of your performance during the {progress.round.title} session for {progress.enrollment.drive.companyName}.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {/* <Button variant="outline" onClick={() => window.print()} className="h-10">
                            <Printer className="w-4 h-4 mr-2" /> Print Report
                        </Button> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Summary & Radar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none bg-slate-900 text-white shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy size={100} />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-slate-400 font-medium uppercase tracking-wider text-xs">Round Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center py-6">
                                <div className="text-6xl font-black mb-2 text-white">
                                    {Math.round(progress.score)}<span className="text-2xl text-slate-400">%</span>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${overallVerdict === 'Hire' ? 'bg-green-500/20 text-green-400' :
                                    overallVerdict === 'Maybe' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    Verdict: {overallVerdict}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    Competency Radar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex items-center justify-center">
                                <div className="w-full h-[300px]">
                                    <RadarChartComponent scores={scores} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Feedback, Strengths, Weaknesses */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
                            <CardHeader className="border-b border-indigo-100/50">
                                <CardTitle className="flex items-center gap-2 text-indigo-900">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Expert Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-slate-700 leading-relaxed italic">
                                    "{feedback}"
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="border-emerald-100 shadow-sm">
                                <CardHeader className="bg-emerald-50/50 pb-3">
                                    <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Strong Points
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <ul className="space-y-3">
                                        {strengths?.map((s: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                        {!strengths?.length && <li className="text-slate-400 text-sm italic">No specific strengths listed.</li>}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-100 shadow-sm">
                                <CardHeader className="bg-amber-50/50 pb-3">
                                    <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Improvement Areas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-4">
                                    <ul className="space-y-3">
                                        {weaknesses?.map((w: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                                                {w}
                                            </li>
                                        ))}
                                        {!weaknesses?.length && <li className="text-slate-400 text-sm italic">No specific areas for improvement listed.</li>}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-xl">
                            <Brain className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    Career Growth Tip
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Based on your performance in this {progress.round.type.replace('_', ' ').toLowerCase()},
                                    we recommend focusing on depth and structural clarity. Keep practicing with these simulations
                                    to build muscle memory for high-pressure situations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
