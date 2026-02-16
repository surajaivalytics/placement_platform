"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2, Info } from "lucide-react";
import {
    BuilderExperience,
    createEmptyExperience
} from "@/lib/builder/builderTypes";

interface StepExperienceProps {
    experience: BuilderExperience[];
    onExperienceChange: (experience: BuilderExperience[]) => void;
    // We don't need isFresher props anymore
}

export default function StepExperience({
    experience,
    onExperienceChange,
}: StepExperienceProps) {
    const handleAddExperience = () => {
        onExperienceChange([...experience, createEmptyExperience()]);
    };

    const handleRemoveExperience = (id: string) => {
        onExperienceChange(experience.filter((exp) => exp.id !== id));
    };

    const handleExperienceFieldChange = (
        id: string,
        field: keyof BuilderExperience,
        value: string | boolean
    ) => {
        onExperienceChange(
            experience.map((exp) =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        );
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 leading-none shadow-lg shadow-slate-900/20">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Work Experience</h2>
                <p className="text-slate-500 mt-1">Tell us about your professional journey</p>
            </div>

            {/* 1. THE NEW "SKIP" NOTICE */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex gap-3 items-start">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-teal-900 text-sm">Are you a Fresher?</h4>
                    <p className="text-teal-700 text-sm mt-1">
                        If you don't have work experience yet, you can simply <strong>skip this step</strong>.
                        Click &quot;Next&quot; to focus on your Education and Skills.
                    </p>
                </div>
            </div>

            {/* 2. THE EXPERIENCE LIST */}
            <AnimatePresence>
                {experience.map((exp, index) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-900">
                                Position {index + 1}
                            </h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExperience(exp.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Job Title *</Label>
                                <Input
                                    value={exp.title}
                                    onChange={(e) =>
                                        handleExperienceFieldChange(exp.id, "title", e.target.value)
                                    }
                                    placeholder="Software Engineer"
                                    className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Company *</Label>
                                <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                        handleExperienceFieldChange(exp.id, "company", e.target.value)
                                    }
                                    placeholder="Tech Corp Inc."
                                    className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Start Date *</Label>
                                <Input
                                    value={exp.startDate}
                                    onChange={(e) =>
                                        handleExperienceFieldChange(exp.id, "startDate", e.target.value)
                                    }
                                    placeholder="Jan 2022"
                                    className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">End Date</Label>
                                <Input
                                    value={exp.endDate}
                                    onChange={(e) =>
                                        handleExperienceFieldChange(exp.id, "endDate", e.target.value)
                                    }
                                    placeholder="Present"
                                    disabled={exp.current}
                                    className="h-11 border-slate-200 disabled:bg-slate-100 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id={`current-${exp.id}`}
                                    checked={exp.current}
                                    onChange={(e) =>
                                        handleExperienceFieldChange(exp.id, "current", e.target.checked)
                                    }
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
                                />
                                <span className="text-slate-600">I currently work here</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Description *</Label>
                            <Textarea
                                value={exp.description}
                                onChange={(e) =>
                                    handleExperienceFieldChange(exp.id, "description", e.target.value)
                                }
                                placeholder="Describe your responsibilities, achievements, and impact. Use bullet points for better readability:&#10;• Led development of new features&#10;• Improved system performance by 40%"
                                className="min-h-[120px] border-slate-200 resize-none focus:border-teal-500 focus:ring-teal-500"
                            />
                            <p className="text-xs text-slate-400">
                                Tip: Start each line with &quot;•&quot; for bullet points
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 3. ADD BUTTON */}
            <Button
                type="button"
                onClick={handleAddExperience}
                className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all flex items-center justify-center gap-2 bg-transparent shadow-none"
            >
                <Plus className="w-5 h-5" />
                Add Position
            </Button>
        </div>
    );
}
