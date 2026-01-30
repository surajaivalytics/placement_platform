"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Eye, Maximize, MousePointerClick, CheckCircle2, AlertTriangle, MonitorPlay, Lock, ArrowRight, Info } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function MockTestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await fetch('/api/tests?type=mock');
                const data = await res.json();
                setTests(data.tests || []);
            } catch (error) {
                console.error("Failed to fetch mock tests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    // Helper to get styling based on company name (fallback for dynamic tests)
    // NOTE: Official logos are strictly prohibited for legal compliance. Use colors only.
    const getCompanyStyle = (companyName: string) => {
        const name = companyName?.toLowerCase() || '';
        if (name.includes('tcs')) return { color: 'bg-blue-600', borderColor: '#1d4ed8', textColor: 'text-blue-600' };
        if (name.includes('wipro')) return { color: 'bg-purple-600', borderColor: '#9333ea', textColor: 'text-purple-600' };
        if (name.includes('ibm')) return { color: 'bg-indigo-800', borderColor: '#3730a3', textColor: 'text-indigo-800' };
        return { color: 'bg-gray-800', borderColor: '#1f2937', textColor: 'text-gray-800' };
    };

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 min-h-screen bg-gray-50/50 pb-20">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Company Specific Mock Tests</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Premium proctored assessments simulating real-world recruitment drives.</p>
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-red-100 self-start md:self-auto">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    AI Surveillance Active
                </div>
            </motion.div>

            {/* Warning / Guidelines Banner */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Alert className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 shadow-lg">
                    <ShieldAlert className="h-5 w-5 text-red-400 !text-red-400" />
                    <AlertTitle className="ml-2 font-bold text-red-400">Strict Proctored Environment</AlertTitle>
                    <AlertDescription className="ml-2 text-gray-300 text-xs md:text-sm">
                        These tests are monitored by AI Anti-Cheating System.
                        <span className="font-bold text-white mx-1">Tab switching, minimizing window, or multiple faces</span>
                        will lead to immediate disqualification. Please ensure you are in a well-lit room.
                    </AlertDescription>
                </Alert>
            </motion.div>

            {/* Tests Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-64 animate-pulse bg-gray-100" />
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {tests.map((test) => {
                        const style = getCompanyStyle(test.company);
                        return (
                            <motion.div key={test.id} variants={itemVariants}>
                                <Card className="h-full flex flex-col border-t-4 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                                    style={{ borderTopColor: style.borderColor }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="h-12 w-24 relative flex items-center">
                                                <span className={`font-bold text-lg ${style.textColor}`}>{test.company || "MOCK TEST"}</span>
                                            </div>
                                            <Badge variant="default" className="bg-green-600">
                                                Live
                                            </Badge>
                                        </div>
                                        <CardTitle className="mt-4 text-xl">{test.title}</CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[2.5rem]">{test.description || "No description provided."}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase">Difficulty</span>
                                                <span className="font-medium text-gray-900">{test.difficulty}</span>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                <span className="text-gray-500 block text-xs uppercase">Duration</span>
                                                <span className="font-medium text-gray-900">{test.duration} Mins</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Eye className="w-4 h-4 text-gray-400" /> {test._count?.questions || 0} Questions
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MousePointerClick className="w-4 h-4 text-gray-400" /> Proctored Mode
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="mt-auto">
                                        <Link href={`/exam/${test.id}/dashboard`} className="w-full">
                                            <Button className={`w-full font-bold shadow-lg ${style.color} hover:opacity-90`}>
                                                View Drive Details <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                    {tests.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No active mock tests available at the moment.
                        </div>
                    )}
                </motion.div>
            )}

            {/* Rules Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-12 mb-12"
            >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" /> Malpractice Code
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Leaving the test window at any time is recorded as a violation.
                        </li>
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Using external devices (mobile phones, tablets) is strictly prohibited.
                        </li>
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Background noise or speaking during the test will flag the session using Voice AI.
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" /> System Requirements
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Internet Speed: Minimum 2 Mbps stable connection.
                        </li>
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Webcam: Functional webcam for continuous proctoring.
                        </li>
                        <li className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Browser: Latest version of Chrome or Edge (No private/incognito).
                        </li>
                    </ul>
                </div>

            </motion.div>

            {/* LEGAL DISCLAIMER */}
            <div className="border-t border-gray-200 pt-8 mt-12 text-center max-w-4xl mx-auto px-4">
                <p className="text-[10px] md:text-xs text-gray-400 mb-2 font-semibold tracking-wider uppercase">Disclaimer</p>
                <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed">
                    This platform is an independent educational tool designed for practice purposes only. All company names (e.g., TCS, Wipro, Infosys) are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them. Test patterns are based on publicly available information to simulate the exam environment.
                </p>
            </div>
        </div>
    );
}
