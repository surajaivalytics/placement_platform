"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorPlay, Plus, Settings, Trash2, Upload, Calendar, Clock, BarChart3, ChevronRight, Layers, Layout, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { motion } from 'framer-motion';

interface MockTest {
    id: string;
    title: string;
    description: string;
    company: string;
    difficulty: string;
    duration: number;
    type: string;
    _count: {
        questions: number;
    };
}

export default function MockTestsManagementPage() {
    const router = useRouter();
    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company: '',
        difficulty: 'Medium',
        duration: 90,
    });

    const fetchMockTests = useCallback(async () => {
        try {
            const res = await fetch('/api/tests?type=mock');
            const data = await res.json();
            setTests(data.tests || []);
        } catch (error) {
            console.error('Error fetching mock tests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMockTests();
    }, [fetchMockTests]);

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: 'mock',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setShowCreateForm(false);
                setFormData({
                    title: '',
                    description: '',
                    company: '',
                    difficulty: 'Medium',
                    duration: 90,
                });
                fetchMockTests();
                router.push(`/admin/tests/${data.test.id}`);
            }
        } catch (error) {
            console.error('Error creating test:', error);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (!confirm('Are you sure you want to delete this mock test? This will delete all associated data.')) return;

        try {
            const res = await fetch(`/api/tests/${testId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchMockTests();
            }
        } catch (error) {
            console.error('Error deleting test:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50">
                <Loader size="lg" text="Loading simulation environment..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-4 space-y-2 font-sans">
            {/* Premium Header */}
            <div className="bg-blue-90 rounded-3xl p-8 md:p-4 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <MonitorPlay size={200} />
                </div>
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-black text-white-100 hover:bg-white/30 backdrop-blur-md border-0 px-3 py-1">
                                Enterprise Suite
                            </Badge>
                            <Badge variant="outline" className="border-blue-400/30 text-blue-200">
                                v2.0
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl text-black font-extrabold tracking-tight mb-4 leading-tight">
                            Mock Drive Command Center<span className="text-transparent  bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200"></span>
                        </h1>
                        <p className="text-blue-900 font-medium text-lg max-w-2xl leading-relaxed font-light">
                            Orchestrate end-to-end recruitment simulations. Configure adaptive rounds, detailed eligibility criteria, and manage question banks from a single powerful interface.
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="h-14 px-8 bg-white text-blue-800 hover:bg-blue-50 font-bold text-lg rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        New Simulation
                    </Button>
                </div>

                {/* Quick Stats in Header */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 border-t border-white/10 pt-1">
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-blue-900 text-sm font-medium uppercase tracking-wider mb-1">Active Drives</p>
                        <p className="text-3xl text-blue-900 font-bold">{tests.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-blue-900 text-sm font-medium uppercase tracking-wider mb-1">Total Questions</p>
                        <p className="text-3xl text-blue-900 font-bold">{tests.reduce((acc, t) => acc + (t._count?.questions || 0), 0)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-blue-900 text-sm font-medium uppercase tracking-wider mb-1">Avg Duration</p>
                        {/* Calculate average duration */}
                        <p className="text-3xl text-blue-900 font-bold">{tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + t.duration, 0) / tests.length) : 0}m</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-blue-900 text-sm font-medium uppercase tracking-wider mb-1">Company Patterns</p>
                        {/* Unique companies */}
                        <p className="text-3xl text-blue-900 font-bold">{new Set(tests.map(t => t.company)).size}</p>
                    </div>
                </div>
            </div>

            {/* Create Form Card */}
            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-20 -mt-8 mx-4 md:mx-0"
                >
                    <Card className="border-0 shadow-2xl overflow-hidden bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl mt-10">
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-xl text-slate-900">Configure New Simulation</CardTitle>
                            </div>
                            <CardDescription className="text-base text-slate-500">
                                Set up the foundation for a new mock drive. You can add specific rounds and logic later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 px-8">
                            <form onSubmit={handleCreateTest} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-slate-700 font-semibold">Simulation Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Amazon SDE Hiring Drive 2026"
                                            className="h-12 border-slate-200 focus:ring-blue-500 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company" className="text-slate-700 font-semibold">Target Company</Label>
                                        <div className="relative">
                                            <Input
                                                id="company"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                placeholder="e.g., Amazon, Google, TCS"
                                                className="h-12 border-slate-200 focus:ring-blue-500 pl-11 rounded-xl"
                                            />
                                            <Layout className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-slate-700 font-semibold">Description & Instructions</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the test pattern, eligibility criteria, and instructions for candidates..."
                                        rows={3}
                                        className="resize-none border-slate-200 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty" className="text-slate-700 font-semibold">Difficulty Level</Label>
                                        <Select
                                            value={formData.difficulty}
                                            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                                        >
                                            <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" className="text-slate-700 font-semibold">Total Duration (Minutes)</Label>
                                        <div className="relative">
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                min="1"
                                                className="h-12 border-slate-200 focus:ring-blue-500 pl-11 rounded-xl"
                                                required
                                            />
                                            <Clock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-base font-semibold shadow-lg text-white rounded-xl">
                                        Create & Configure Rounds
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="px-8 h-12 rounded-xl text-slate-600 hover:bg-slate-50">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Grid of Tests */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((test) => (
                    <motion.div
                        key={test.id}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden flex flex-col h-full rounded-2xl ring-1 ring-slate-200/50">
                            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                            <CardHeader className="pb-3 pt-6 px-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 font-semibold px-3 py-1 rounded-md">
                                        {test.company || "Mock Drive"}
                                    </Badge>
                                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            onClick={() => handleDeleteTest(test.id)}
                                            title="Delete Drive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                                    {test.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-slate-500 text-sm leading-relaxed">
                                    {test.description || "No description provided for this assessment."}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="py-2 px-6 flex-grow">
                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="font-semibold">{test.duration} m</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <BarChart3 className="w-4 h-4 text-purple-500" />
                                        <span className="font-semibold">{test.difficulty}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 col-span-2 pt-2 border-t border-slate-200/50 mt-1">
                                        <Layers className="w-4 h-4 text-slate-400" />
                                        <span><strong className="text-slate-900">{test._count?.questions || 0}</strong> Questions</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-4 pb-6 px-6 gap-3">
                                <Button
                                    className="flex-1 bg-slate-900 hover:bg-blue-600 text-white shadow-md group-hover:shadow-lg transition-all h-11 rounded-xl font-medium"
                                    onClick={() => router.push(`/admin/tests/${test.id}`)}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Manage
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 h-11 w-11 p-0 rounded-xl"
                                    onClick={() => router.push(`/admin/tests/${test.id}/questions`)}
                                    title="Upload Questions"
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {tests.length === 0 && !showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm text-center max-w-2xl mx-auto"
                >
                    <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
                        <MonitorPlay className="w-12 h-12 text-blue-500 relative z-10" />
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">No Simulations Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-light text-lg">
                        Get started by creating your first recruitment simulation drive. You can configure multiple rounds later.
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 px-8 h-12 rounded-xl text-lg font-medium transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5 mr-2" />
                        Create First Drive
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
