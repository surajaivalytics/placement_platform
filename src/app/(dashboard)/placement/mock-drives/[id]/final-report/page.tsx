import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    ChevronLeft, Trophy, Target, BookOpen, Brain, Sparkles, CheckCircle, XCircle, BarChart, Award
} from "lucide-react";
import dynamic from 'next/dynamic';

import RadarChartComponent from '../report/[roundId]/RadarChartComponent';

export default async function FinalDriveReportPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) notFound();

    const { id: driveId } = await params;

    const enrollment = await prisma.mockDriveEnrollment.findUnique({
        where: {
            userId_driveId: {
                userId: session.user.id,
                driveId: driveId
            }
        },
        include: {
            drive: true,
            roundProgress: {
                include: {
                    round: true
                },
                orderBy: {
                    round: {
                        roundNumber: 'asc'
                    }
                }
            }
        }
    });

    if (!enrollment) {
        notFound();
    }

    const completedRounds = enrollment.roundProgress.filter(rp => rp.status === 'COMPLETED');

    // Aggregate scores for the radar chart
    const aggregatedScores: Record<string, number> = {};
    const scoreCategories = [
        'programmingFundamentals', 'oopConcepts', 'dsaBasics', 'sdlc',
        'appDev', 'debugging', 'sqlBasics', 'collaboration'
    ];

    // Count how many rounds contributed to each category for proper averaging
    const scoreCounts: Record<string, number> = {};

    completedRounds.forEach(rp => {
        if (rp.aiFeedback && rp.aiFeedback.trim().startsWith('{')) {
            try {
                const evalJson = JSON.parse(rp.aiFeedback);
                if (evalJson.scores) {
                    scoreCategories.forEach(cat => {
                        if (typeof evalJson.scores[cat] === 'number') {
                            aggregatedScores[cat] = (aggregatedScores[cat] || 0) + evalJson.scores[cat];
                            scoreCounts[cat] = (scoreCounts[cat] || 0) + 1;
                        }
                    });
                }
            } catch (e) {
                console.error("Aggregation error for round", rp.id, e);
            }
        }
    });

    // Average the aggregated scores based on actual counts
    scoreCategories.forEach(cat => {
        if (scoreCounts[cat] > 0) {
            aggregatedScores[cat] = aggregatedScores[cat] / scoreCounts[cat];
        } else {
            aggregatedScores[cat] = 0;
        }
    });

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Nav Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/placement/mock-drives/${driveId}`}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Drive Dashboard
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {enrollment.drive.companyName} Drive Report
                        </Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none px-4 py-1">
                        Final Assessment Result
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Mock Drive Performance Report
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        A holistic analysis of your performance across all assessment rounds for the {enrollment.drive.title} simulation.
                    </p>
                </div>

                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-1 bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
                        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Award size={200} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aggregate Result</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center py-8">
                            <div className="text-7xl font-black mb-2 flex items-baseline">
                                {Math.round(enrollment.overallScore)}<span className="text-3xl text-indigo-400">%</span>
                            </div>
                            <div className="text-indigo-400 font-bold mb-6">Overall Score</div>
                            <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest ${enrollment.status === 'PASSED' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {enrollment.status === 'PASSED' ? 'Offer Extended' : 'Did Not Clear'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-slate-200 shadow-sm flex flex-col justify-center">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <BarChart className="w-4 h-4 text-indigo-600" />
                                Average Skill Proficiency
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-0">
                            <div className="w-full h-[350px]">
                                <RadarChartComponent scores={aggregatedScores} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rounds Breakdown */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Target className="w-6 h-6 text-indigo-600" />
                        Round-by-Round Breakdown
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollment.roundProgress.map((rp, idx) => (
                            <Card key={rp.id} className={`border-none shadow-md overflow-hidden ${rp.status === 'COMPLETED' ? 'bg-white' : 'bg-slate-50 opacity-70'
                                }`}>
                                <div className={`h-1.5 w-full ${rp.status === 'COMPLETED' ? (rp.score >= 70 ? 'bg-green-500' : 'bg-amber-500') : 'bg-slate-300'
                                    }`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Round {idx + 1}</span>
                                        {rp.status === 'COMPLETED' ? (
                                            <span className="text-xs font-bold text-slate-900">{Math.round(rp.score)}%</span>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px]">{rp.status}</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-base truncate">{rp.round.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                                        {rp.aiFeedback && !rp.aiFeedback.startsWith('{') ? rp.aiFeedback : "Performance analysis archived for this session."}
                                    </p>
                                    {rp.status === 'COMPLETED' && (
                                        <Button variant="outline" size="sm" className="w-full text-[10px] font-bold h-8" asChild>
                                            <Link href={`/placement/mock-drives/${driveId}/report/${rp.id}`}>
                                                View Detailed Breakdown
                                            </Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Final Recommendation */}
                <Card className="border-none shadow-2xl bg-indigo-600 text-white overflow-hidden relative">
                    <Brain className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-100">
                            <Sparkles className="w-6 h-6 text-amber-300" />
                            Final Career Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                            <h3 className="text-xl font-bold mb-3">Overall Performance Summary</h3>
                            <p className="text-indigo-50 leading-relaxed">
                                You have successfully navigated through the {enrollment.drive.companyName} selection process simulation.
                                Your overall performance demonstrates a {enrollment.overallScore >= 80 ? 'strong' : 'solid'} foundation in required competencies.
                                Continued focus on {scoreCategories.find(cat => aggregatedScores[cat] < 7)?.replace(/([A-Z])/g, ' $1').toLowerCase() || 'technical depth'} will further improve your hireability for the actual drive.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="font-bold text-sm mb-2 text-indigo-200 uppercase tracking-widest">Next Steps</h4>
                                <ul className="text-xs text-indigo-50 space-y-2">
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                                        Review detailed feedback for each round
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5" />
                                        Focus on improvement areas highlighted in charts
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="font-bold text-sm mb-2 text-indigo-200 uppercase tracking-widest">Readiness Level</h4>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400" style={{ width: `${enrollment.overallScore}%` }} />
                                    </div>
                                    <span className="text-xs font-black">{Math.round(enrollment.overallScore)}%</span>
                                </div>
                                <p className="text-[10px] text-indigo-200 mt-2">Ready for actual recruitment drives.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
