'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    Clock,
    GraduationCap,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Brain,
    MessageSquare,
    Zap,
    Target
} from 'lucide-react';
import { format } from 'date-fns';
import { INTERVIEW_CONFIG } from '@/lib/interview-constants';

interface InterviewDetails {
    id: string;
    interviewType: string;
    companyType: string;
    startedAt: string;
    endedAt: string | null;
    scores: {
        technicalKnowledge: number;
        communication: number;
        confidence: number;
        problemSolving: number;
        projectUnderstanding: number;
        overallHireability: number;
    };
    feedback: string;
    overallVerdict: string;
}

export default function InterviewDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [interview, setInterview] = useState<InterviewDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/interviews/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setInterview(data.interview);
                } else {
                    // Handle error (maybe 404)
                    console.error(await response.text());
                }
            } catch (error) {
                console.error('Error fetching interview details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchDetails();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Interview Not Found</h2>
                <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const duration = interview.endedAt
        ? Math.max(1, Math.ceil((new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000 / 60))
        : 0;

    const getVerdictStyle = (verdict: string) => {
        switch (verdict.toLowerCase()) {
            case 'hire':
                return { color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle2 };
            case 'maybe':
                return { color: 'text-yellow-700 bg-yellow-100 border-yellow-200', icon: AlertCircle };
            default:
                return { color: 'text-red-700 bg-red-100 border-red-200', icon: XCircle };
        }
    };

    const verdictStyle = getVerdictStyle(interview.overallVerdict);
    const VerdictIcon = verdictStyle.icon;

    const scoreItems = [
        { label: 'Technical Knowledge', value: interview.scores.technicalKnowledge, icon: Brain, color: 'text-blue-600 bg-blue-50' },
        { label: 'Communication', value: interview.scores.communication, icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
        { label: 'Problem Solving', value: interview.scores.problemSolving, icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Project Understanding', value: interview.scores.projectUnderstanding, icon: Target, color: 'text-emerald-600 bg-emerald-50' },
    ];

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-5xl">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <div className={`h-2 w-full ${interview.overallVerdict.toLowerCase() === 'hire' ? 'bg-green-500' :
                                interview.overallVerdict.toLowerCase() === 'maybe' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(interview.startedAt), 'PPP')}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(new Date(interview.startedAt), 'p')}</span>
                                    </div>
                                    <CardTitle className="text-3xl font-bold text-gray-900">{interview.companyType} Interview Report</CardTitle>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                            {interview.interviewType}
                                        </Badge>
                                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                                            {duration} mins
                                        </Badge>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${verdictStyle.color}`}>
                                    <VerdictIcon className="w-5 h-5" />
                                    <span className="font-bold text-lg uppercase tracking-wide">{interview.overallVerdict}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Feedback Assessment</h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-line">
                                    {interview.feedback}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Score Card */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="bg-gray-900 text-white py-6">
                            <div className="text-center">
                                <p className="text-blue-200 font-medium mb-1">Overall Score</p>
                                <div className="text-6xl font-bold flex items-center justify-center gap-1">
                                    {interview.scores.overallHireability}
                                    <span className="text-2xl text-gray-500 font-normal">/10</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {scoreItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${item.color}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-lg">{item.value || 0}/10</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-2">Detailed Transcript</h3>
                            <p className="text-blue-100 text-sm mb-4">Review the full conversation log.</p>
                            <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-0" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
