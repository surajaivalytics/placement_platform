"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Globe,
    Award,
    Trophy,

    X,
    Check,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import {
    BuilderResumeData,
    BuilderLanguage,
    BuilderCertification,

    generateId,
} from "@/lib/builder/builderTypes";

interface StepExtrasProps {
    data: BuilderResumeData;
    onChange: (data: BuilderResumeData) => void;
}

type ProficiencyLevel = "Native" | "Fluent" | "Intermediate" | "Beginner";

const PROFICIENCY_OPTIONS: ProficiencyLevel[] = ["Native", "Fluent", "Intermediate", "Beginner"];

// Accordion Item Component
interface AccordionItemProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    count: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function AccordionItem({ id, title, icon, count, isExpanded, onToggle, children }: AccordionItemProps) {
    return (
        <div className="w-full">
            {/* Accordion Header */}
            <button
                type="button"
                onClick={onToggle}
                className={`w-full p-4 bg-white border rounded-lg shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md ${isExpanded ? "rounded-b-none border-b-0" : ""
                    }`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-sm">
                        {icon}
                    </div>
                    <span className="font-semibold text-slate-800 text-lg">{title}</span>
                    {count > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 text-sm font-medium rounded-full">
                            <Check className="w-3.5 h-3.5" />
                            {count} added
                        </span>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </motion.div>
            </button>

            {/* Accordion Body */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-50 p-6 border border-t-0 rounded-b-lg">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function StepExtras({ data, onChange }: StepExtrasProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Language form state
    const [newLanguage, setNewLanguage] = useState("");
    const [newProficiency, setNewProficiency] = useState<ProficiencyLevel>("Fluent");

    // Certification form state
    const [newCertName, setNewCertName] = useState("");
    const [newCertIssuer, setNewCertIssuer] = useState("");
    const [newCertYear, setNewCertYear] = useState("");

    // Awards form state
    const [newAward, setNewAward] = useState("");



    const toggleAccordion = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Language handlers
    const addLanguage = () => {
        if (!newLanguage.trim()) return;
        const lang: BuilderLanguage = {
            language: newLanguage.trim(),
            proficiency: newProficiency,
        };
        onChange({
            ...data,
            languages: [...(data.languages || []), lang],
        });
        setNewLanguage("");
        setNewProficiency("Fluent");
    };

    const removeLanguage = (index: number) => {
        onChange({
            ...data,
            languages: data.languages.filter((_, i) => i !== index),
        });
    };

    // Certification handlers
    const addCertification = () => {
        if (!newCertName.trim()) return;
        const cert: BuilderCertification = {
            id: generateId(),
            name: newCertName.trim(),
            issuer: newCertIssuer.trim(),
            year: newCertYear.trim(),
        };
        onChange({
            ...data,
            certifications: [...(data.certifications || []), cert],
        });
        setNewCertName("");
        setNewCertIssuer("");
        setNewCertYear("");
    };

    const removeCertification = (id: string) => {
        onChange({
            ...data,
            certifications: data.certifications.filter((c) => c.id !== id),
        });
    };

    // Awards handlers
    const addAward = () => {
        if (!newAward.trim()) return;
        onChange({
            ...data,
            awards: [...(data.awards || []), newAward.trim()],
        });
        setNewAward("");
    };

    const removeAward = (index: number) => {
        onChange({
            ...data,
            awards: data.awards.filter((_, i) => i !== index),
        });
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
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Additional Details</h2>
                <p className="text-slate-500 mt-1">
                    Add optional sections to make your resume stand out
                </p>
            </div>

            {/* Vertical Accordion Stack */}
            <div className="flex flex-col space-y-4">
                {/* Languages Accordion */}
                <AccordionItem
                    id="languages"
                    title="Languages"
                    icon={<Globe className="w-5 h-5" />}
                    count={data.languages?.length || 0}
                    isExpanded={expandedId === "languages"}
                    onToggle={() => toggleAccordion("languages")}
                >
                    <div className="space-y-4">
                        {/* Existing Languages */}
                        {data.languages?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {data.languages.map((lang, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-full text-sm"
                                    >
                                        <span className="font-medium">{lang.language}</span>
                                        <span className="text-slate-500">({lang.proficiency})</span>
                                        <button
                                            type="button"
                                            onClick={() => removeLanguage(idx)}
                                            className="p-0.5 hover:bg-slate-200 rounded-full"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add Language Form */}
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Language</Label>
                                <Input
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    placeholder="e.g., English, Spanish, French"
                                    className="h-12 text-base border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    onKeyDown={(e) => e.key === "Enter" && addLanguage()}
                                />
                            </div>
                            <div className="w-48">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Proficiency</Label>
                                <select
                                    value={newProficiency}
                                    onChange={(e) => setNewProficiency(e.target.value as ProficiencyLevel)}
                                    className="w-full h-12 px-4 border border-slate-200 rounded-md text-base bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    {PROFICIENCY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                type="button"
                                onClick={addLanguage}
                                className="h-12 px-6 bg-slate-900 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all duration-300"
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </AccordionItem>

                {/* Certifications Accordion */}
                <AccordionItem
                    id="certifications"
                    title="Certifications"
                    icon={<Award className="w-5 h-5" />}
                    count={data.certifications?.length || 0}
                    isExpanded={expandedId === "certifications"}
                    onToggle={() => toggleAccordion("certifications")}
                >
                    <div className="space-y-4">
                        {/* Existing Certifications */}
                        {data.certifications?.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {data.certifications.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="flex items-center justify-between px-4 py-3 bg-slate-100 rounded-lg"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-900">{cert.name}</span>
                                            {cert.issuer && (
                                                <span className="text-slate-600 ml-2">— {cert.issuer}</span>
                                            )}
                                            {cert.year && (
                                                <span className="text-slate-400 ml-2">({cert.year})</span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeCertification(cert.id)}
                                            className="p-1.5 hover:bg-slate-200 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Certification Form */}
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Certification Name *</Label>
                                <Input
                                    value={newCertName}
                                    onChange={(e) => setNewCertName(e.target.value)}
                                    placeholder="e.g., AWS Solutions Architect"
                                    className="h-12 text-base border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <div className="w-1/4">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Issuer</Label>
                                <Input
                                    value={newCertIssuer}
                                    onChange={(e) => setNewCertIssuer(e.target.value)}
                                    placeholder="e.g., Amazon"
                                    className="h-12 text-base border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <div className="w-32">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Year</Label>
                                <Input
                                    value={newCertYear}
                                    onChange={(e) => setNewCertYear(e.target.value)}
                                    placeholder="2024"
                                    className="h-12 text-base border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={addCertification}
                                className="h-12 px-6 bg-slate-900 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all duration-300"
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </AccordionItem>

                {/* Awards & Honors Accordion */}
                <AccordionItem
                    id="awards"
                    title="Awards & Honors"
                    icon={<Trophy className="w-5 h-5" />}
                    count={data.awards?.length || 0}
                    isExpanded={expandedId === "awards"}
                    onToggle={() => toggleAccordion("awards")}
                >
                    <div className="space-y-4">
                        {/* Existing Awards */}
                        {data.awards?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {data.awards.map((award, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-800 rounded-full text-sm border border-teal-100"
                                    >
                                        {award}
                                        <button
                                            type="button"
                                            onClick={() => removeAward(idx)}
                                            className="p-0.5 hover:bg-teal-200 rounded-full"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add Award Form */}
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label className="text-sm text-slate-600 mb-1.5 block">Award or Honor</Label>
                                <Input
                                    value={newAward}
                                    onChange={(e) => setNewAward(e.target.value)}
                                    placeholder="e.g., Dean's List, Employee of the Month, Hackathon Winner"
                                    className="h-12 text-base border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                    onKeyDown={(e) => e.key === "Enter" && addAward()}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={addAward}
                                className="h-12 px-6 bg-slate-900 text-white shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all duration-300"
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                </AccordionItem>


            </div>

            {/* Helper Note */}
            <div className="text-center text-sm text-slate-400 mt-6">
                All sections are optional. Skip if not applicable.
            </div>
        </motion.div>
    );
}
