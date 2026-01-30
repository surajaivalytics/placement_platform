"use client";

import React from "react";
import { ResumeData } from "./types";

interface TemplateProps {
    data: ResumeData;
}

export default function TemplateCreativePattern({ data }: TemplateProps) {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white font-sans text-slate-800 shadow-lg flex">
            {/* Left Sidebar - 30% */}
            <aside
                className="w-[30%] bg-slate-800 text-white p-6 flex flex-col"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                }}
            >
                {/* Profile Photo Placeholder */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                    {data.firstName.charAt(0)}{data.lastName.charAt(0)}
                </div>

                {/* Contact Section - Gray Box */}
                <div className="bg-slate-700/60 rounded-lg p-4 mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                        Contact
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <p className="text-slate-400 text-xs">Email</p>
                            <p className="text-white break-all">{data.contact.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Phone</p>
                            <p className="text-white">{data.contact.phone}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs">Location</p>
                            <p className="text-white">{data.contact.location}</p>
                        </div>
                        {data.contact.linkedin && (
                            <div>
                                <p className="text-slate-400 text-xs">LinkedIn</p>
                                <p className="text-white break-all text-xs">{data.contact.linkedin}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills Section */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                        Skills
                    </h3>
                    <div className="space-y-2">
                        {data.skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                <span className="text-slate-100">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                            Languages
                        </h3>
                        <div className="space-y-2">
                            {data.languages.map((lang, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-100">{lang.name}</span>
                                        <span className="text-slate-400 text-xs">{lang.proficiency}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                                            style={{ width: `${lang.proficiency}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                <div className="mt-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                        Education
                    </h3>
                    <div className="space-y-3">
                        {data.education.map((edu, index) => (
                            <div key={index} className="text-sm">
                                <p className="font-medium text-white">{edu.degree}</p>
                                <p className="text-slate-300 text-xs">{edu.institution}</p>
                                <p className="text-slate-400 text-xs">{edu.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Right Content - 70% */}
            <main className="flex-1 p-8">
                {/* Header */}
                <header className="mb-8 text-right">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                        {data.firstName} {data.lastName}
                    </h1>
                    <p className="text-xl text-slate-500 mt-1">{data.title}</p>
                </header>

                {/* Summary */}
                {data.summary && (
                    <section className="mb-8">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                            <span className="w-6 h-px bg-slate-300" />
                            Profile
                        </h2>
                        <p className="text-slate-600 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {/* Experience - Hidden if empty (Fresher Mode) */}
                {data.experience && data.experience.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <span className="w-6 h-px bg-slate-300" />
                            Experience
                        </h2>
                        <div className="space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{exp.role}</h3>
                                            <p className="text-slate-500">{exp.company}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-slate-600 font-medium">
                                                {exp.startDate} - {exp.endDate}
                                            </p>
                                            <p className="text-slate-400">{exp.location}</p>
                                        </div>
                                    </div>
                                    <ul className="mt-2 space-y-1 pl-4">
                                        {exp.bullets.map((bullet, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <span className="text-blue-500 mt-1">›</span>
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Interests */}
                {data.interests && data.interests.length > 0 && (
                    <section className="mt-8 pt-6 border-t border-slate-200">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                            <span className="w-6 h-px bg-slate-300" />
                            Interests
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.interests.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-slate-100 text-sm text-slate-600 rounded-full"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Custom Sections */}
                {data.customSections && data.customSections.length > 0 && (
                    data.customSections.map((section, index) => (
                        <section key={index} className="mt-6 pt-6 border-t border-slate-200">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                <span className="w-6 h-px bg-slate-300" />
                                {section.title}
                            </h2>
                            <p className="text-slate-600 leading-relaxed">{section.content}</p>
                        </section>
                    ))
                )}
            </main>
        </div>
    );
}
