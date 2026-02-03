"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ListFilter, Circle, Trophy, Code2, ChevronRight } from "lucide-react";

interface ProblemsListProps {
    problems: any[];
}

export default function ProblemsList({ problems }: ProblemsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const categories = ["All", "Arrays", "Strings", "DP", "Graphs", "Math"];

    // Filter logic
    const filteredProblems = useMemo(() => {
        return problems.filter((problem) => {
            // 1. Search Filter
            const matchesSearch =
                problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                problem.id.toString().includes(searchQuery);

            // 2. Category Filter
            let matchesCategory = true;
            if (activeTab !== "All") {
                // Check 'type' field first, then fallback to title search or basic heuristics
                // Adjust this based on your actual data structure in usage
                const type = problem.type || "";
                matchesCategory =
                    type.toLowerCase() === activeTab.toLowerCase() ||
                    problem.title.toLowerCase().includes(activeTab.toLowerCase());
            }

            return matchesSearch && matchesCategory;
        });
    }, [problems, searchQuery, activeTab]);

    return (
        <>
            {/* HEADER SECTION - Now includes interactive Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <Code2 className="w-8 h-8 text-emerald-500" />
                        Practice Arena
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                        Master your coding skills with handpicked challenges.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-full md:w-64 shadow-sm"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
                        <ListFilter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>
            </div>

            {/* QUICK STATS CHIPS (Visual Appeal) - Interactive */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap shadow-sm ${activeTab === cat
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-500"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* PROBLEMS TABLE */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800">
                            <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-20 text-center">
                                Status
                            </th>
                            <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500">
                                Problem Title
                            </th>
                            <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-32">
                                Difficulty
                            </th>
                            <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredProblems.map((problem) => (
                            <tr
                                key={problem.id}
                                className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all relative"
                            >
                                <td className="p-5 text-center">
                                    <Circle
                                        className="text-zinc-300 dark:text-zinc-700 mx-auto group-hover:text-emerald-400 transition-colors"
                                        size={20}
                                        strokeWidth={1.5}
                                    />
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col">
                                        <Link
                                            href={`/dashboard/programming/${problem.id}`}
                                            className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2 after:absolute after:inset-0"
                                        >
                                            <span className="text-zinc-400 font-mono text-xs w-6">
                                                {problem.id}.
                                            </span>
                                            {problem.title}
                                        </Link>
                                        <div className="flex gap-2 mt-1.5">
                                            {problem.type && (
                                                <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded uppercase tracking-tighter">
                                                    {problem.type}
                                                </span>
                                            )}

                                            <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded uppercase tracking-tighter">
                                                JS / C++
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span
                                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${problem.difficulty === "Easy"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                : problem.difficulty === "Medium"
                                                    ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                                    : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                            }`}
                                    >
                                        {problem.difficulty}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProblems.length === 0 && (
                    <div className="p-20 text-center">
                        <Trophy className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                            No problems found {searchQuery ? `matches "${searchQuery}"` : "in this category"}.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
