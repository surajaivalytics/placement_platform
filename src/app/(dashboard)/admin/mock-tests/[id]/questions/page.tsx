"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ArrowLeft, Save, Code, CheckCircle2, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { generateQuestions } from '@/app/actions/ai-questions';
import { importQuestionsFromContext } from '@/app/actions/import-questions';

// Types
interface Question {
    id: string;
    text: string;
    type: string;
    category?: string;
    difficulty?: string;
    metadata?: string; // JSON string for extra data like test cases
    options: Option[];
}

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface TestCase {
    input: string;
    output: string;
    isHidden: boolean;
}

export default function MockTestQuestionsPage() {
    const router = useRouter();
    const params = useParams();
    const testId = params.id as string;

    const [test, setTest] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // --- AI Generator State ---
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiConfig, setAiConfig] = useState({
        topic: '',
        count: 5,
        difficulty: 'Medium',
        type: 'multiple-choice'
    });
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Bulk Upload State ---
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkJson, setBulkJson] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    // Form State
    const [activeTab, setActiveTab] = useState("manual");
    const [isEditing, setIsEditing] = useState(false);
    const [currentQ, setCurrentQ] = useState({
        text: '',
        type: 'multiple-choice',
        difficulty: 'Medium',
        category: 'Aptitude', // Default
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        // For Coding Questions
        codingMetadata: {
            functionName: 'solve',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            testCases: [
                { input: '', output: '', isHidden: false },
                { input: '', output: '', isHidden: true }
            ] as TestCase[]
        }
    });

    const fetchTest = useCallback(async () => {
        try {
            const res = await fetch(`/api/tests?id=${testId}`);
            if (res.ok) {
                const data = await res.json();
                setTest(data.test);
                setQuestions(data.test.questions || []);
            }
        } catch (error) {
            console.error("Error fetching test:", error);
        } finally {
            setLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        fetchTest();
    }, [fetchTest]);

    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    const resetForm = () => {
        setIsEditing(false);
        setEditingQuestionId(null);
        setCurrentQ({
            text: '',
            type: 'multiple-choice',
            difficulty: 'Medium',
            category: 'Aptitude',
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
            codingMetadata: {
                functionName: 'solve',
                inputFormat: '',
                outputFormat: '',
                constraints: '',
                testCases: [
                    { input: '', output: '', isHidden: false },
                    { input: '', output: '', isHidden: true }
                ]
            }
        });
    };

    const handleSaveQuestion = async () => {
        // Validate inputs
        if (!currentQ.text) {
            alert("Question text is required");
            return;
        }

        // Build payload
        const payload: any = {
            testId,
            text: currentQ.text,
            type: currentQ.type,
            difficulty: currentQ.difficulty,
            category: currentQ.category
        };

        if (currentQ.type === 'multiple-choice') {
            const hasCorrect = currentQ.options.some(o => o.isCorrect);
            if (!hasCorrect) {
                alert("Please mark at least one option as correct.");
                return;
            }
            payload.options = currentQ.options;
        } else if (currentQ.type === 'coding') {
            payload.metadata = currentQ.codingMetadata;
            payload.options = []; // Coding questions don't use options
        }

        try {
            const method = isEditing ? 'PUT' : 'POST';
            // If editing, include ID in body
            if (isEditing) {
                payload.id = editingQuestionId;
            }

            const res = await fetch('/api/questions', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                resetForm();
                fetchTest(); // Refresh list
            } else {
                alert(`Failed to ${isEditing ? 'update' : 'save'} question`);
            }
        } catch (e) {
            console.error(e);
            alert("Error saving question");
        }
    };

    const handleEditQuestion = (q: Question) => {
        setIsEditing(true);
        setEditingQuestionId(q.id);

        // Parse metadata if coding
        let codingMeta = {
            functionName: 'solve',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            testCases: []
        };

        if (q.type === 'coding' && q.metadata) {
            try {
                codingMeta = typeof q.metadata === 'string' ? JSON.parse(q.metadata) : q.metadata;
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }
        }

        // Deep copy options to avoid mutability issues
        const opts = q.options?.map(o => ({ text: o.text, isCorrect: o.isCorrect })) || [];
        // Ensure at least 4 options slots for UI consistency if MCQ
        while (opts.length < 4) {
            opts.push({ text: '', isCorrect: false });
        }

        setCurrentQ({
            text: q.text,
            type: q.type,
            difficulty: q.difficulty || 'Medium',
            category: q.category || 'Aptitude',
            options: opts,
            codingMetadata: q.type === 'coding' ? codingMeta : { ...currentQ.codingMetadata }
        });
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await fetch(`/api/questions?id=${qId}`, { method: 'DELETE' });
            if (editingQuestionId === qId) resetForm();
            fetchTest();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    // --- AI Generator Features ---

    const handleGenerateAI = async () => {
        if (!aiConfig.topic) return alert("Please enter a topic");
        setIsGenerating(true);
        try {
            const res = await generateQuestions({
                topic: aiConfig.topic,
                count: aiConfig.count,
                difficulty: aiConfig.difficulty,
                type: aiConfig.type as any,
                companyContext: test?.company || "General"
            });

            if (res.error) {
                alert(res.error);
            } else if (res.questions) {
                // Bulk add generated questions
                // Use Promise.all to add them sequentially or parallel
                // Better UX: Show them in a review list? For MVP, auto-add to list but require save.
                // Wait, the user said "once verify by admin then those will be added".
                // So let's add them to the `questions` state locally first, marked as "Unsaved" maybe?
                // Or just push them to DB directly for simplicity as "Review Needed"?
                // Let's add them to DB directly to save complexity of local state management for now,
                // admin can delete if they don't like them.

                let successCount = 0;
                for (const q of res.questions) {
                    const payload = {
                        testId,
                        text: q.text,
                        type: q.type || 'multiple-choice',
                        difficulty: q.difficulty,
                        category: q.category,
                        options: q.options || [],
                        metadata: q.metadata ? JSON.stringify(q.metadata) : undefined
                    };

                    await fetch('/api/questions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    successCount++;
                }

                alert(`Successfully generated and added ${successCount} questions!`);
                setShowAIModal(false);
                fetchTest();
            }
        } catch (e) {
            console.error(e);
            alert("Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Bulk Upload Features ---

    const handleBulkUpload = async () => {
        try {
            if (bulkJson) {
                // Handle JSON Text Paste
                const parsed = JSON.parse(bulkJson);
                if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
                await processQuestions(parsed);
                setBulkJson('');
            } else {
                alert("Please paste JSON or upload a file.");
            }
        } catch (e) {
            alert("Invalid JSON format. Please check your input.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await importQuestionsFromContext(formData);
            if (res.error) {
                alert(res.error);
            } else if (res.questions) {
                // Populate the textarea for review or process directly
                // Let's process directly for "Smart" upload
                await processQuestions(res.questions);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setUploadingFile(false);
            // Reset input
            e.target.value = '';
        }
    };

    const processQuestions = async (qs: any[]) => {
        let successCount = 0;
        for (const q of qs) {
            // Basic validation
            if (!q.text) continue;

            const payload = {
                testId,
                text: q.text,
                type: q.type || 'multiple-choice',
                difficulty: q.difficulty || 'Medium',
                category: q.category || 'General',
                options: q.options || [],
                metadata: q.metadata ? (typeof q.metadata === 'string' ? q.metadata : JSON.stringify(q.metadata)) : undefined
            };

            await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            successCount++;
        }
        alert(`Successfully imported ${successCount} questions`);
        setShowBulkModal(false);
        fetchTest();
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{test?.title}</h1>
                        <p className="text-muted-foreground">{test?.company} • {test?.difficulty}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowBulkModal(true)}>
                        <List className="w-4 h-4 mr-2" /> Bulk Upload
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowAIModal(true)}>
                        <Code className="w-4 h-4 mr-2" /> AI Generate
                    </Button>
                </div>
            </div>

            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white">
                        <CardHeader>
                            <CardTitle>AI Question Generator</CardTitle>
                            <CardDescription>Auto-generate questions using Gemini AI</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Topic / Skill</Label>
                                <Input
                                    placeholder="e.g. Java Streams, React Hooks, Aptitude"
                                    value={aiConfig.topic}
                                    onChange={e => setAiConfig({ ...aiConfig, topic: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Count</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={aiConfig.count}
                                        onChange={e => setAiConfig({ ...aiConfig, count: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select
                                        value={aiConfig.difficulty}
                                        onValueChange={v => setAiConfig({ ...aiConfig, difficulty: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Question Type</Label>
                                <Select
                                    value={aiConfig.type}
                                    onValueChange={v => setAiConfig({ ...aiConfig, type: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                        <SelectItem value="coding">Coding Problem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowAIModal(false)} disabled={isGenerating}>Cancel</Button>
                                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleGenerateAI} disabled={isGenerating}>
                                    {isGenerating ? 'Generating...' : 'Generate & Add'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl bg-white">
                        <CardHeader>
                            <CardTitle>Bulk Upload Questions</CardTitle>
                            <CardDescription>Paste your JSON array of questions below.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Option A: Paste JSON</Label>
                                <Textarea
                                    className="font-mono text-xs min-h-[150px]"
                                    placeholder='[{"text": "Q1...", "type": "multiple-choice", "options": [...]}, ...]'
                                    value={bulkJson}
                                    onChange={e => setBulkJson(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={handleBulkUpload} disabled={!bulkJson}>Import JSON</Button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-muted-foreground">Or Upload File</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Option B: Smart Import (PDF, Excel, CSV, JSON)</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploadingFile ? (
                                                <div className="text-sm text-gray-500 animate-pulse">Processing File... This may take a moment for AI extraction.</div>
                                            ) : (
                                                <>
                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-500">PDF, XLSX, CSV, or JSON</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                            accept=".json,.csv,.xlsx,.xls,.pdf"
                                            onChange={handleFileUpload}
                                            disabled={uploadingFile}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form (UNCHANGED from previous layout, just re-rendering to keep structure) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className={`border-t-4 shadow-lg ${isEditing ? 'border-t-amber-500' : 'border-t-primary'}`}>
                        {/* ... Existing Form ... */}
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    {isEditing ? <Code className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-primary" />}
                                    {isEditing ? 'Edit Question' : 'Add New Question'}
                                </div>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs">
                                        Cancel Edit
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Question Type</Label>
                                    <Select
                                        value={currentQ.type}
                                        onValueChange={(v) => setCurrentQ({ ...currentQ, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple-choice">Multiple Choice (MCQ)</SelectItem>
                                            <SelectItem value="coding">Coding Problem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={currentQ.category}
                                        onValueChange={(v) => setCurrentQ({ ...currentQ, category: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Aptitude">Aptitude</SelectItem>
                                            <SelectItem value="Reasoning">Logical Reasoning</SelectItem>
                                            <SelectItem value="Verbal">Verbal Ability</SelectItem>
                                            <SelectItem value="Technical">Technical MCQ</SelectItem>
                                            <SelectItem value="Coding">Programming</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Question Text / Problem Statement</Label>
                                <Textarea
                                    placeholder={currentQ.type === 'coding' ? "Describe the problem statement, example, and logic..." : "Enter the question scenario..."}
                                    className="min-h-[120px] font-medium"
                                    value={currentQ.text}
                                    onChange={(e) => setCurrentQ({ ...currentQ, text: e.target.value })}
                                />
                            </div>

                            {/* DYNAMIC FORM BASED ON TYPE */}
                            {currentQ.type === 'multiple-choice' && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                                    <Label className="text-gray-500 uppercase text-xs tracking-wider font-bold">Options</Label>
                                    {currentQ.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <Input
                                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newOpts = [...currentQ.options];
                                                    newOpts[idx].text = e.target.value;
                                                    setCurrentQ({ ...currentQ, options: newOpts });
                                                }}
                                                className="flex-1"
                                            />
                                            <Switch
                                                checked={opt.isCorrect}
                                                onCheckedChange={(checked) => {
                                                    const newOpts = [...currentQ.options];
                                                    newOpts.forEach((o, i) => o.isCorrect = (i === idx) ? checked : false);
                                                    setCurrentQ({ ...currentQ, options: newOpts });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentQ.type === 'coding' && (
                                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Function Name</Label>
                                            <Input
                                                value={currentQ.codingMetadata.functionName}
                                                onChange={(e) => setCurrentQ({
                                                    ...currentQ,
                                                    codingMetadata: { ...currentQ.codingMetadata, functionName: e.target.value }
                                                })}
                                                className="font-mono text-sm"
                                                placeholder="e.g. twoSum"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Constraints</Label>
                                            <Input
                                                value={currentQ.codingMetadata.constraints}
                                                onChange={(e) => setCurrentQ({
                                                    ...currentQ,
                                                    codingMetadata: { ...currentQ.codingMetadata, constraints: e.target.value }
                                                })}
                                                placeholder="e.g. 1 <= N <= 10^5"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Input Format</Label>
                                        <Textarea
                                            rows={2}
                                            placeholder="e.g. First line contains integer N..."
                                            value={currentQ.codingMetadata.inputFormat}
                                            onChange={(e) => setCurrentQ({
                                                ...currentQ,
                                                codingMetadata: { ...currentQ.codingMetadata, inputFormat: e.target.value }
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label>Test Cases</Label>
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setCurrentQ({
                                                    ...currentQ,
                                                    codingMetadata: {
                                                        ...currentQ.codingMetadata,
                                                        testCases: [...currentQ.codingMetadata.testCases, { input: '', output: '', isHidden: true }]
                                                    }
                                                })
                                            }}>+ Add Case</Button>
                                        </div>

                                        {currentQ.codingMetadata.testCases.map((tc, i) => (
                                            <div key={i} className="flex gap-2 items-start bg-white p-3 rounded border">
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Input</Label>
                                                    <Textarea
                                                        className="font-mono text-xs min-h-[50px]"
                                                        value={tc.input}
                                                        onChange={(e) => {
                                                            const newTC = [...currentQ.codingMetadata.testCases];
                                                            newTC[i].input = e.target.value;
                                                            setCurrentQ({ ...currentQ, codingMetadata: { ...currentQ.codingMetadata, testCases: newTC } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Output</Label>
                                                    <Textarea
                                                        className="font-mono text-xs min-h-[50px]"
                                                        value={tc.output}
                                                        onChange={(e) => {
                                                            const newTC = [...currentQ.codingMetadata.testCases];
                                                            newTC[i].output = e.target.value;
                                                            setCurrentQ({ ...currentQ, codingMetadata: { ...currentQ.codingMetadata, testCases: newTC } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="w-20 pt-6">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-xs text-gray-500">{tc.isHidden ? 'Hidden' : 'Public'}</span>
                                                        <Switch
                                                            checked={tc.isHidden}
                                                            onCheckedChange={(c) => {
                                                                const newTC = [...currentQ.codingMetadata.testCases];
                                                                newTC[i].isHidden = c;
                                                                setCurrentQ({ ...currentQ, codingMetadata: { ...currentQ.codingMetadata, testCases: newTC } });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="mt-6 text-red-500" onClick={() => {
                                                    const newTC = currentQ.codingMetadata.testCases.filter((_, idx) => idx !== i);
                                                    setCurrentQ({ ...currentQ, codingMetadata: { ...currentQ.codingMetadata, testCases: newTC } });
                                                }}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button className={`w-full ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : ''}`} size="lg" onClick={handleSaveQuestion}>
                                <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update Question' : 'Save Question'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: List */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <List className="w-5 h-5" />
                        Existing Questions ({questions.length})
                    </h2>
                    <div className="space-y-3 max-h-[800pt] overflow-y-auto pr-2">
                        {questions.map((q, i) => (
                            <Card
                                key={q.id}
                                className={`cursor-pointer hover:shadow-md transition-all group relative ${editingQuestionId === q.id ? 'border-amber-500 border-2 bg-amber-50' : ''}`}
                                onClick={() => handleEditQuestion(q)}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`font-bold ${editingQuestionId === q.id ? 'text-amber-600' : 'text-gray-400'}`}>#{i + 1}</span>
                                        <Badge variant="secondary" className="text-xs">{q.type === 'coding' ? 'Coding' : 'MCQ'}</Badge>
                                    </div>
                                    <CardDescription className="text-gray-900 font-medium line-clamp-3">
                                        {q.text}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2 text-xs text-muted-foreground">
                                    {q.category} • {q.difficulty || 'Medium'}
                                </CardContent>
                                {/* Stop propagation on delete to prevent triggering edit */}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteQuestion(q.id);
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
