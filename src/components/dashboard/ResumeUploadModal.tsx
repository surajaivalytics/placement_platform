"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import { parseResumeWithGemini } from "@/actions/parse-resume";

interface ResumeUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    templateId: string | null;
}

export default function ResumeUploadModal({ isOpen, onClose, templateId }: ResumeUploadModalProps) {
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "analyzing" | "complete" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Scanning document...");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closed
            setStatus("idle");
            setProgress(0);
            setStatusText("Scanning document...");
            setErrorMessage("");
        }
    }, [isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        // Prevent default drag behaviors
        e.preventDefault();

        let file;
        if ('files' in e.target) {
            file = (e.target as HTMLInputElement).files?.[0];
        } else if ('dataTransfer' in e) {
            file = (e as React.DragEvent).dataTransfer.files?.[0];
        }

        if (file) {
            await startParsing(file);
        }
    };

    const startParsing = async (file: File) => {
        setStatus("analyzing");
        setErrorMessage("");

        // Start fake progress animation to keep user engaged
        const steps = [
            { pct: 20, text: "Uploading document..." },
            { pct: 40, text: "Extracting text..." },
            { pct: 60, text: "Analyzing with Gemini AI..." },
            { pct: 80, text: "Structuring data..." },
        ];

        let currentStep = 0;
        const progressInterval = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                setProgress(steps[currentStep].pct);
                setStatusText(steps[currentStep].text);
            }
        }, 800);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append("file", file);

            // Call Server Action
            const result = await parseResumeWithGemini(formData);

            clearInterval(progressInterval);

            if (result.success && result.data) {
                finishUpload(result.data);
            } else {
                throw new Error(result.error || "Parsing failed");
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error(error);
            setStatus("error");
            setErrorMessage("Failed to process resume. Please try again.");
        }
    };

    const finishUpload = (parsedData: any) => {
        setStatus("complete");
        setProgress(100);
        setStatusText("Done!");

        // Save Parsed Data
        localStorage.setItem('parsedResumeData', JSON.stringify(parsedData));

        // Wait a moment then redirect
        setTimeout(() => {
            if (templateId) {
                router.push(`/dashboard/resume-simulator/builder/${templateId}`);
            }
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-800">Upload Resume</h3>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {status === "idle" && (
                                <div
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer group"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileUpload}
                                >
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        accept=".pdf,.docx,.doc"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer block">
                                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Click to Upload</h4>
                                        <p className="text-sm text-slate-500">or drag and drop here (PDF)</p>
                                    </label>
                                </div>
                            )}

                            {status === "analyzing" && (
                                <div className="text-center py-4">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="40"
                                                className="stroke-slate-100"
                                                strokeWidth="8"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r="40"
                                                className="stroke-teal-500"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={251.2}
                                                strokeDashoffset={251.2 - (251.2 * progress) / 100}
                                                style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Spinner size={32} className="text-teal-600" />
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Analyzing Resume</h4>
                                    <p className="text-sm text-slate-500 animate-pulse">{statusText}</p>
                                </div>
                            )}

                            {status === "complete" && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">Analysis Complete!</h4>
                                    <p className="text-sm text-slate-500">Redirecting to builder...</p>
                                </div>
                            )}

                            {status === "error" && (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                                        <AlertCircle className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">Upload Failed</h4>
                                    <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="text-sm font-medium text-slate-600 hover:text-slate-900 underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
