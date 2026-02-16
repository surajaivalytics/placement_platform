"use client";

import React, { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, X, Plus } from "lucide-react";

interface StepSkillsProps {
    skills: string[];
    onChange: (skills: string[]) => void;
}

const SUGGESTED_SKILLS = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python",
    "Java", "SQL", "Git", "AWS", "Docker", "Agile/Scrum",
    "Communication", "Problem Solving", "Team Leadership"
];

export default function StepSkills({ skills, onChange }: StepSkillsProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            addSkill(inputValue.trim());
        }
    };

    const addSkill = (skill: string) => {
        if (skill && !skills.includes(skill)) {
            onChange([...skills, skill]);
        }
        setInputValue("");
    };

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter((skill) => skill !== skillToRemove));
    };

    const availableSuggestions = SUGGESTED_SKILLS.filter(
        (skill) => !skills.includes(skill)
    ).slice(0, 8);

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
                    <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
                <p className="text-slate-500 mt-1">Showcase your expertise and abilities</p>
            </div>

            {/* Input */}
            <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                    Add a skill and press Enter
                </Label>
                <div className="relative">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a skill and press Enter..."
                        className="h-12 pr-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            onClick={() => addSkill(inputValue.trim())}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-teal-600 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Skills Cloud */}
            <div className="space-y-3">
                <Label className="text-slate-700 font-medium">
                    Your Skills ({skills.length})
                </Label>
                <div className="min-h-[100px] border-2 border-dashed border-slate-200 rounded-xl p-4">
                    {skills.length === 0 ? (
                        <div className="text-center text-slate-400 py-6">
                            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No skills added yet. Start typing above!</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {skills.map((skill) => (
                                    <motion.span
                                        key={skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 text-teal-900 rounded-full text-sm font-medium border border-teal-200 hover:shadow-md transition-shadow"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="p-0.5 hover:bg-teal-200 rounded-full transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Suggestions */}
            {availableSuggestions.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-slate-500 text-sm">
                        Quick add suggestions:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {availableSuggestions.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => addSkill(skill)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-300"
                            >
                                + {skill}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
