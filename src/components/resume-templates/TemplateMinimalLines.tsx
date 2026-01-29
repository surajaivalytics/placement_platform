"use client";

import React from "react";
import { ResumeData } from "./types";

interface TemplateProps {
    data: ResumeData;
}

export default function TemplateMinimalLines({ data }: TemplateProps) {
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

            {/* Body */}
            <div className="px-10 pb-10 space-y-6">
                {/* Summary */}
                {data.summary && (
                    <section>
                        <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-3">
                            Profile
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
                            {data.summary}
                        </p>
                    </section>
                )}

                {/* Experience - Hidden if empty (Fresher Mode) */}
                {data.experience && data.experience.length > 0 && (
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
                )}

                {/* Education */}
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

                {/* Skills */}
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

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section>
                        <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                            Languages
                        </h2>
                        <div className="flex justify-center gap-6">
                            {data.languages.map((lang, index) => (
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
                )}

                {/* Interests */}
                {data.interests && data.interests.length > 0 && (
                    <section>
                        <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                            Interests
                        </h2>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {data.interests.map((interest, index) => (
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
                )}

                {/* Custom Sections */}
                {data.customSections && data.customSections.length > 0 && (
                    data.customSections.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-bold text-center mb-4">
                                {section.title}
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed text-center max-w-2xl mx-auto">
                                {section.content}
                            </p>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
