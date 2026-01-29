"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";

interface StepSummaryProps {
    summary: string;
    resumeData: BuilderResumeData;
    onChange: (summary: string) => void;
}

export default function StepSummary({ summary, resumeData, onChange }: StepSummaryProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const generateSummary = async () => {
        setIsGenerating(true);

        // Build context from resume data
        const { personal, isFresher, experience, education, skills } = resumeData;

        let generatedText: string;

        if (isFresher) {
            // Fresher summary
            const topSkills = skills.slice(0, 3).join(", ");
            const eduInfo = education[0];
            generatedText = `Motivated and enthusiastic ${eduInfo?.degree || "graduate"} ${eduInfo?.fieldOfStudy ? `in ${eduInfo.fieldOfStudy}` : ""} from ${eduInfo?.school || "university"}, eager to contribute to organizational success. Possess strong foundational knowledge in ${topSkills || "key areas"}, combined with excellent problem-solving abilities and a passion for continuous learning. Seeking opportunities to apply academic knowledge and develop professionally in a dynamic work environment.`;
        } else {
            // Experienced professional summary
            const latestRole = experience[0];
            const yearsCount = experience.length > 2 ? "proven track record of" : "experience in";
            const topSkills = skills.slice(0, 3).join(", ");
            generatedText = `Results-driven ${latestRole?.title || "professional"} with ${yearsCount} delivering impactful solutions${latestRole?.company ? ` at organizations like ${latestRole.company}` : ""}. Expertise in ${topSkills || "key technologies"}, with a strong focus on quality and efficiency. Known for excellent collaboration skills, problem-solving abilities, and a commitment to driving business outcomes through innovative approaches.`;
        }

        // Typewriter effect - letter by letter
        onChange(""); // Clear first
        for (let i = 0; i <= generatedText.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 15));
            onChange(generatedText.slice(0, i));
        }

        setIsGenerating(false);
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
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Professional Summary</h2>
                <p className="text-slate-500 mt-1">Craft a compelling introduction about yourself</p>
            </div>

            {/* AI Generate Button */}
            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={generateSummary}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-200"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            ✨ Generate with AI
                        </>
                    )}
                </Button>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                    Your Professional Summary
                </Label>
                <Textarea
                    ref={textareaRef}
                    value={summary}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Write a brief professional summary highlighting your experience, skills, and career goals. Or click 'Generate with AI' to create one automatically!"
                    className="min-h-[200px] border-slate-200 resize-none focus:border-purple-500 focus:ring-purple-500 text-slate-700 leading-relaxed"
                />
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Tip: Use the AI button to generate a personalized summary based on your experience and skills
                </p>
            </div>

            {/* Character Count */}
            <div className="flex justify-between text-xs text-slate-400">
                <span>Recommended: 150-300 characters</span>
                <span className={summary.length > 500 ? "text-red-500" : ""}>
                    {summary.length} characters
                </span>
            </div>
        </motion.div>
    );
}
