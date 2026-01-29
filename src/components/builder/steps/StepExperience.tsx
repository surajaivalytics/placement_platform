"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2, Sparkles } from "lucide-react";
import {
    BuilderExperience,
    createEmptyExperience
} from "@/lib/builder/builderTypes";

interface StepExperienceProps {
    isFresher: boolean;
    experience: BuilderExperience[];
    onFresherChange: (isFresher: boolean) => void;
    onExperienceChange: (experience: BuilderExperience[]) => void;
}

export default function StepExperience({
    isFresher,
    experience,
    onFresherChange,
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

    const handleFresherToggle = (checked: boolean) => {
        onFresherChange(checked);
        if (checked) {
            onExperienceChange([]);
        }
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
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Work Experience</h2>
                <p className="text-slate-500 mt-1">Tell us about your professional journey</p>
            </div>

            {/* Fresher Checkbox */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="fresher"
                        checked={isFresher}
                        onCheckedChange={handleFresherToggle}
                        className="h-5 w-5 border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                        htmlFor="fresher"
                        className="text-slate-700 font-medium cursor-pointer flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        I am a Fresher (No Work Experience)
                    </Label>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isFresher ? (
                    /* Fresher Message */
                    <motion.div
                        key="fresher-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-200"
                    >
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-800 mb-2">
                            No worries! 🎉
                        </h3>
                        <p className="text-green-700">
                            We&apos;ll focus on your <span className="font-semibold">Education</span> and{" "}
                            <span className="font-semibold">Skills</span> to build an impressive resume!
                        </p>
                    </motion.div>
                ) : (
                    /* Experience Form */
                    <motion.div
                        key="experience-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {experience.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 mb-4">No experience added yet</p>
                                <Button
                                    type="button"
                                    onClick={handleAddExperience}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Position
                                </Button>
                            </div>
                        )}

                        {experience.map((exp, index) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-slate-700">
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
                                            className="h-11 border-slate-200"
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
                                            className="h-11 border-slate-200"
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
                                            className="h-11 border-slate-200"
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
                                            className="h-11 border-slate-200 disabled:bg-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                    <Checkbox
                                        id={`current-${exp.id}`}
                                        checked={exp.current}
                                        onCheckedChange={(checked) =>
                                            handleExperienceFieldChange(exp.id, "current", !!checked)
                                        }
                                    />
                                    <Label htmlFor={`current-${exp.id}`} className="text-slate-600 cursor-pointer">
                                        I currently work here
                                    </Label>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Description *</Label>
                                    <Textarea
                                        value={exp.description}
                                        onChange={(e) =>
                                            handleExperienceFieldChange(exp.id, "description", e.target.value)
                                        }
                                        placeholder="Describe your responsibilities, achievements, and impact. Use bullet points for better readability:&#10;• Led development of new features&#10;• Improved system performance by 40%"
                                        className="min-h-[120px] border-slate-200 resize-none"
                                    />
                                    <p className="text-xs text-slate-400">
                                        Tip: Start each line with &quot;•&quot; for bullet points
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {experience.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddExperience}
                                className="w-full h-12 border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Another Position
                            </Button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
