'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    Briefcase,
    ArrowRight,
    ShieldAlert,
    Info,
    Monitor,
    Wifi,
    UserCheck,
    Clock,
    Target,
    AlertTriangle,
    CheckCircle2,
    Lock
} from 'lucide-react';

export default function MockDrivesPage() {
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mock-drives')
            .then(res => res.json())
            .then(data => {
                setDrives(data.drives || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Helper to get color based on company
    const getCompanyColor = (name: string) => {
        const colors = [
            'from-blue-600 to-blue-400',
            'from-purple-600 to-purple-400',
            'from-indigo-600 to-indigo-400',
            'from-emerald-600 to-emerald-400'
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                            Company Specific Mock Tests
                        </h1>
                        <p className="text-lg text-slate-500 font-medium tracking-tight">
                            Premium proctored assessments simulating real-world recruitment drives.
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-full flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <span className="text-sm font-bold text-red-600 uppercase tracking-widest">AI Surveillance Active</span>
                    </div>
                </div>

                {/* Proctored Environment Banner */}
                <div className="bg-[#1e1e2d] text-white p-6 rounded-2xl mb-12 shadow-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-red-500/20 transition-colors"></div>
                    <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-400 mb-1 leading-none">Strict Proctored Environment</h3>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">
                                These tests are monitored by AI Anti-Cheating System. <span className="text-white font-semibold">Tab switching, minimizing window, or multiple faces</span> will lead to immediate disqualification. Please ensure you are in a well-lit room.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm mb-12">
                        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
                        <p className="text-slate-500 font-semibold tracking-tight animate-pulse uppercase text-sm">Synchronizing Assessment Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {drives.map((drive) => (
                            <div key={drive.id} className="relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 group border border-slate-200">
                                {/* Top Gradient Bar */}
                                <div className={`h-1.5 w-full bg-gradient-to-r ${getCompanyColor(drive.companyName)}`}></div>

                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-10">
                                        <h4 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${getCompanyColor(drive.companyName)} uppercase tracking-wider`}>
                                            {drive.companyName}
                                        </h4>
                                        <div className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-sm">NEW</div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                        {drive.title || `${drive.companyName} Drive`}
                                    </h3>

                                    <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2 min-h-[40px]">
                                        {drive.description || "Comprehensive assessment covering technical and aptitude rounds for high-performance roles."}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col items-start gap-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Difficulty</p>
                                            <p className="text-sm font-bold text-slate-700">Medium</p>
                                        </div>
                                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col items-start gap-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Duration</p>
                                            <p className="text-sm font-bold text-slate-700">{drive.totalDuration || 180} Mins</p>
                                        </div>
                                    </div>

                                    {/* Footer Details */}
                                    <div className="flex flex-col gap-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Target className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{drive.totalQuestions || 0} Questions</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Monitor className="w-4 h-4" />
                                            <span className="text-xs font-semibold">Proctored Mode</span>
                                        </div>
                                    </div>

                                    <Link href={`/placement/mock-drives/${drive.id}`}>
                                        <Button className="w-full h-14 bg-[#1e293b] hover:bg-black text-white rounded-2xl font-black text-md tracking-tight flex items-center justify-center gap-3 group/btn shadow-xl transition-all shadow-slate-200">
                                            Start Drive
                                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bottom Compliance Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Malpractice */}
                    <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-amber-100 p-2.5 rounded-xl border border-amber-200">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Malpractice Code</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Leaving the test window at any time is recorded as a violation.",
                                "Using external devices (mobile phones, tablets) is strictly prohibited.",
                                "Background noise or speaking during the test will flag the session using Voice AI."
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 ring-4 ring-red-500/10"></div>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Requirements */}
                    <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-emerald-100 p-2.5 rounded-xl border border-emerald-200">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">System Requirements</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                { text: "Internet Speed: Minimum 2 Mbps stable connection.", icon: Wifi },
                                { text: "Webcam: Functional webcam for continuous proctoring.", icon: Monitor },
                                { text: "Browser: Latest version of Chrome or Edge (No private/incognito).", icon: Monitor }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 ring-4 ring-emerald-500/10"></div>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

