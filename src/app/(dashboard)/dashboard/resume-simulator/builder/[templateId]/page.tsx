"use client";

import React, { useState, use, useEffect } from "react";
import { BuilderResumeData, initialBuilderData } from "@/lib/builder/builderTypes";
import { downloadResumePDF } from "@/lib/download-pdf";
import { SectionKey, DEFAULT_SECTION_ORDER } from "@/components/resume-templates/types";
import FormWizard from "@/components/builder/FormWizard";
import LivePreview from "@/components/builder/LivePreview";
import { ArrowLeft, FileText, Shuffle } from "lucide-react";
import Link from "next/link";

interface BuilderPageProps {
    params: Promise<{ templateId: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
    const { templateId } = use(params);
    const [resumeData, setResumeData] = useState<BuilderResumeData>(initialBuilderData);
    const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_SECTION_ORDER);

    // Load data from simulation if available
    useEffect(() => {
        const storedData = localStorage.getItem('parsedResumeData');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);

                // Helper to ensure every list item has an ID
                const addIds = (list: any[]) => {
                    if (!Array.isArray(list)) return [];
                    return list.map(item => ({
                        ...item,
                        id: item.id || crypto.randomUUID()
                    }));
                };

                // Merge with initial data to ensure all fields exist
                setResumeData((prev) => ({
                    ...initialBuilderData,
                    ...parsed,
                    // Ensure sub-objects are also merged safely if needed
                    personal: { ...initialBuilderData.personal, ...parsed.personal },
                    summary: parsed.summary || prev.summary,
                    // Inject IDs into arrays so React lists work
                    education: addIds(parsed.education),
                    experience: addIds(parsed.experience),
                    skills: Array.isArray(parsed.skills) ? parsed.skills : prev.skills
                }));

                // Clear storage to prevent re-loading on refresh
                localStorage.removeItem('parsedResumeData');
            } catch (e) {
                console.error("Failed to parse resume data", e);
            }
        }
    }, [])

    const handleDownload = async () => {
        const name = resumeData.personal.firstName || "My";
        await downloadResumePDF(name);
    };

    // Section reordering handler
    const handleMoveSection = (sectionKey: SectionKey, direction: 'up' | 'down') => {
        setSectionOrder((prev) => {
            const currentIndex = prev.indexOf(sectionKey);
            if (currentIndex === -1) return prev;

            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newOrder = [...prev];
            [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
            return newOrder;
        });
    };

    // Reset section order to default
    const handleResetOrder = () => {
        setSectionOrder(DEFAULT_SECTION_ORDER);
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/resume-simulator/templates"
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Templates</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-slate-800">Resume Builder</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Reset Order Button */}
                    <button
                        onClick={handleResetOrder}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        title="Reset section order"
                    >
                        <Shuffle className="w-4 h-4" />
                        <span>Reset Order</span>
                    </button>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="text-sm text-slate-500">Template:</span>
                    <span className="text-sm font-medium text-slate-800 bg-slate-100 px-3 py-1 rounded-full capitalize">
                        {templateId.replace(/-/g, " ")}
                    </span>
                </div>
            </header>

            {/* Main Content - 50/50 Split */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel - Form Wizard (50%) */}
                <section className="w-1/2 border-r border-slate-200 bg-white overflow-y-auto">
                    <div className="max-w-xl mx-auto p-8 h-full">
                        <FormWizard
                            data={resumeData}
                            onChange={setResumeData}
                            onDownload={handleDownload}
                        />
                    </div>
                </section>

                {/* Right Panel - Live Preview (50%) */}
                <section className="w-1/2 bg-slate-100 p-6 overflow-hidden">
                    <LivePreview
                        templateId={templateId}
                        data={resumeData}
                        sectionOrder={sectionOrder}
                        onMoveSection={handleMoveSection}
                        onReorder={setSectionOrder}
                    />
                </section>
            </main>
        </div>
    );
}
