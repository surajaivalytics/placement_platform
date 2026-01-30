"use client";

import React from "react";
import { ResumeData } from "./types";

interface TemplateProps {
    data: ResumeData;
}

export default function TemplateClassicFrame({ data }: TemplateProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-serif text-slate-800 shadow-lg p-8">
            {/* Inner Frame Border */}
            <div className="border border-slate-300 min-h-[calc(297mm-4rem)]">
                {/* Header Block - Gray Background */}
                <header className="bg-slate-100 px-8 py-8 text-center border-b border-slate-300">
                    <h1 className="text-3xl font-semibold text-slate-800 tracking-wide">
                        {data.firstName} {data.lastName}
                    </h1>
                    <p className="text-lg text-slate-600 mt-1">{data.title}</p>

                    {/* Divider */}
                    <div className="w-16 h-px bg-slate-400 mx-auto mt-4 mb-3" />

                    {/* Contact Info */}
                    <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>{data.contact.email}</span>
                        <span className="text-slate-300">|</span>
                        <span>{data.contact.phone}</span>
                        <span className="text-slate-300">|</span>
                        <span>{data.contact.location}</span>
                    </div>
                </header>

                {/* Body - Two Columns */}
                <div className="flex">
                    {/* Left Column - Main Content (65%) */}
                    <main className="w-[65%] p-6 pr-4 border-r border-slate-200">
                        {/* Summary */}
                        {data.summary && (
                            <section className="mb-6">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                    Summary
                                </h2>
                                <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                            </section>
                        )}

                        {/* Experience - Hidden if empty (Fresher Mode) */}
                        {data.experience && data.experience.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                    Experience
                                </h2>
                                <div className="space-y-5">
                                    {data.experience.map((exp, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">{exp.role}</h3>
                                                    <p className="text-slate-500 text-sm italic">{exp.company}, {exp.location}</p>
                                                </div>
                                                <span className="text-sm text-slate-500">
                                                    {exp.startDate} – {exp.endDate}
                                                </span>
                                            </div>
                                            <ul className="mt-2 space-y-1 pl-4">
                                                {exp.bullets.map((bullet, i) => (
                                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <span className="text-slate-400 mt-0.5">•</span>
                                                        <span>{bullet}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Right Column - Sidebar (35%) */}
                    <aside className="w-[35%] p-6 pl-4 bg-slate-50/50">
                        {/* Contact Details */}
                        <section className="mb-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                Contact
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs">Email</p>
                                    <p className="text-slate-700 break-all">{data.contact.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Phone</p>
                                    <p className="text-slate-700">{data.contact.phone}</p>
                                </div>
                                {data.contact.linkedin && (
                                    <div>
                                        <p className="text-slate-500 text-xs">LinkedIn</p>
                                        <p className="text-slate-700 break-all text-xs">{data.contact.linkedin}</p>
                                    </div>
                                )}
                                {data.contact.website && (
                                    <div>
                                        <p className="text-slate-500 text-xs">Website</p>
                                        <p className="text-slate-700 break-all text-xs">{data.contact.website}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="mb-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                Skills
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {data.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-0.5 bg-slate-200 text-xs text-slate-700 rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section className="mb-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                Education
                            </h2>
                            <div className="space-y-3">
                                {data.education.map((edu, index) => (
                                    <div key={index} className="text-sm">
                                        <p className="font-medium text-slate-800">{edu.degree}</p>
                                        <p className="text-slate-500 text-xs">{edu.institution}</p>
                                        <p className="text-slate-400 text-xs">{edu.date}</p>
                                        {edu.gpa && <p className="text-slate-400 text-xs">GPA: {edu.gpa}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <section className="mb-6">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                    Languages
                                </h2>
                                <div className="space-y-1 text-sm">
                                    {data.languages.map((lang, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-slate-700">{lang.name}</span>
                                            <span className="text-slate-500 text-xs">
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
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                    Interests
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {data.interests.join(", ")}
                                </p>
                            </section>
                        )}

                        {/* Custom Sections */}
                        {data.customSections && data.customSections.length > 0 && (
                            data.customSections.map((section, index) => (
                                <section key={index} className="mb-6">
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
                                        {section.title}
                                    </h2>
                                    <p className="text-sm text-slate-600">{section.content}</p>
                                </section>
                            ))
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
