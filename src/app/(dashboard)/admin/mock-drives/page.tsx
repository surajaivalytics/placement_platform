'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Briefcase, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMockDrivesPage() {
    const [stats, setStats] = useState({ activeDrives: 0, totalQuestions: 0, avgDuration: 0, uniqueCompanies: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        description: ''
    });

    const fetchDrives = () => {
        setLoading(true);
        fetch('/api/mock-drives')
            .then(res => res.json())
            .then(data => {
                setDrives(data.drives || []);
                setStats(data.stats || { activeDrives: 0, totalQuestions: 0, avgDuration: 0, uniqueCompanies: 0 });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDrives();
    }, []);

    const filteredDrives = drives.filter(d =>
        d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch('/api/mock-drives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('Mock Drive created successfully');
                setOpen(false);
                setFormData({ title: '', companyName: '', description: '' });
                fetchDrives();
            } else {
                toast.error('Failed to create drive');
            }
        } catch (e) {
            toast.error('Error creating drive');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-[#1e1e2d] to-[#12121a] text-white p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-bold tracking-widest bg-white/10 px-2 py-1 rounded backdrop-blur-sm border border-white/10 uppercase">
                                    Enterprise Suite V2.0
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">System Online</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                                Mock Drive <span className="text-indigo-400">Command Center</span>
                            </h1>
                            <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                                Orchestrate end-to-end recruitment simulations. Configure adaptive rounds, detailed eligibility criteria, and manage question banks from a single powerful interface.
                            </p>
                        </div>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-6 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-lg">
                                    <Plus className="w-5 h-5 mr-2 stroke-[3px]" /> New Simulation
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Initialize New Drive</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Target Company</Label>
                                        <Input
                                            placeholder="e.g. Google, Atlassian"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className="h-12 border-slate-200 focus:ring-indigo-500 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Simulation Title</Label>
                                        <Input
                                            placeholder="e.g. SDE-1 Hiring Challenge"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-12 border-slate-200 focus:ring-indigo-500 rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Strategic Overview</Label>
                                        <Textarea
                                            placeholder="Define the objectives of this simulation..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[100px] border-slate-200 focus:ring-indigo-500 rounded-lg"
                                        />
                                    </div>
                                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md" onClick={handleCreate} disabled={creating || !formData.title || !formData.companyName}>
                                        {creating ? <Loader2 className="animate-spin mr-2" /> : null} Deploy Drive
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                        {[
                            { label: 'ACTIVE DRIVES', value: stats.activeDrives, icon: Briefcase, color: 'text-indigo-400', sub: '+12% this week' },
                            { label: 'QUESTION BANK', value: stats.totalQuestions, icon: Plus, color: 'text-purple-400', sub: `across ${stats.activeDrives} tests` },
                            { label: 'AVG DURATION', value: `${stats.avgDuration}m`, icon: Settings, color: 'text-yellow-400', sub: 'Optimal timing' },
                            { label: 'COMPANIES', value: stats.uniqueCompanies, icon: Briefcase, color: 'text-green-400', sub: 'Unique patterns' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 transition-all hover:bg-white/10 group">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">{stat.label}</p>
                                    <stat.icon className={`w-5 h-5 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                                </div>
                                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                    <span className="text-green-400">↗</span> {stat.sub}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-10">
                    <div className="relative w-full max-w-md group">
                        <Input
                            placeholder="Search simulations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 pl-12 pr-4 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:shadow-md"
                        />
                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 stroke-[3px]" />
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                        <span>Sort by:</span>
                        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <span className="text-slate-900">Newest First</span>
                            <Plus className="w-4 h-4 rotate-45" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
                        <p className="text-slate-500 font-medium animate-pulse">Initializing Command Center...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDrives.map((drive) => (
                            <div key={drive.id} className="group bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-[10px] font-extrabold tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg uppercase">
                                            {drive.companyName}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                        {drive.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                                        {drive.description || `Comprehensive assessment covering technical and aptitude rounds for ${drive.companyName}.`}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Time</p>
                                            <div className="flex items-center justify-center gap-2 text-slate-700">
                                                <Settings className="w-4 h-4 text-amber-500" />
                                                <span className="font-bold">{drive.totalDuration || 0}m</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Questions</p>
                                            <div className="flex items-center justify-center gap-2 text-slate-700">
                                                <Plus className="w-4 h-4 text-indigo-500" />
                                                <span className="font-bold">{drive.totalQuestions || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/admin/mock-drives/${drive.id}`}>
                                        <Button className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-indigo-100">
                                            <Settings className="w-5 h-5" /> Manage & Structure
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredDrives.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No simulations found</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            We couldn't find any mock drives matching your criteria. Create a new one to get started.
                        </p>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-xl" onClick={() => setOpen(true)}>
                            Initialize First Drive
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
