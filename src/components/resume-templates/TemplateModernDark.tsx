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

export default function TemplateModernDark({
    data,
    sectionOrder = DEFAULT_SECTION_ORDER,
    onMoveSection,
    onReorder,
    isEditable = false,
}: TemplateProps) {
    const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;

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

    // Section rendering functions
    const renderSummary = () => (
        <SortableSection id="summary" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Professional Summary
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm">{data.summary}</p>
            </section>
        </SortableSection>
    );

    const renderExperience = () => (
        <SortableSection id="experience" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Professional Experience
                </h2>
                <div className="space-y-5">
                    {data.experience.map((exp, index) => (
                        <div key={index}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900">{exp.role}</h3>
                                    <p className="text-slate-600">{exp.company}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="italic text-slate-500">
                                        {exp.startDate} - {exp.endDate}
                                    </p>
                                    <p className="text-slate-500">{exp.location}</p>
                                </div>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {exp.bullets.map((bullet, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                        <span className="text-slate-400 mt-1.5">•</span>
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Education
                </h2>
                <div className="space-y-3">
                    {data.education.map((edu, index) => (
                        <div key={index} className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                                <p className="text-slate-600 text-sm">{edu.institution}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-slate-600">{edu.date}</p>
                                <p className="text-slate-500">{edu.location}</p>
                                {edu.gpa && <p className="text-slate-500">GPA: {edu.gpa}</p>}
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Skills
                </h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    {data.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                            <span>{skill}</span>
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderCertifications = () => (
        <SortableSection id="certifications" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Certifications
                </h2>
                <div className="space-y-2">
                    {data.certifications?.map((cert, index) => (
                        <div key={index} className="text-sm text-slate-600">
                            <span className="text-slate-400 mr-2">•</span>
                            {cert}
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderLanguages = () => (
        <SortableSection id="languages" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Languages
                </h2>
                <div className="space-y-3">
                    {data.languages?.map((lang, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <span className="w-24 text-sm text-slate-700 font-medium">{lang.name}</span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-slate-700 rounded-full transition-all duration-300"
                                    style={{ width: `${lang.proficiency}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500 w-10 text-right">{lang.proficiency}%</span>
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderAwards = () => (
        <SortableSection id="awards" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Awards & Honors
                </h2>
                <div className="space-y-2">
                    {data.awards?.map((award, index) => (
                        <div key={index} className="text-sm text-slate-600">
                            <span className="text-slate-400 mr-2">•</span>
                            {award}
                        </div>
                    ))}
                </div>
            </section>
        </SortableSection>
    );

    const renderInterests = () => (
        <SortableSection id="interests" isEditable={isEditable}>
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                    {data.interests?.map((interest, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-slate-100 text-sm text-slate-600 rounded"
                        >
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
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                        {section.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm">{section.content}</p>
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
        <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800 shadow-lg">
            {/* Header Section */}
            <header className="bg-slate-800 text-white px-8 py-6">
                <div className="flex items-center gap-6">
                    {/* Initials Box */}
                    <div className="w-16 h-16 border-2 border-white flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold tracking-wide">{initials}</span>
                    </div>

                    {/* Name & Contact */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-wide uppercase">
                            {data.firstName} {data.lastName}
                        </h1>
                        <p className="text-slate-300 mt-1 text-lg">{data.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-slate-300">
                            <span>{data.contact.email}</span>
                            <span className="text-slate-500">|</span>
                            <span>{data.contact.phone}</span>
                            <span className="text-slate-500">|</span>
                            <span>{data.contact.location}</span>
                            {data.contact.linkedin && (
                                <>
                                    <span className="text-slate-500">|</span>
                                    <span>{data.contact.linkedin}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Body - Dynamic Section Ordering with DND */}
            <div className="p-8 space-y-6">
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
