import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Share2, Download } from "lucide-react";
import Link from 'next/link';

export default function WiproResultPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 space-y-12 animate-in zoom-in-50 duration-700">

            <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-3xl opacity-50 scale-150" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-900/20">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Assessment Submitted!</h1>
                <p className="text-lg text-slate-500">Thank you for completing the Wipro Digital Assessment. Your profile is now under review by our talent team.</p>
            </div>

            <div className="w-full max-w-sm bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                    <span className="text-sm font-medium text-slate-500">Reference ID</span>
                    <span className="text-sm font-mono font-bold text-slate-900">WIP-2026-X92</span>
                </div>
                <Link href="/wipro-portal">
                    <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-medium">
                        Return to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex gap-6 text-sm font-medium text-slate-400">
                <button className="flex items-center gap-2 hover:text-slate-600 transition-colors"><Download className="w-4 h-4" /> Download Receipt</button>
                <button className="flex items-center gap-2 hover:text-slate-600 transition-colors"><Share2 className="w-4 h-4" /> Share Experience</button>
            </div>

        </div>
    );
}
