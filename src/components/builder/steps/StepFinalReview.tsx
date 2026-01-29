"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    CheckCircle,
    Download,
    User,
    Briefcase,
    GraduationCap,
    Lightbulb,
    FileText,
    Sparkles
} from "lucide-react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";

interface StepFinalReviewProps {
    data: BuilderResumeData;
    onDownload: () => void;
}

export default function StepFinalReview({ data, onDownload }: StepFinalReviewProps) {
    const sections = [
        {
            icon: User,
            title: "Personal Details",
            status: data.personal.firstName && data.personal.email ? "complete" : "incomplete",
            detail: `${data.personal.firstName} ${data.personal.lastName}`,
        },
        {
            icon: Briefcase,
            title: "Experience",
            status: data.isFresher ? "fresher" : data.experience.length > 0 ? "complete" : "incomplete",
            detail: data.isFresher
                ? "Fresher - No work experience"
                : `${data.experience.length} position(s)`,
        },
        {
            icon: GraduationCap,
            title: "Education",
            status: data.education.length > 0 ? "complete" : "incomplete",
            detail: `${data.education.length} entry(ies)`,
        },
        {
            icon: Lightbulb,
            title: "Skills",
            status: data.skills.length > 0 ? "complete" : "incomplete",
            detail: `${data.skills.length} skill(s)`,
        },
        {
            icon: FileText,
            title: "Summary",
            status: data.summary.length > 50 ? "complete" : "incomplete",
            detail: data.summary.length > 0 ? `${data.summary.length} characters` : "Not added",
        },
    ];

    const completedCount = sections.filter(s => s.status === "complete" || s.status === "fresher").length;
    const isReady = completedCount >= 4;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200"
                >
                    <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800">Ready to Download!</h2>
                <p className="text-slate-500 mt-1">Review your resume and download when ready</p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-3">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${section.status === "complete" || section.status === "fresher"
                                ? "bg-green-50 border-green-200"
                                : "bg-slate-50 border-slate-200"
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.status === "complete" || section.status === "fresher"
                                ? "bg-green-500 text-white"
                                : "bg-slate-300 text-slate-600"
                            }`}>
                            <section.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-slate-700">{section.title}</p>
                            <p className="text-sm text-slate-500">{section.detail}</p>
                        </div>
                        {(section.status === "complete" || section.status === "fresher") && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Progress */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Resume Completion</span>
                    <span className="text-sm font-bold text-blue-600">{Math.round((completedCount / sections.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / sections.length) * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                </div>
            </div>

            {/* Download Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Button
                    type="button"
                    onClick={onDownload}
                    disabled={!isReady}
                    className={`w-full h-14 text-lg font-semibold shadow-lg transition-all ${isReady
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-200"
                            : "bg-slate-300 cursor-not-allowed"
                        }`}
                >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                </Button>
                {!isReady && (
                    <p className="text-center text-sm text-amber-600 mt-2 flex items-center justify-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Complete at least 4 sections to download
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}
