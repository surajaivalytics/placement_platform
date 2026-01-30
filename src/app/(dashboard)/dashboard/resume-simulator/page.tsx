"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, FileCheck, Target, Zap } from "lucide-react";
import Link from "next/link";

/* -------------------- 3D Tilt Card Component -------------------- */

const ResumeCard3D = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            {/* Floating Blob Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-80 h-80 bg-gradient-to-br from-emerald-400/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse" />
                <div className="absolute w-72 h-72 bg-gradient-to-tr from-violet-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-700 translate-x-10 translate-y-10" />
                <div className="absolute w-64 h-64 bg-gradient-to-bl from-pink-400/25 to-rose-400/25 rounded-full blur-3xl animate-pulse delay-1000 -translate-x-8 -translate-y-8" />
            </div>

            {/* 3D Tilt Resume Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative"
            >
                <div className="relative transform transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:rotate-1">
                    {/* Glassmorphism Resume Card */}
                    <div className="relative w-72 md:w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/50">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4">
                            <div className="flex items-center gap-3">
                                {/* Profile Avatar */}
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    JD
                                </div>
                                <div className="text-white">
                                    <h3 className="font-semibold text-lg">John Doe</h3>
                                    <p className="text-slate-300 text-sm">Software Engineer</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                            {/* Experience Section */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Experience</h4>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-2.5 bg-slate-200 rounded-full w-full" />
                                            <div className="h-2 bg-slate-100 rounded-full w-3/4 mt-1.5" />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-2.5 bg-slate-200 rounded-full w-5/6" />
                                            <div className="h-2 bg-slate-100 rounded-full w-2/3 mt-1.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {["React", "Node.js", "Python", "AWS"].map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* ATS Score */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-600">ATS Score</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600">85%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Feature Tags */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="absolute -left-4 top-1/4 transform -translate-x-full"
                    >
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/50 flex items-center gap-1.5 animate-bounce-slow">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-medium text-slate-700">Enhance with AI</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="absolute -right-4 top-1/3 transform translate-x-full"
                    >
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/50 flex items-center gap-1.5 animate-bounce-slow delay-300">
                            <Target className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-slate-700">ATS Optimized</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        className="absolute -right-2 bottom-8 transform translate-x-full"
                    >
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/50 flex items-center gap-1.5 animate-bounce-slow delay-500">
                            <Zap className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-medium text-slate-700">Instant Export</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

/* -------------------- Main Page Component -------------------- */

export default function ResumeSimulatorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center min-h-[80vh]">
                    {/* Left Column - Typography & Actions (40%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100"
                        >
                            <FileCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">AI-Powered Resume Builder</span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                            Create Your{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Job-Winning
                            </span>{" "}
                            Resume
                        </h1>

                        {/* Subtext */}
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Leverage our AI-powered tools and professional templates to build a standout resume
                            that gets you noticed by top recruiters. Start from scratch or optimize your existing document.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            {/* Primary Button - Create New Resume */}
                            <Link href="/dashboard/resume-simulator/templates">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Create new resume
                                </motion.button>
                            </Link>

                            {/* Secondary Button - Upload Resume */}
                            <Link href="/dashboard/resume-simulator/upload">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-800 font-semibold rounded-full border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload my resume
                                </motion.button>
                            </Link>
                        </div>

                        {/* Feature List */}
                        <div className="pt-6 space-y-3">
                            {[
                                { icon: Zap, text: "AI-powered content suggestions" },
                                { icon: Target, text: "ATS-friendly formatting" },
                                { icon: FileCheck, text: "Multiple professional templates" },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                        <feature.icon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-slate-600">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column - 3D Animated Resume (60%) */}
                    <div className="lg:col-span-3 relative h-[500px] md:h-[600px]">
                        <ResumeCard3D />
                    </div>
                </div>
            </div>

            {/* Custom Animation Styles */}
            <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
        </div>
    );
}
