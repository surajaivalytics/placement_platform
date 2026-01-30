"use client";

import React from "react";
import { ResumeData } from "./types";

interface TemplateProps {
    data: ResumeData;
}

export default function TemplateElegantSerif({ data }: TemplateProps) {
    const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`;

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-serif text-slate-800 shadow-lg">
            {/* Header Section - Centered */}
            <header className="pt-10 pb-6 px-8 text-center">
                {/* Circle Monogram */}
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center mx-auto">
                    <span className="text-xl font-semibold tracking-wide">{initials}</span>
                </div>

                {/* Name */}
                <h1 className="text-4xl font-normal tracking-[0.3em] uppercase mt-5 text-slate-900">
                    {data.firstName} {data.lastName}
                </h1>
                <p className="text-lg text-slate-600 mt-2 tracking-wide">{data.title}</p>

                {/* Divider */}
                <div className="w-24 h-px bg-slate-400 mx-auto mt-5 mb-4" />

                {/* Contact Info */}
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    <span>{data.contact.email}</span>
                    <span className="text-slate-300">•</span>
                    <span>{data.contact.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span>{data.contact.location}</span>
                </div>
            </header>

            {/* Body */}
            <div className="px-10 pb-10 space-y-8">
                {/* Summary */}
                {data.summary && (
                    <section>
                        <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                            <span className="flex-1 border-t border-slate-300" />
                            <span>Profile</span>
                            <span className="flex-1 border-t border-slate-300" />
                        </h2>
                        <p className="text-slate-700 leading-relaxed text-center italic">{data.summary}</p>
                    </section>
                )}

                {/* Experience - Hidden if empty (Fresher Mode) */}
                {data.experience && data.experience.length > 0 && (
                    <section>
                        <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                            <span className="flex-1 border-t border-slate-300" />
                            <span>Experience</span>
                            <span className="flex-1 border-t border-slate-300" />
                        </h2>
                        <div className="space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="text-center">
                                    <h3 className="text-lg font-semibold text-slate-900">{exp.role}</h3>
                                    <p className="text-slate-600 mt-1">
                                        {exp.company} • {exp.location}
                                    </p>
                                    <p className="text-sm italic text-slate-500 mt-1">
                                        {exp.startDate} — {exp.endDate}
                                    </p>
                                    <ul className="mt-3 text-left max-w-2xl mx-auto space-y-1">
                                        {exp.bullets.map((bullet, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <span className="text-slate-400 mt-0.5">◦</span>
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
                    <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                        <span className="flex-1 border-t border-slate-300" />
                        <span>Education</span>
                        <span className="flex-1 border-t border-slate-300" />
                    </h2>
                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                            <div key={index} className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900">{edu.degree}</h3>
                                <p className="text-slate-600">{edu.institution}</p>
                                <p className="text-sm text-slate-500">
                                    {edu.location} • {edu.date}
                                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section>
                    <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                        <span className="flex-1 border-t border-slate-300" />
                        <span>Skills</span>
                        <span className="flex-1 border-t border-slate-300" />
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {data.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-4 py-1.5 border border-slate-300 text-sm text-slate-700 rounded-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <section>
                        <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                            <span className="flex-1 border-t border-slate-300" />
                            <span>Languages</span>
                            <span className="flex-1 border-t border-slate-300" />
                        </h2>
                        <div className="flex justify-center gap-8">
                            {data.languages.map((lang, index) => (
                                <div key={index} className="text-center">
                                    <p className="font-medium text-slate-800">{lang.name}</p>
                                    <p className="text-sm text-slate-500 italic">
                                        {lang.proficiency >= 90
                                            ? "Native"
                                            : lang.proficiency >= 70
                                                ? "Fluent"
                                                : lang.proficiency >= 50
                                                    ? "Intermediate"
                                                    : "Basic"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Interests */}
                {data.interests && data.interests.length > 0 && (
                    <section>
                        <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                            <span className="flex-1 border-t border-slate-300" />
                            <span>Interests</span>
                            <span className="flex-1 border-t border-slate-300" />
                        </h2>
                        <p className="text-center text-slate-600 italic">
                            {data.interests.join(" • ")}
                        </p>
                    </section>
                )}

                {/* Custom Sections */}
                {data.customSections && data.customSections.length > 0 && (
                    data.customSections.map((section, index) => (
                        <section key={index}>
                            <h2 className="flex items-center gap-4 text-sm uppercase tracking-[0.2em] text-slate-700 mb-4">
                                <span className="flex-1 border-t border-slate-300" />
                                <span>{section.title}</span>
                                <span className="flex-1 border-t border-slate-300" />
                            </h2>
                            <p className="text-slate-700 leading-relaxed text-center">{section.content}</p>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
