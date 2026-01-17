"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Eye, Maximize, MousePointerClick, CheckCircle2, AlertTriangle, MonitorPlay, Lock } from "lucide-react";
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
    const [selectedTest, setSelectedTest] = useState<string | null>(null);

    const companies = [
        {
            id: "tcs",
            name: "TCS NQT 2026",
            logo: "/logos/tcs-1696999494.jpg",
            portalUrl: "/tcs-portal",
            color: "bg-blue-600",
            textColor: "text-blue-600",
            description: "National Qualifier Test for freshers. Focuses on NQT Cognitive, Attitudinal, and Psychometric tests.",
            eligibility: "B.E/B.Tech (2025/2026 Batch)",
            duration: "90 Mins",
            type: "Adaptive",
            status: "Live"
        },
        {
            id: "wipro",
            name: "Wipro NLTH 2026",
            logo: "/logos/Wipro_Secondary-Logo_Color_RGB.png",
            portalUrl: "/wipro-portal",
            color: "bg-purple-600",
            textColor: "text-purple-600",
            description: "National Level Talent Hunt. Includes Aptitude, Coding, and Written Communication Test.",
            eligibility: "B.E/B.Tech/M.Tech",
            duration: "120 Mins",
            type: "Standard",
            status: "Live"
        },
        {
            id: "ibm",
            name: "IBM CodeKnack",
            logo: "/logos/IBM.png",
            portalUrl: "#",
            color: "bg-gray-800",
            textColor: "text-gray-800",
            description: "Coding assessment focusing on Data Structures and Algorithms with cognitive ability games.",
            eligibility: "All Streams",
            duration: "60 Mins",
            type: "Gamified",
            status: "Upcoming"
        }
    ];

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/50">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Specific Mock Tests</h1>
                    <p className="text-gray-500 mt-1">Premium proctored assessments simulating real-world recruitment drives.</p>
                </div>
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium border border-red-100">
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
                    <AlertDescription className="ml-2 text-gray-300">
                        These tests are monitored by AI Anti-Cheating System.
                        <span className="font-bold text-white mx-1">Tab switching, minimizing window, or multiple faces</span>
                        will lead to immediate disqualification. Please ensure you are in a well-lit room.
                    </AlertDescription>
                </Alert>
            </motion.div>

            {/* Tests Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {companies.map((company) => (
                    <motion.div key={company.id} variants={itemVariants}>
                        <Card className="h-full flex flex-col border-t-4 hover:shadow-2xl transition-all duration-300 group overflow-hidden" style={{ borderTopColor: company.id === 'tcs' ? '#1d4ed8' : company.id === 'wipro' ? '#9333ea' : '#1f2937' }}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="w-24 h-12 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <Image
                                            src={company.logo}
                                            alt={company.name}
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                    <Badge variant={company.status === 'Live' ? 'default' : 'secondary'} className={company.status === 'Live' ? 'bg-green-600' : ''}>
                                        {company.status}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 text-xl">{company.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">{company.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="text-gray-500 block text-xs uppercase">Eligibility</span>
                                        <span className="font-medium text-gray-900">{company.eligibility}</span>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                        <span className="text-gray-500 block text-xs uppercase">Duration</span>
                                        <span className="font-medium text-gray-900">{company.duration}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Eye className="w-4 h-4 text-gray-400" /> Full Screen Mode Required
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MousePointerClick className="w-4 h-4 text-gray-400" /> No Right Click Allowed
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto">
                                {company.status === 'Live' ? (
                                    <Link href={company.portalUrl} className="w-full">
                                        <Button className={`w-full font-bold shadow-lg ${company.color} hover:opacity-90`}>
                                            Enter Exam Hall <MonitorPlay className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button variant="outline" className="w-full" disabled>
                                        <Lock className="mr-2 w-4 h-4" /> Coming Soon
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Rules Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12"
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

        </div>
    );
}
