"use client";

import React from "react";
import { ResumeData } from "./types";

interface TemplateProps {
    data: ResumeData;
}

export default function TemplateModernDark({ data }: TemplateProps) {
    const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;

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

            {/* Body */}
            <div className="p-8 space-y-6">
                {/* Summary */}
                {data.summary && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                            Professional Summary
                        </h2>
                        <p className="text-slate-600 leading-relaxed text-sm">{data.summary}</p>
                    </section>
                )}

                {/* Experience - Hidden if empty (Fresher Mode) */}
                {data.experience && data.experience.length > 0 && (
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
                )}

                {/* Education */}
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

                {/* Skills - 2 Column Grid */}
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

                {/* Languages - Progress Bar Style */}
                {data.languages && data.languages.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                            Languages
                        </h2>
                        <div className="space-y-3">
                            {data.languages.map((lang, index) => (
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
                )}

                {/* Custom Sections */}
                {data.customSections && data.customSections.length > 0 && (
                    data.customSections.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2 mb-4">
                                {section.title}
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-sm">{section.content}</p>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
