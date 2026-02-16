import React from "react";
import { Download, CheckCircle2, AlertCircle, FileText, Briefcase, GraduationCap, User, Zap } from "lucide-react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";

interface StepFinalReviewProps {
    data: BuilderResumeData;
    onDownload: () => void;
}

export default function StepFinalReview({ data, onDownload }: StepFinalReviewProps) {

    // 1. CALCULATE PROGRESS SCORE
    const calculateProgress = () => {
        let score = 0;
        if (data.personal.firstName && data.personal.email) score += 20;
        if (data.education.length > 0) score += 20;
        if (data.skills.length > 0) score += 20;
        if (data.summary.length > 20) score += 20;
        if (data.experience.length > 0) score += 20;
        return score;
    };

    const progress = calculateProgress();

    // 2. DOWNLOAD LOGIC (The Fix for Freshers)
    // Allow download if score is at least 40% (Personal + Education).
    // This ensures freshers can download even if Experience (20%) is missing.
    const isDownloadEnabled = progress >= 40;

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">

            {/* --- HEADER SECTION --- */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Ready to Download</h2>
                        <p className="text-slate-500 mt-1">
                            Your resume is {progress}% complete and ready for export.
                        </p>
                    </div>
                    <span className={`text-3xl font-bold ${progress === 100 ? 'text-teal-600' : 'text-teal-500'}`}>
                        {progress}%
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-teal-500' : 'bg-teal-400'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* --- ADVANCED GRID LAYOUT --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <StatusCard
                    icon={User}
                    title="Personal Details"
                    isComplete={!!data.personal.firstName}
                />

                {/* Experience Card: Handles "Skipped" state gracefully */}
                <StatusCard
                    icon={Briefcase}
                    title="Experience"
                    isComplete={data.experience.length > 0}
                    optional={true}
                />

                <StatusCard
                    icon={GraduationCap}
                    title="Education"
                    isComplete={data.education.length > 0}
                />

                <StatusCard
                    icon={Zap}
                    title="Skills"
                    isComplete={data.skills.length > 0}
                />

                <StatusCard
                    icon={FileText}
                    title="Summary"
                    isComplete={data.summary.length > 20}
                    className="md:col-span-2"
                />
            </div>

            {/* --- DOWNLOAD BUTTON --- */}
            <div className="pt-6">
                <button
                    onClick={onDownload}
                    disabled={!isDownloadEnabled}
                    className={`
            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl
            ${isDownloadEnabled
                            ? 'bg-slate-900 text-white hover:bg-teal-600 hover:shadow-teal-500/20 transform hover:-translate-y-1'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
          `}
                >
                    {isDownloadEnabled ? (
                        <>
                            <Download className="w-6 h-6" />
                            Download PDF Resume
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-6 h-6" />
                            Complete Basics to Download
                        </>
                    )}
                </button>

                {/* Helper Text */}
                <p className="text-center text-sm text-slate-400 mt-4">
                    {isDownloadEnabled
                        ? "Your PDF will be generated instantly."
                        : "Please add at least Personal Details and Education."}
                </p>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: PRO STATUS CARD ---
function StatusCard({ icon: Icon, title, isComplete, optional = false, className = "" }: any) {
    // Determine Visual Style based on State
    let statusText = "Incomplete";
    let statusColor = "text-red-500";
    let cardBorder = "border-slate-200 bg-white";
    let iconBg = "bg-slate-100 text-slate-400";

    if (isComplete) {
        statusText = "Complete";
        statusColor = "text-teal-600";
        cardBorder = "border-teal-200 bg-teal-50/30"; // Green tint
        iconBg = "bg-teal-100 text-teal-600";
    } else if (optional) {
        statusText = "Skipped (Optional)";
        statusColor = "text-slate-500";
        cardBorder = "border-slate-200 bg-slate-50"; // Gray/Neutral
    }

    return (
        <div className={`p-5 rounded-xl border flex items-center justify-between transition-all ${cardBorder} ${className}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800">{title}</h4>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>

            {isComplete ? (
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
            ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
            )}
        </div>
    );
}
