'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, ArrowLeft, Trophy, AlertTriangle, CheckCircle, Lock, ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoundCard } from '@/components/mock-drive/RoundCard';
import { MockDriveTimeline } from '@/components/mock-drive/MockDriveTimeline';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MockDriveDashboard() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const driveId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [drive, setDrive] = useState<any>(null);
    const [rounds, setRounds] = useState<any[]>([]);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [progressRes, roundsRes, driveRes] = await Promise.all([
                fetch(`/api/mock-drives/${driveId}/progress`),
                fetch(`/api/mock-drives/${driveId}/rounds`),
                fetch(`/api/mock-drives/${driveId}`)
            ]);

            const progressData = await progressRes.json();
            const roundsData = await roundsRes.json();
            const driveData = await driveRes.json();

            if (!roundsRes.ok || !driveRes.ok) {
                throw new Error(driveData.error || roundsData.error || 'Failed to load drive data');
            }

            setEnrollment(progressData.enrollment); // Can be null if not enrolled
            if (driveData.drive) {
                setDrive(driveData.drive);
            }
            setRounds(roundsData.rounds || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (driveId) {
            fetchData();
        }
    }, [driveId]);

    const handleRegister = async () => {
        try {
            setEnrolling(true);
            const res = await fetch(`/api/mock-drives/${driveId}/enroll`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) {
                if (data.missingFields) {
                    toast.error(`Incomplete Profile: ${data.missingFields.join(', ')}`);
                    router.push('/dashboard/profile');
                } else {
                    throw new Error(data.error || 'Failed to enroll');
                }
                return;
            }

            toast.success("Successfully enrolled!");
            fetchData(); // Refresh everything
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !drive) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Drive Not Found</h1>
                <p className="text-slate-500 mb-6">{error || "We couldn't locate this mock drive."}</p>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const getRoundStatus = (roundNum: number) => {
        if (!enrollment) return 'LOCKED';
        const currentRound = enrollment?.currentRoundNumber || 1;

        if (roundNum < currentRound) return 'COMPLETED';
        if (roundNum === currentRound) return enrollment?.status === 'FAILED' ? 'FAILED' : 'IN_PROGRESS';
        return 'PENDING';
    };

    const isRoundLocked = (roundNum: number) => {
        if (!enrollment) return true;
        const currentRound = enrollment?.currentRoundNumber || 1;
        return roundNum > currentRound;
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {drive.companyName}
                                <span className="text-slate-400 font-normal">/</span>
                                {drive.title}
                            </h1>
                        </div>
                    </div>
                    {enrollment && (
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${enrollment?.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                                enrollment?.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                    'bg-indigo-100 text-indigo-700'
                                }`}>
                                {enrollment?.status?.replace('_', ' ') || 'Registered'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {!enrollment ? (
                    /* Registration Flow */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">{drive.companyName} Recruitment Drive</CardTitle>
                                            <CardDescription className="text-indigo-100 text-lg">{drive.title}</CardDescription>
                                        </div>
                                    </div>
                                    <p className="text-indigo-50 opacity-90 leading-relaxed">
                                        {drive.description || "Take part in this comprehensive mock recruitment drive simulating the actual selection process of major companies."}
                                    </p>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-indigo-600" />
                                                Selection Process
                                            </h4>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {rounds.map((r, i) => (
                                                    <div key={r.id} className="flex items-center gap-2">
                                                        <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 border border-slate-200">
                                                            {i + 1}. {r.title}
                                                        </div>
                                                        {i < rounds.length - 1 && <div className="h-px w-4 bg-slate-300" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100">
                                            <Button
                                                onClick={handleRegister}
                                                className="w-full md:w-auto h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold"
                                                disabled={enrolling}
                                            >
                                                {enrolling ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                                                Register for Assessment
                                            </Button>
                                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                By registering, you agree to the assessment guidelines and proctoring rules.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-indigo-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                        Eligibility Criteria
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">10th Percentage</span>
                                            <span className="font-bold text-slate-800">{drive.eligibilityCriteria?.minTenth || 60}%+</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">12th Percentage</span>
                                            <span className="font-bold text-slate-800">{drive.eligibilityCriteria?.minTwelfth || 60}%+</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Graduation Score</span>
                                            <span className="font-bold text-slate-800">{drive.eligibilityCriteria?.minGrad || 6.0} CGPA+</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Max Backlogs</span>
                                            <span className="font-bold text-slate-800">{drive.eligibilityCriteria?.maxBacklogs ?? 0}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                            Ensure your profile is updated with correct academic details to avoid immediate rejection.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 text-white border-none shadow-xl">
                                <CardContent className="p-6">
                                    <h4 className="font-bold mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        Instructions
                                    </h4>
                                    <ul className="space-y-3 text-sm text-slate-300">
                                        <li className="flex gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                            Active proctoring will be monitored throughout.
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                            Candidates must remain in fullscreen mode.
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                            Ensure stable internet and webcam access.
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    /* Active Drive View */
                    <div className="space-y-12">
                        {/* Premium Header Section */}
                        <div className="relative overflow-hidden rounded-3xl bg-[#f8fafc] border border-gray-100 p-8 md:p-12 shadow-sm">
                            <div className="relative z-10 max-w-3xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                                        Hi {session?.user?.name?.split(' ')[0] || 'Candidate'}, <span className="text-slate-400">Ace Your {drive.companyName} Drive</span>
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-xl leading-relaxed">
                                        Practice with our AI-powered interviewers and real-world coding simulations to build your confidence and clear that dream role.
                                    </p>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-slate-900">
                                                {Math.min(enrollment?.currentRoundNumber || 1, rounds.length)}
                                                <span className="text-sm text-slate-400 font-normal">/{rounds.length}</span>
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                {(enrollment?.currentRoundNumber > rounds.length || enrollment?.status === 'PASSED' || enrollment?.status === 'FAILED')
                                                    ? 'Drive Finished'
                                                    : 'Current Round'}
                                            </span>
                                        </div>
                                        <div className="h-10 w-px bg-slate-200" />
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-slate-900">{Math.round(enrollment?.overallScore || 0)}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Overall Score</span>
                                        </div>
                                        {(enrollment?.status === 'PASSED' || enrollment?.status === 'FAILED') && (
                                            <>
                                                <div className="h-10 w-px bg-slate-200" />
                                                <Button
                                                    onClick={() => router.push(`/placement/mock-drives/${driveId}/final-report`)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-indigo-100"
                                                >
                                                    <Trophy className="w-4 h-4 mr-2" /> View Final Report
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center opacity-10 pointer-events-none">
                                <Trophy className="w-64 h-64 text-slate-900" />
                            </div>
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50" />
                            <div className="absolute -right-10 top-10 w-40 h-40 bg-purple-50 rounded-full blur-2xl opacity-40" />
                        </div>

                        {/* Zig-Zag Timeline Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                                    Assessment Journey
                                </h2>
                                <div className="text-sm font-medium text-slate-400">
                                    {rounds.length} Rounds to Completion
                                </div>
                            </div>

                            <MockDriveTimeline
                                rounds={rounds}
                                enrollment={enrollment}
                                driveId={driveId}
                            />
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
