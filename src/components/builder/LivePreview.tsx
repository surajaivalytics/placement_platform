"use client";

import React, { useMemo } from "react";
import { BuilderResumeData } from "@/lib/builder/builderTypes";
import { ResumeData, SectionKey, DEFAULT_SECTION_ORDER } from "@/components/resume-templates/types";
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
    sectionOrder?: SectionKey[];
    onMoveSection?: (sectionKey: SectionKey, direction: 'up' | 'down') => void;
    onReorder?: (newOrder: SectionKey[]) => void;
}

// Transform BuilderResumeData to ResumeData for templates
function transformToTemplateData(builder: BuilderResumeData): ResumeData {
    // Helper to convert proficiency string to number
    const proficiencyToNumber = (proficiency: string): number => {
        switch (proficiency) {
            case "Native": return 100;
            case "Fluent": return 80;
            case "Intermediate": return 50;
            case "Beginner": return 30;
            default: return 50;
        }
    };

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
            gpa: edu.score, // CGPA/Score from education form
        })),
        skills: builder.skills.length > 0 ? builder.skills : ["Add your skills"],
        // Additional details from Step 6
        languages: builder.languages?.map(l => ({
            name: l.language,
            proficiency: proficiencyToNumber(l.proficiency),
        })),
        interests: builder.interests,
        awards: builder.awards, // Separate from interests
        certifications: builder.certifications?.map(c =>
            c.year ? `${c.name} - ${c.issuer} (${c.year})` : `${c.name} - ${c.issuer}`
        ),
        customSections: builder.customSections?.map(s => ({
            title: s.title,
            content: s.content,
        })),
    };
}

// Template components map - now using TemplateProps
const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<{
    data: ResumeData;
    sectionOrder?: SectionKey[];
    onMoveSection?: (sectionKey: SectionKey, direction: 'up' | 'down') => void;
    onReorder?: (newOrder: SectionKey[]) => void;
    isEditable?: boolean;
}>> = {
    "modern-dark": TemplateModernDark,
    "elegant-serif": TemplateElegantSerif,
    "minimal-lines": TemplateMinimalLines,
    "creative-pattern": TemplateCreativePattern,
    "classic-frame": TemplateClassicFrame,
};

export default function LivePreview({ templateId, data, sectionOrder, onMoveSection, onReorder }: LivePreviewProps) {
    const templateData = useMemo(() => transformToTemplateData(data), [data]);

    const TemplateComponent = TEMPLATE_COMPONENTS[templateId] || TemplateModernDark;

    // Use provided section order or default
    const effectiveSectionOrder = sectionOrder || DEFAULT_SECTION_ORDER;

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

            {/* Tip for section reordering */}
            {onMoveSection && (
                <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                        💡 <span className="font-medium">Tip:</span> Hover over sections in the preview to reorder them
                    </p>
                </div>
            )}

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
                            <TemplateComponent
                                data={templateData}
                                sectionOrder={effectiveSectionOrder}
                                onMoveSection={onMoveSection}
                                onReorder={onReorder}
                                isEditable={!!onMoveSection || !!onReorder}
                            />
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

