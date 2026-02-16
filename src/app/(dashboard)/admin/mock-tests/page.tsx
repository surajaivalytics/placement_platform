"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorPlay, Plus, Settings, Trash2, Upload, Calendar, Clock, BarChart3, ChevronRight, Layers, Layout, Users, Zap, TrendingUp, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { motion, AnimatePresence } from 'framer-motion';

interface MockTest {
    id: string;
    title: string;
    description: string;
    company: string;
    difficulty: string;
    duration: number;
    type: string;
    createdAt: string;
    _count: {
        questions: number;
    };
}

export default function MockTestsManagementPage() {
    const router = useRouter();
    const [tests, setTests] = useState<MockTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const [sortBy, setSortBy] = useState('Newest First');

    // Filter and sort tests
    const filteredTests = tests
        .filter(test =>
            test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.company?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'Newest First') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortBy === 'Oldest First') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            if (sortBy === 'Most Questions') {
                return (b._count?.questions || 0) - (a._count?.questions || 0);
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50">
                <Loader size="lg" text="Loading simulation environment..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 rounded-3xl p-4 md:p-6 space-y-6 md:space-y-8 font-sans pb-20">
            {/* Command Center Header */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black transition-all" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

                <div className="relative z-10 p-6 md:p-10 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 mb-3"
                            >
                                <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-widest font-bold">
                                    Enterprise Suite v2.0
                                </Badge>
                                <div className="flex items-center gap-1.5 text-xs text-indigo-300/80 font-mono">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    SYSTEM ONLINE
                                </div>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-white leading-tight"
                            >
                                Mock Drive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Command Center</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-300 text-sm md:text-lg max-w-2xl font-light leading-relaxed"
                            >
                                Orchestrate end-to-end recruitment simulations. Configure adaptive rounds, detailed eligibility criteria, and manage question banks from a single powerful interface.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full md:w-auto"
                        >
                            <Button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="w-full md:w-auto h-12 md:h-14 px-8 bg-white text-slate-900 hover:bg-indigo-50 font-bold text-base rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 group border-2 border-transparent hover:border-indigo-100"
                            >
                                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300 text-indigo-600" />
                                New Simulation
                            </Button>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-8">
                        {[
                            { label: "Active Drives", value: tests.length, icon: MonitorPlay, color: "text-blue-400", trend: "+12% this week" },
                            { label: "Question Bank", value: tests.reduce((acc, t) => acc + (t._count?.questions || 0), 0), icon: Layers, color: "text-purple-400", trend: " across " + tests.length + " tests" },
                            { label: "Avg Duration", value: (tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + t.duration, 0) / tests.length) : 0) + "m", icon: Clock, color: "text-amber-400", trend: "Optimal timing" },
                            { label: "Companies", value: new Set(tests.map(t => t.company)).size, icon: Users, color: "text-emerald-400", trend: "Unique patterns" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:bg-white/10 transition-colors group cursor-default"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                                    <div className={`p-1.5 rounded-lg bg-white/10 ${stat.color} group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                    {stat.trend}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Creation Form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white border rounded-3xl shadow-xl overflow-hidden ring-1 ring-slate-900/5 px-6 md:px-8 py-8 mb-8 relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                                    <MonitorPlay className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Configure New Simulation</h3>
                                    <p className="text-sm text-slate-500">Define the core parameters for your new mock drive.</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTest} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Simulation Title</Label>
                                        <Input
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="e.g. Wipro Velocity 2026 Phase 1"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Company</Label>
                                        <div className="relative">
                                            <Input
                                                className="h-11 pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                                placeholder="e.g. Wipro, Infosys, Accenture"
                                                value={formData.company}
                                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                required
                                            />
                                            <Layout className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description & Instructions</Label>
                                    <Textarea
                                        className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors min-h-[100px]"
                                        placeholder="Enter instructions for candidates..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label>Complexity</Label>
                                        <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                                            <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Entry Level (Easy)</SelectItem>
                                                <SelectItem value="Medium">Standard (Medium)</SelectItem>
                                                <SelectItem value="Hard">Advanced (Hard)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (Minutes)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                className="h-11 pl-10 bg-slate-50 border-slate-200"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                            />
                                            <Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-end gap-3">
                                        <Button type="button" variant="outline" className="h-11 flex-1 order-2 md:order-1" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                                        <Button type="submit" className="h-11 flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white order-1 md:order-2">Create Simulation</Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search simulations..."
                        className="pl-10 bg-white border-slate-200 shadow-sm rounded-2xl h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 text-sm text-slate-500 font-medium w-full md:w-auto justify-end">
                    <span>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-none p-0 text-slate-900 font-bold focus:ring-0 cursor-pointer"
                    >
                        <option value="Newest First">Newest First</option>
                        <option value="Oldest First">Oldest First</option>
                        <option value="Most Questions">Most Questions</option>
                    </select>
                </div>
            </div>

            {/* Tests Grid */}
            <motion.div layout className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredTests.map((test, index) => (
                        <motion.div
                            key={test.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group h-full flex flex-col border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:ring-2 hover:ring-indigo-500/20 bg-white overflow-hidden rounded-3xl">
                                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 rounded-md font-mono text-xs uppercase tracking-wide">
                                            {test.company}
                                        </Badge>
                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDeleteTest(test.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {test.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2 text-sm">
                                        {test.description || "Comprehensive assessment covering technical and aptitude rounds."}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Time</span>
                                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                {test.duration}m
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Questions</span>
                                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                                {test._count?.questions || 0}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0 p-6 grid grid-cols-2 gap-3">
                                    <Button
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg col-span-2 rounded-xl"
                                        onClick={() => router.push(`/admin/tests/${test.id}`)}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage & Structure
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {tests.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center"
                >
                    <div className="bg-indigo-50 p-6 rounded-full mb-6 relative group">
                        <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                        <Zap className="w-10 h-10 text-indigo-600 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">System Initialized</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">No active simulations detected. Launch your first recruitment drive to begin data collection.</p>
                    <Button size="lg" onClick={() => setShowCreateForm(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 rounded-full">
                        <Plus className="w-5 h-5 mr-2" />
                        Launch Simulation
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
