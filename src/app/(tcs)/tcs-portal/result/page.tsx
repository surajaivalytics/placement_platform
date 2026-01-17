"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Download, Home, UserCheck, RefreshCcw } from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { tcsQuestions } from '@/lib/tcs-questions';

export default function ResultPage() {
    const router = useRouter();
    const [qualified, setQualified] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [codingVerdict, setCodingVerdict] = useState<string>("Fail");
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get data from local storage
        const storedAnswers = localStorage.getItem('tcsAptitudeAnswers');
        const storedVerdict = localStorage.getItem('tcsCodingVerdict');

        const userAnswers: Record<number, string> = storedAnswers ? JSON.parse(storedAnswers) : {};
        const finalVerdict = storedVerdict || "Fail";
        setCodingVerdict(finalVerdict);

        // 2. Calculate category scores
        const categoryStats: Record<string, { total: number; correct: number }> = {
            'Quants': { total: 0, correct: 0 },
            'Verbal': { total: 0, correct: 0 },
            'Reasoning': { total: 0, correct: 0 },
            'Programming': { total: 0, correct: 0 },
        };

        tcsQuestions.forEach((q) => {
            const cat = q.category;
            if (categoryStats[cat]) {
                categoryStats[cat].total++;
                if (userAnswers[q.id] === q.correctAnswer) {
                    categoryStats[cat].correct++;
                }
            }
        });

        // 3. Convert to percentages
        const calculatedScores: Record<string, number> = {};
        let totalPercentage = 0;
        let categoriesCount = 0;

        Object.keys(categoryStats).forEach(key => {
            const { total, correct } = categoryStats[key];
            const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
            calculatedScores[key] = pct;

            // Only count aptitude categories for average, exclude programming logic if mixed
            if (key !== 'Programming') {
                totalPercentage += pct;
                categoriesCount++;
            }
        });

        // Add Programming Logic to score map
        // Note: 'Programming' category in MCQ is different from Coding Round

        setScores(calculatedScores);

        // 4. Determine Qualification
        // Criteria: avg > 60% AND Coding Round = Pass
        const avgScore = categoriesCount > 0 ? totalPercentage / categoriesCount : 0;
        const isQualified = avgScore >= 40 && finalVerdict === "Pass"; // Lowered cutoff for testing

        setQualified(isQualified);
        setLoading(false);

        // Cleanup
        localStorage.removeItem('tcsTestStartTime');
    }, []);

    const handleDownload = () => {
        setGeneratingPdf(true);
        setTimeout(() => {
            setGeneratingPdf(false);
            toast.success("Assessment Report Downloaded Successfully");
        }, 1500);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Calculating Results...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {qualified && <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 bg-gradient-to-b from-green-200 to-transparent"></div></div>}

            {/* Main Card */}
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl p-8 md:p-12 text-center relative z-10 border border-gray-100">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${qualified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {qualified ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {qualified ? "Assessment Cleared!" : "Assessment Not Cleared"}
                </h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {qualified
                        ? "Congratulations! You have met the cutoff criteria for the Technical Interview Round."
                        : "Unfortunately, you did not meet the required cutoff. Keep practicing and try again!"}
                </p>

                {/* Score Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider">Quants</span>
                        <span className={`block text-xl font-bold ${scores['Quants'] >= 60 ? 'text-green-600' : 'text-gray-800'}`}>{scores['Quants']}%</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider">Verbal</span>
                        <span className={`block text-xl font-bold ${scores['Verbal'] >= 60 ? 'text-green-600' : 'text-gray-800'}`}>{scores['Verbal']}%</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider">Reasoning</span>
                        <span className={`block text-xl font-bold ${scores['Reasoning'] >= 60 ? 'text-green-600' : 'text-gray-800'}`}>{scores['Reasoning']}%</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider">Coding</span>
                        <span className={`block text-xl font-bold ${codingVerdict === 'Pass' ? 'text-green-600' : 'text-red-500'}`}>{codingVerdict}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/tcs-portal">
                        <Button variant="outline" className="w-full md:w-auto h-12 border-gray-300">
                            <Home className="w-4 h-4 mr-2" /> Back to Portal
                        </Button>
                    </Link>

                    {qualified ? (
                        <>
                            <Button
                                variant="outline"
                                className="w-full md:w-auto h-12 border-gray-300"
                                onClick={handleDownload}
                                disabled={generatingPdf}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {generatingPdf ? "Generating..." : "Download Report"}
                            </Button>

                            <Link href="/tcs-portal/interview">
                                <Button className="w-full md:w-auto h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-white shadow-lg shadow-blue-900/20">
                                    Proceed to Interview <UserCheck className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/tcs-portal">
                            <Button className="w-full md:w-auto h-12 bg-[#181C2E] hover:bg-[#2C3E50] text-white">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Retry Assessment
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
