"use client";

import React, { useMemo } from "react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";
import { ResumeData } from "@/components/resume-templates/types";
import {
    TemplateModernDark,
    TemplateElegantSerif,
    TemplateMinimalLines,
    TemplateCreativePattern,
    TemplateClassicFrame,
} from "@/components/resume-templates";

interface LivePreviewProps {
    templateId: string;
    data: BuilderResumeData;
}

// Transform BuilderResumeData to ResumeData for templates
function transformToTemplateData(builder: BuilderResumeData): ResumeData {
    return {
        firstName: builder.personal.firstName || "Your",
        lastName: builder.personal.lastName || "Name",
        title: builder.experience[0]?.title || "Professional",
        summary: builder.summary || undefined,
        contact: {
            email: builder.personal.email || "email@example.com",
            phone: builder.personal.phone || "+1 (555) 000-0000",
            location: builder.personal.city && builder.personal.country
                ? `${builder.personal.city}, ${builder.personal.country}`
                : "City, Country",
            linkedin: builder.personal.linkedin || undefined,
        },
        // FRESHER MODE: If isFresher is true, return empty experience array
        experience: builder.isFresher ? [] : builder.experience.map(exp => ({
            role: exp.title,
            company: exp.company,
            location: "",
            startDate: exp.startDate,
            endDate: exp.current ? "Present" : exp.endDate,
            bullets: exp.description
                .split('\n')
                .map(line => line.replace(/^[•\-*]\s*/, '').trim())
                .filter(Boolean),
        })),
        education: builder.education.map(edu => ({
            degree: edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""),
            institution: edu.school,
            location: "",
            date: edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : "",
        })),
        skills: builder.skills.length > 0 ? builder.skills : ["Add your skills"],
    };
}

// Template components map
const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<{ data: ResumeData }>> = {
    "modern-dark": TemplateModernDark,
    "elegant-serif": TemplateElegantSerif,
    "minimal-lines": TemplateMinimalLines,
    "creative-pattern": TemplateCreativePattern,
    "classic-frame": TemplateClassicFrame,
};

export default function LivePreview({ templateId, data }: LivePreviewProps) {
    const templateData = useMemo(() => transformToTemplateData(data), [data]);

    const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || TemplateModernDark;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    Live Preview
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-500">Auto-updating</span>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex-1 bg-slate-200 rounded-xl p-4 overflow-auto">
                <div className="flex justify-center">
                    {/* Scaled wrapper for visual preview */}
                    <div
                        className="origin-top transform"
                        style={{
                            transform: "scale(0.45)",
                            transformOrigin: "top center",
                            marginBottom: "-55%", // Compensate for scaled height
                        }}
                    >
                        {/* A4 Document - This is the PDF capture target (unscaled) */}
                        <div id="resume-preview-element" className="shadow-2xl bg-white">
                            <TemplateComponent data={templateData} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Fresher Mode Indicator */}
            {data.isFresher && (
                <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                        ✨ <span className="font-medium">Fresher Mode</span> - Experience section hidden
                    </p>
                </div>
            )}
        </div>
    );
}
