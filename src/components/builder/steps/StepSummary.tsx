"use client";

import React from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, RefreshCcw } from "lucide-react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";

interface StepSummaryProps {
    summary: string;
    resumeData: BuilderResumeData;
    onChange: (summary: string) => void;
}

export default function StepSummary({ summary, resumeData, onChange }: StepSummaryProps) {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const generateSummary = async () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            const mockSummary = `Driven ${resumeData.experience[0]?.title || "Professional"} with ${resumeData.experience.length
                } years of experience in ${resumeData.education[0]?.fieldOfStudy || "tech"}. Proven track record in delivery high-quality solutions.`;
            onChange(mockSummary);
            setIsGenerating(false);
        }, 1500);
    };

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
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Professional Summary</h2>
                <p className="text-slate-500 mt-1">Write a short bio that highlights your strengths</p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <Label className="text-slate-700 font-medium">Summary</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateSummary}
                        disabled={isGenerating}
                        className="bg-slate-900 text-white hover:bg-teal-600 border-none shadow-lg shadow-teal-500/20 transition-all duration-300"
                    >
                        {isGenerating ? (
                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2 text-teal-400" />
                        )}
                        {isGenerating ? "Writing..." : "Generate with AI"}
                    </Button>
                </div>

                <Textarea
                    value={summary}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Briefly describe your professional background and key achievements..."
                    className="min-h-[200px] border-slate-200 focus:border-teal-500 focus:ring-teal-500 resize-none p-4 leading-relaxed"
                />

                <div className="flex justify-between text-xs text-slate-400">
                    <span>Minimum 50 characters</span>
                    <span>{summary.length} characters</span>
                </div>
            </div>
        </motion.div>
    );
}
