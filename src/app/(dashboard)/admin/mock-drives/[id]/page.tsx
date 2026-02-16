'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Save, ArrowLeft, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminDriveConfigPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [drive, setDrive] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRoundDialogOpen, setIsRoundDialogOpen] = useState(false);
    const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
    const [roundForm, setRoundForm] = useState({
        title: '',
        type: 'MCQ',
        description: '',
        durationMinutes: 60,
        metadata: {} as any
    });
    const [savingRound, setSavingRound] = useState(false);

    const fetchDrive = () => {
        fetch(`/api/admin/mock-drives/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setDrive(data.drive);
                setLoading(false);
            })
            .catch(err => {
                toast.error('Failed to load drive details');
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDrive();
    }, [id]);

    const handleSaveRound = async () => {
        if (!roundForm.title) return toast.error('Title is required');

        setSavingRound(true);
        try {
            const url = editingRoundId
                ? `/api/admin/mock-drives/${id}/rounds/${editingRoundId}`
                : `/api/admin/mock-drives/${id}/rounds`;

            const method = editingRoundId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roundForm)
            });

            if (res.ok) {
                toast.success(editingRoundId ? 'Round updated' : 'Round added');
                setIsRoundDialogOpen(false);
                setRoundForm({ title: '', type: 'MCQ', description: '', durationMinutes: 60, metadata: {} });
                setEditingRoundId(null);
                fetchDrive();
            } else {
                toast.error('Failed to save round');
            }
        } catch (e) {
            toast.error('Error saving round');
        } finally {
            setSavingRound(false);
        }
    };

    const openEditRound = (round: any) => {
        setEditingRoundId(round.id);
        setRoundForm({
            title: round.title,
            type: round.type,
            description: round.description || '',
            durationMinutes: round.durationMinutes,
            metadata: round.metadata || {}
        });
        setIsRoundDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this drive?')) return;
        try {
            const res = await fetch(`/api/admin/mock-drives/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Drive deleted');
                router.push('/admin/mock-drives');
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!drive) return <div className="p-8">Drive not found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/mock-drives">
                    <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{drive.companyName}: {drive.title}</h1>
                    <p className="text-slate-500 text-sm">Configure rounds and questions for this drive.</p>
                </div>
                <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete Drive</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content - Rounds List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-800">Rounds</h2>
                        <Dialog open={isRoundDialogOpen} onOpenChange={(open) => {
                            setIsRoundDialogOpen(open);
                            if (!open) {
                                setEditingRoundId(null);
                                setRoundForm({ title: '', type: 'MCQ', description: '', durationMinutes: 60, metadata: {} });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingRoundId(null)}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Round
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingRoundId ? 'Edit Round' : 'Add New Round'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Round Title</Label>
                                        <Input
                                            placeholder="e.g. Aptitude Test"
                                            value={roundForm.title}
                                            onChange={(e) => setRoundForm({ ...roundForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Round Type</Label>
                                        <Select
                                            value={roundForm.type}
                                            onValueChange={(val) => setRoundForm({ ...roundForm, type: val })}
                                            disabled={!!editingRoundId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MCQ">MCQ Assessment</SelectItem>
                                                <SelectItem value="CODING">Coding Challenge</SelectItem>
                                                <SelectItem value="TECH_INTERVIEW">AI Technical Interview</SelectItem>
                                                <SelectItem value="HR_INTERVIEW">AI HR Interview</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Duration (Minutes)</Label>
                                            <Input
                                                type="number"
                                                value={roundForm.durationMinutes}
                                                onChange={(e) => setRoundForm({ ...roundForm, durationMinutes: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Instructions for the candidate..."
                                            value={roundForm.description}
                                            onChange={(e) => setRoundForm({ ...roundForm, description: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={handleSaveRound} disabled={savingRound}>
                                        {savingRound ? <Loader2 className="animate-spin mr-2" /> : null} {editingRoundId ? 'Update Round' : 'Save Round'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {drive.rounds.map((round: any) => (
                            <Card key={round.id} className="border-slate-200">
                                <CardHeader className="bg-slate-50 border-b py-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold">Round {round.roundNumber}: {round.title}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border uppercase">{round.type}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => openEditRound(round)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-sm text-slate-500 mb-4">{round.description || 'No description'}</p>
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span>{round.questions.length} Questions</span>
                                        <span>{round.durationMinutes} Minutes</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                                        <Link href={`/admin/mock-drives/${id}/rounds/${round.id}`}>
                                            Manage Questions
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {drive.rounds.length === 0 && (
                            <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500">
                                No rounds added yet. Add a round to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Quick Actions or Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Drive Details</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div><strong>Status:</strong> <span className="text-green-600">Active</span></div>
                            <div><strong>Created:</strong> {new Date(drive.createdAt).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
