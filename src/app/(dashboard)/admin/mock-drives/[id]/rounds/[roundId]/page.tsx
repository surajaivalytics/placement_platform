'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Download, Upload, FileText, Check, Pencil, Search, Loader2, ShieldCheck, CheckCircle2, MonitorPlay, Timer } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionForm } from '@/components/admin/question-form';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    type: 'mcq' | 'coding';
    codingMetadata?: any;
    points?: number;
    options: Array<{
        text: string;
        isCorrect: boolean;
    }>;
}

export default function RoundQuestionsPage() {
    const router = useRouter();
    const params = useParams();
    const driveId = params.id as string;
    const roundId = params.roundId as string;

    const [round, setRound] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state matching QuestionForm expectations
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'mcq' as 'mcq' | 'coding',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 1, // mapped to 'points' in backend
        codingMetadata: {
            inputFormat: '',
            outputFormat: '',
            testCases: [{ input: '', output: '' }]
        }
    });

    useEffect(() => {
        fetchRoundData();
    }, [roundId]);

    const fetchRoundData = async () => {
        try {
            const response = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}`);
            if (response.ok) {
                const data = await response.json();
                setRound(data.round);
                setQuestions(data.round.questions || []);
            } else {
                toast.error('Failed to load round data');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching round');
        } finally {
            setLoading(false);
        }
    };

    const handleEditQuestion = (question: Question) => {
        setShowAddForm(false);
        setEditingId(question.id);

        setNewQuestion({
            text: question.text,
            type: question.type,
            options: question.options && question.options.length > 0
                ? question.options.map(o => o.text)
                : ['', '', '', ''],
            correctOptionIndex: question.options
                ? question.options.findIndex(o => o.isCorrect) !== -1 ? question.options.findIndex(o => o.isCorrect) : 0
                : 0,
            marks: question.points || 1,
            codingMetadata: question.codingMetadata || {
                inputFormat: '',
                outputFormat: '',
                testCases: [{ input: '', output: '' }]
            }
        });
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload: any = {
                text: newQuestion.text,
                type: newQuestion.type,
                marks: newQuestion.marks,
            };

            if (newQuestion.type === 'mcq') {
                payload.options = newQuestion.options.map((text, index) => ({
                    text,
                    isCorrect: index === newQuestion.correctOptionIndex,
                }));
            } else {
                payload.options = [];
                payload.codingMetadata = newQuestion.codingMetadata; // Pass as object, handled in API
            }

            let response;
            if (editingId) {
                payload.id = editingId;
                response = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}/questions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (response.ok) {
                const data = await response.json();
                if (editingId) {
                    setQuestions(questions.map(q => q.id === editingId ? data.question : q));
                    toast.success('Question updated');
                } else {
                    setQuestions([...questions, data.question]);
                    toast.success('Question added');
                }

                // Reset
                setNewQuestion({
                    text: '',
                    type: 'mcq',
                    options: ['', '', '', ''],
                    correctOptionIndex: 0,
                    codingMetadata: {
                        inputFormat: '',
                        outputFormat: '',
                        testCases: [{ input: '', output: '' }]
                    },
                    marks: 1,
                });
                setEditingId(null);
                setShowAddForm(false);
            } else {
                toast.error('Failed to save question');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving question');
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Delete this question?')) return;

        try {
            const res = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}/questions?questionId=${questionId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setQuestions(questions.filter(q => q.id !== questionId));
                toast.success('Deleted');
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting');
        }
    };

    const handleSaveMetadata = async (metadata: any) => {
        try {
            const response = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metadata })
            });

            if (response.ok) {
                const data = await response.json();
                setRound(data.round);
                toast.success('Round settings updated');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Error saving settings');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!round) return <div className="p-8 text-center"><h2 className="text-xl font-semibold">Round not found</h2></div>;

    const isInterview = round.type === 'TECH_INTERVIEW' || round.type === 'HR_INTERVIEW';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/mock-drives/${driveId}`)} className="rounded-full hover:bg-slate-100">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
                                    {round.title} {isInterview ? 'Settings' : 'Questions'}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                    <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 border-slate-200">
                                        {round.type.replace('_', ' ')}
                                    </Badge>
                                    {!isInterview && (
                                        <>
                                            <span>•</span>
                                            <span>{questions.length} Questions</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!isInterview && (
                            <div className="flex gap-3">
                                <Button variant="ghost" size="sm" asChild className="text-xs font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 shadow-none transition-all">
                                    <Link href={`/admin/mock-drives/${driveId}/rounds/${roundId}/import`}>
                                        <Upload className="mr-2 h-3.5 w-3.5" /> Bulk Import
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className={`bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-semibold ${showAddForm ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                >
                                    <Plus className={`mr-2 h-4 w-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                                    {showAddForm ? 'Close Designer' : 'Add Question'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
                {isInterview ? (
                    <InterviewSettings round={round} onSave={handleSaveMetadata} />
                ) : (
                    <>
                        <AnimatePresence>
                            {showAddForm && !editingId && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    className="overflow-hidden"
                                >
                                    <QuestionForm
                                        formData={newQuestion}
                                        setFormData={setNewQuestion}
                                        onSubmit={handleSaveQuestion}
                                        onCancel={() => setShowAddForm(false)}
                                        isEditing={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    Questions <Badge className="bg-slate-900 text-white rounded-full px-2">{questions.length}</Badge>
                                </h2>
                            </div>

                            <motion.div layout className="grid gap-4">
                                <AnimatePresence>
                                    {questions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                                            <div className="p-4 bg-indigo-50 rounded-full mb-4">
                                                <FileText className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-700">No questions yet</h3>
                                            <p className="text-slate-500 mb-6 max-w-xs text-center">Add questions manually or use bulk upload to populate this round.</p>
                                            <Button onClick={() => setShowAddForm(true)} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">Create First Question</Button>
                                        </div>
                                    ) : (
                                        questions.map((question, index) => (
                                            <motion.div key={question.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
                                                <Card className="relative border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all bg-white overflow-hidden rounded-2xl">
                                                    <CardContent className="p-0 flex flex-col md:flex-row">
                                                        <div className="flex-1 p-6">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Badge variant="outline" className="text-slate-400 border-slate-200">#{index + 1}</Badge>
                                                                <Badge className={question.type === 'coding' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'} variant="outline">
                                                                    {question.type === 'coding' ? 'Coding' : 'MCQ'}
                                                                </Badge>
                                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-transparent">
                                                                    {question.points || 1} Points
                                                                </Badge>
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-snug">{question.text}</h3>
                                                            {question.type === 'coding' && question.codingMetadata && (
                                                                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono border border-slate-100">
                                                                    <div className="flex justify-between">
                                                                        <span>Input Format:</span>
                                                                        <span className="text-slate-800">{question.codingMetadata.inputFormat || 'Not specified'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between mt-1 pt-1 border-t border-slate-200/50">
                                                                        <span>Output Format:</span>
                                                                        <span className="text-slate-800">{question.codingMetadata.outputFormat || 'Not specified'}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {question.type === 'mcq' && (
                                                            <div className="md:w-1/3 bg-slate-50/50 border-l p-6 flex flex-col justify-center gap-2">
                                                                {question.options?.slice(0, 4).map((opt, i) => (
                                                                    <div key={i} className={`text-sm px-3 py-2.5 rounded-xl border flex items-center gap-2 transition-colors ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm shadow-emerald-100/50 font-medium' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${opt.isCorrect ? 'bg-emerald-200' : 'bg-slate-100'}`}>{String.fromCharCode(65 + i)}</span>
                                                                        <span className="truncate">{opt.text}</span>
                                                                        {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                        <Button variant="outline" size="icon" className="h-8 w-8 shadow-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50" onClick={() => handleEditQuestion(question)} title="Edit Question">
                                                            <Pencil className="w-4 h-4 text-slate-600" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 shadow-sm border border-slate-200 rounded-lg bg-white hover:border-red-200 hover:bg-red-50" onClick={() => handleDeleteQuestion(question.id)} title="Delete Question">
                                                            <Trash2 className="w-4 h-4 text-slate-400 group-hover/btn:text-red-500" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                                <AnimatePresence>
                                                    {editingId === question.id && (
                                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden mt-4">
                                                            <QuestionForm
                                                                formData={newQuestion}
                                                                setFormData={setNewQuestion}
                                                                onSubmit={handleSaveQuestion}
                                                                onCancel={() => { setEditingId(null); setShowAddForm(false); }}
                                                                isEditing={true}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function InterviewSettings({ round, onSave }: { round: any, onSave: (metadata: any) => void }) {
    const [metadata, setMetadata] = useState(round.metadata || {});
    const [saving, setSaving] = useState(false);

    const isTech = round.type === 'TECH_INTERVIEW';

    const handleSave = async () => {
        setSaving(true);
        await onSave(metadata);
        setSaving(false);
    };

    return (
        <Card className="rounded-3xl shadow-lg border-slate-100 overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b pb-6">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Interview Configuration
                </CardTitle>
                <CardDescription>
                    Configure specialized context for this AI-driven interview round.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                {isTech ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold text-slate-800">Interview Topics</Label>
                            <Badge className="bg-indigo-100 text-indigo-700 border-none font-medium">Technical</Badge>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            Specify the technical domains, languages, or frameworks the AI should focus on.
                            Example: <span className="font-mono text-indigo-600">React.js, Node.js, System Design, Data Structures</span>
                        </p>
                        <Textarea
                            placeholder="Enter topics separated by commas..."
                            value={metadata.topics || ''}
                            onChange={(e) => setMetadata({ ...metadata, topics: e.target.value })}
                            className="min-h-[150px] rounded-2xl border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold text-slate-800">Company Background</Label>
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-medium">HR / Behavioral</Badge>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
                            Provide context about the company culture, core values, or the specific role expectations
                            to make the behavioral questions more relevant.
                        </p>
                        <Textarea
                            placeholder="e.g. We are a fast-paced fintech startup looking for candidates who value innovation, security, and owner mindset..."
                            value={metadata.companyContext || ''}
                            onChange={(e) => setMetadata({ ...metadata, companyContext: e.target.value })}
                            className="min-h-[200px] rounded-2xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                        />
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl shadow-lg shadow-indigo-100 transition-all font-bold text-lg"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

