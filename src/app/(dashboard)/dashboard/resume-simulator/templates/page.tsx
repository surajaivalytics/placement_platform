"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RESUME_TEMPLATES } from "@/lib/resume-templates";
import TemplateRenderer from "@/components/resume-builder/TemplateRenderer";
import ResumeThumbnail from "@/components/resume-builder/ResumeThumbnail";
import { sampleResumeData } from "@/components/resume-templates/types";
import ResumeUploadModal from "@/components/dashboard/ResumeUploadModal";

/* -------------------- Template Card Component -------------------- */

const TemplateCard = ({
    template,
    index,
    isUploadMode,
    onSelect
}: {
    template: (typeof RESUME_TEMPLATES)[0];
    index: number;
    isUploadMode: boolean;
    onSelect: (templateId: string) => void;
}) => {
    const router = useRouter();

    const handleSelect = () => {
        if (isUploadMode) {
            onSelect(template.id);
        } else {
            router.push(`/dashboard/resume-simulator/builder/${template.id}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
        >
            {/* Thumbnail with Dynamic Scaling */}
            <ResumeThumbnail onSelect={handleSelect} showButton={true}>
                <TemplateRenderer templateId={template.id} data={sampleResumeData} />
            </ResumeThumbnail>

            {/* Template Info */}
            <div className="mt-3 text-center">
                <h3 className="font-semibold text-slate-700">{template.name}</h3>
                <p className="text-sm text-slate-500 capitalize">{template.category}</p>
            </div>
        </motion.div>
    );
};

/* -------------------- Main Page Component -------------------- */

export default function TemplatesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const mode = searchParams.get('mode');
    const isUploadMode = mode === 'upload';

    useEffect(() => {
        if (isUploadMode) {
            // Optionally show a toast or indicator that they need to pick a template first
        }
    }, [isUploadMode]);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setIsUploadModalOpen(true);
    };

    const handleModalClose = () => {
        setIsUploadModalOpen(false);
        // Optional: clear mode from URL if they cancel?
        // router.push('/dashboard/resume-simulator/templates');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <ResumeUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={handleModalClose}
                    templateId={selectedTemplateId}
                />

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                        {isUploadMode ? "Choose a template for your uploaded resume" : "Templates recommended for you"}
                    </h1>
                    <p className="text-lg text-slate-500">
                        {isUploadMode
                            ? "We'll apply your resume data to the selected template."
                            : "You can always change your template later."
                        }
                    </p>
                </motion.div>

                {/* Template Grid - Real Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {RESUME_TEMPLATES.map((template, index) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            index={index}
                            isUploadMode={isUploadMode}
                            onSelect={handleTemplateSelect}
                        />
                    ))}
                </div>

                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/dashboard/resume-simulator"
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        ← Back to Resume Simulator
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
