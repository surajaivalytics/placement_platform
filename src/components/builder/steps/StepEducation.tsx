"use client";

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import {
    BuilderEducation,
    createEmptyEducation
} from "@/lib/builder/builderTypes";

interface StepEducationProps {
    education: BuilderEducation[];
    onChange: (education: BuilderEducation[]) => void;
}

export default function StepEducation({ education, onChange }: StepEducationProps) {
    const handleAddEducation = () => {
        onChange([...education, createEmptyEducation()]);
    };

    const handleRemoveEducation = (id: string) => {
        onChange(education.filter((edu) => edu.id !== id));
    };

    const handleFieldChange = (
        id: string,
        field: keyof BuilderEducation,
        value: string
    ) => {
        onChange(
            education.map((edu) =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        );
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
                    <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Education</h2>
                <p className="text-slate-500 mt-1">Add your educational background</p>
            </div>

            {/* Education Entries */}
            <div className="space-y-6">
                {education.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 mb-4">No education added yet</p>
                        <Button
                            type="button"
                            onClick={handleAddEducation}
                            className="bg-slate-900 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition-all duration-300"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your Education
                        </Button>
                    </div>
                )}

                {education.map((edu, index) => (
                    <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-900">
                                Education {index + 1}
                            </h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEducation(edu.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">School/University *</Label>
                                <Input
                                    value={edu.school}
                                    onChange={(e) => handleFieldChange(edu.id, "school", e.target.value)}
                                    placeholder="Stanford University"
                                    className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Degree *</Label>
                                    <Input
                                        value={edu.degree}
                                        onChange={(e) => handleFieldChange(edu.id, "degree", e.target.value)}
                                        placeholder="Bachelor of Science"
                                        className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Field of Study *</Label>
                                    <Input
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => handleFieldChange(edu.id, "fieldOfStudy", e.target.value)}
                                        placeholder="Computer Science"
                                        className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Start Date *</Label>
                                    <Input
                                        value={edu.startDate}
                                        onChange={(e) => handleFieldChange(edu.id, "startDate", e.target.value)}
                                        placeholder="Sep 2018"
                                        className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">End Date *</Label>
                                    <Input
                                        value={edu.endDate}
                                        onChange={(e) => handleFieldChange(edu.id, "endDate", e.target.value)}
                                        placeholder="May 2022"
                                        className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700">Score / CGPA</Label>
                                <Input
                                    value={edu.score || ""}
                                    onChange={(e) => handleFieldChange(edu.id, "score", e.target.value)}
                                    placeholder="e.g., 9.0/10 or 85%"
                                    className="h-11 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}

                {education.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddEducation}
                        className="w-full h-12 border-dashed border-2 border-slate-300 hover:border-teal-500 hover:bg-teal-50 text-slate-600 hover:text-slate-900"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Education
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
