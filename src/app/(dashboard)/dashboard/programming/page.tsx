import Link from "next/link";
import React from "react";
import { Search, ListFilter, CheckCircle2, Circle, Trophy, Code2, ChevronRight, Hash } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ProgrammingPage() {
  const CodingProblems = await prisma.problem.findMany({
    orderBy: {
      id: 'asc'
    }
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] p-6 md:p-12 transition-colors">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
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
                className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-full md:w-64 shadow-sm"
              />
            </div>
            <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
              <ListFilter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>

        {/* QUICK STATS CHIPS (Visual Appeal) */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Arrays", "Strings", "DP", "Graphs", "Math"].map((cat) => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all whitespace-nowrap shadow-sm">
              {cat}
            </button>
          ))}
        </div>

        {/* PROBLEMS TABLE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-20 text-center">Status</th>
                <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500">Problem Title</th>
                <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-32">Difficulty</th>
                <th className="p-5 font-semibold text-xs uppercase tracking-widest text-zinc-500 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {CodingProblems.map((problem) => (
                <tr key={problem.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all relative">
                  <td className="p-5 text-center">
                    <Circle className="text-zinc-300 dark:text-zinc-700 mx-auto group-hover:text-emerald-400 transition-colors" size={20} strokeWidth={1.5} />
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <Link 
                        href={`/dashboard/programming/${problem.id}`} 
                        className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-2 after:absolute after:inset-0"
                      >
                        <span className="text-zinc-400 font-mono text-xs w-6">{problem.id}.</span>
                        {problem.title}
                      </Link>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded uppercase tracking-tighter">Algorithm</span>
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded uppercase tracking-tighter">JS / C++</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm border ${
                      problem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : 
                      problem.difficulty === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" : 
                      "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                    }`}>
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
          
          {CodingProblems.length === 0 && (
            <div className="p-20 text-center">
              <Trophy className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No problems found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}