"use client";

import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ResumeData, SectionKey, DEFAULT_SECTION_ORDER, TemplateProps } from "./types";
import { SortableSection } from "./SortableSection";

export default function TemplateMinimalLines({
    data,
    sectionOrder = DEFAULT_SECTION_ORDER,
    onMoveSection,
    onReorder,
    isEditable = false,
}: TemplateProps) {

    // Helper to check if we can move up/down
    // (Legacy support or fallback if needed, but we used DND now)

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
            const newIndex = sectionOrder.indexOf(over.id as SectionKey);
            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder?.(arrayMove(sectionOrder, oldIndex, newIndex));
            }
        }
    };

    // Render functions using SortableSection
    const renderSummary = () => (
        <SortableSection id="summary" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-3">
                    Profile
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
                    {data.summary}
                </p>
            </section>
        </SortableSection>
    );

    const renderExperience = () => (
        <SortableSection id="experience" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Professional Experience
                </h2>
                <div className="space-y-5">
                    {data.experience.map((exp, index) => (
                        <div key={index}>
                            {/* Row 1: Role ... Dates */}
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-semibold text-slate-800">{exp.role}</h3>
                                <span className="font-bold text-sm text-slate-700">
                                    {exp.startDate} — {exp.endDate}
                                </span>
                            </div>
                            {/* Row 2: Company ... Location */}
                            <div className="flex justify-between items-baseline mt-0.5">
                                <p className="text-slate-600 text-sm">{exp.company}</p>
                                <span className="text-sm text-slate-500">{exp.location}</span>
                            </div>
                            {/* Bullets - Dense */}
                            <ul className="mt-2 space-y-0.5 pl-4">
                                {exp.bullets.map((bullet, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-xs text-slate-400 mt-1">•</span>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderEducation = () => (
        <SortableSection id="education" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Education
                </h2>
                <div className="space-y-3">
                    {data.education.map((edu, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-semibold text-slate-800">{edu.degree}</h3>
                                <span className="font-bold text-sm text-slate-700">{edu.date}</span>
                            </div>
                            <div className="flex justify-between items-baseline mt-0.5">
                                <p className="text-slate-600 text-sm">{edu.institution}</p>
                                <span className="text-sm text-slate-500">
                                    {edu.location}
                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderSkills = () => (
        <SortableSection id="skills" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Skills
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {data.skills.map((skill, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 text-sm text-slate-700 rounded"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderCertifications = () => (
        <SortableSection id="certifications" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Certifications
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {data.certifications?.map((cert, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 text-sm text-slate-700 rounded"
                        >
                            {cert}
                        </span>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderLanguages = () => (
        <SortableSection id="languages" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Languages
                </h2>
                <div className="flex justify-center gap-6">
                    {data.languages?.map((lang, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="font-medium text-slate-700">{lang.name}</span>
                            <span className="text-slate-400">—</span>
                            <span className="text-sm text-slate-500">
                                {lang.proficiency >= 90
                                    ? "Native"
                                    : lang.proficiency >= 70
                                        ? "Fluent"
                                        : lang.proficiency >= 50
                                            ? "Intermediate"
                                            : "Basic"}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderAwards = () => (
        <SortableSection id="awards" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Awards & Honors
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {data.awards?.map((award, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-amber-100 text-sm text-amber-800 rounded"
                        >
                            {award}
                        </span>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderInterests = () => (
        <SortableSection id="interests" isEditable={isEditable}>
            <section>
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                    Interests
                </h2>
                <div className="flex justify-center gap-4 flex-wrap">
                    {data.interests?.map((interest, index) => (
                        <span
                            key={index}
                            className="flex items-center gap-2 text-sm text-slate-600"
                        >
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            {interest}
                        </span>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderCustomSections = () => (
        <SortableSection id="customSections" isEditable={isEditable}>
            {data.customSections?.map((section, index) => (
                <section key={index}>
                    <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                        {section.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
                        {section.content}
                    </p>
                </section>
            ))}
        </SortableSection>
    );

    const sectionRenderers: Record<SectionKey, () => React.ReactNode> = {
        summary: renderSummary,
        experience: renderExperience,
        education: renderEducation,
        skills: renderSkills,
        certifications: renderCertifications,
        languages: renderLanguages,
        awards: renderAwards,
        interests: renderInterests,
        customSections: renderCustomSections,
    };

    // Filter to only active and populated sections
    const activeSections = sectionOrder.filter(key => {
        if (key === 'summary' && !data.summary) return false;
        if (key === 'experience' && (!data.experience || data.experience.length === 0)) return false;
        if (key === 'education' && (!data.education || data.education.length === 0)) return false;
        if (key === 'skills' && (!data.skills || data.skills.length === 0)) return false;
        if (key === 'certifications' && (!data.certifications || data.certifications.length === 0)) return false;
        if (key === 'languages' && (!data.languages || data.languages.length === 0)) return false;
        if (key === 'awards' && (!data.awards || data.awards.length === 0)) return false;
        if (key === 'interests' && (!data.interests || data.interests.length === 0)) return false;
        if (key === 'customSections' && (!data.customSections || data.customSections.length === 0)) return false;
        return true;
    });

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-700 shadow-lg">
            {/* Header Section */}
            <header className="px-10 pt-10 pb-6">
                {/* Name - Center Aligned, Heavy Bold */}
                <h1 className="text-4xl font-extrabold text-center text-slate-700 tracking-tight">
                    {data.firstName.toUpperCase()} {data.lastName.toUpperCase()}
                </h1>
                <p className="text-center text-slate-500 mt-2">{data.title}</p>

                {/* Double Line Separator with Contact */}
                <div className="mt-6 border-t border-b border-slate-300 py-3">
                    <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                        <span>{data.contact.email}</span>
                        <span>{data.contact.phone}</span>
                        <span>{data.contact.location}</span>
                        {data.contact.linkedin && <span>{data.contact.linkedin}</span>}
                        {data.contact.website && <span>{data.contact.website}</span>}
                    </div>
                </div>
            </header>

            {/* Body - Dynamic Order with DND */}
            <div className="px-10 pb-10 space-y-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={activeSections}
                        strategy={verticalListSortingStrategy}
                    >
                        {activeSections.map(key => (
                            <React.Fragment key={key}>
                                {sectionRenderers[key]?.()}
                            </React.Fragment>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
