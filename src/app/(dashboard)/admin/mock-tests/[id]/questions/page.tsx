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
    marks?: number; // Added marks
    metadata?: string; // JSON string for extra data like test cases
    options: Option[];
}

// ... (keep existing types)

const [currentQ, setCurrentQ] = useState({
    text: '',
    type: 'multiple-choice',
    difficulty: 'Medium',
    category: 'Aptitude', // Default
    marks: 1, // Added marks default
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

const resetForm = () => {
    setIsEditing(false);
    setEditingQuestionId(null);
    setCurrentQ({
        text: '',
        type: 'multiple-choice',
        difficulty: 'Medium',
        category: 'Aptitude',
        marks: 1, // Reset marks
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
        category: currentQ.category,
        marks: currentQ.marks // Include marks
    };

    if (currentQ.type === 'multiple-choice') {
        // ... (keep logic)
        const hasCorrect = currentQ.options.some(o => o.isCorrect);
        if (!hasCorrect) {
            alert("Please mark at least one option as correct.");
            return;
        }
        payload.options = currentQ.options;
    } else if (currentQ.type === 'coding') {
        payload.metadata = currentQ.codingMetadata;
        payload.options = [];
    }

    try {
        // ... (keep fetch logic)
        const method = isEditing ? 'PUT' : 'POST';
        if (isEditing) {
            payload.id = editingQuestionId;
        }

        const res = await fetch('/api/questions', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // ...
        if (res.ok) {
            resetForm();
            fetchTest();
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

    const opts = q.options?.map(o => ({ text: o.text, isCorrect: o.isCorrect })) || [];
    while (opts.length < 4) {
        opts.push({ text: '', isCorrect: false });
    }

    setCurrentQ({
        text: q.text,
        type: q.type,
        difficulty: q.difficulty || 'Medium',
        category: q.category || 'Aptitude',
        marks: q.marks || (q.type === 'coding' ? 15 : 1), // Load marks
        options: opts,
        codingMetadata: q.type === 'coding' ? codingMeta : { ...currentQ.codingMetadata }
    });
};

// ... (render logic)

return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* ... Header & Modals (unchanged) */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className={`border-t-4 shadow-lg ${isEditing ? 'border-t-amber-500' : 'border-t-primary'}`}>
                    {/* ... (Header) */}
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {isEditing ? <Code className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-primary" />}
                                {isEditing ? 'Edit Question' : 'Add New Question'}
                            </div>
                            {isEditing && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs">Cancel Edit</Button>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* ... (Type & Category Selects) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Question Type</Label>
                                <Select
                                    value={currentQ.type}
                                    onValueChange={(v) => setCurrentQ({ ...currentQ, type: v, marks: v === 'coding' ? 15 : 1 })} // Auto-adjust defaults
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                                    {/* ... (Category Items) */}
                                    <SelectTrigger><SelectValue /></SelectTrigger>
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

                        {/* Added Marks Input */}
                        <div className="space-y-2">
                            <Label>Marks</Label>
                            <Input
                                type="number"
                                min="1"
                                value={currentQ.marks}
                                onChange={(e) => setCurrentQ({ ...currentQ, marks: parseInt(e.target.value) || 1 })}
                                className="max-w-[150px]"
                            />
                        </div>

                        {/* ... (Rest of Form) */}
                        <div className="space-y-2">
                            <Label>Question Text / Problem Statement</Label>
                            <Textarea
                                placeholder={currentQ.type === 'coding' ? "Describe the problem..." : "Enter the question..."}
                                className="min-h-[120px] font-medium"
                                value={currentQ.text}
                                onChange={(e) => setCurrentQ({ ...currentQ, text: e.target.value })}
                            />
                        </div>

                        {/* ... (Dynamic Form Fields - Options/Coding) */}
                        {currentQ.type === 'multiple-choice' && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-xl border">
                                {/* ... Options UI ... */}
                                <Label className="text-gray-500 uppercase text-xs tracking-wider font-bold">Options</Label>
                                {currentQ.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        {/* ... Option Inputs ... */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${opt.isCorrect ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <Input
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
                            // ... Coding UI ...
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
                                {/* ... Rest of Coding UI ... */}
                                <div className="space-y-2">
                                    <Label>Input Format</Label>
                                    <Textarea
                                        value={currentQ.codingMetadata.inputFormat}
                                        onChange={(e) => setCurrentQ({
                                            ...currentQ,
                                            codingMetadata: { ...currentQ.codingMetadata, inputFormat: e.target.value }
                                        })}
                                    />
                                </div>
                                {/* ... Test Cases ... */}
                                <div className="space-y-3">
                                    {/* ... */}
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
                                            {/* ... Test Case Inputs ... */}
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
                                            {/* ... */}
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

                        {/* ... Save Button ... */}
                        <Button className={`w-full ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : ''}`} size="lg" onClick={handleSaveQuestion}>
                            <Save className="w-4 h-4 mr-2" /> {isEditing ? 'Update Question' : 'Save Question'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

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
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="text-xs">{q.marks || 1} Marks</Badge>
                                        <Badge variant="secondary" className="text-xs">{q.type === 'coding' ? 'Coding' : 'MCQ'}</Badge>
                                    </div>
                                </div>
                                <CardDescription className="text-gray-900 font-medium line-clamp-3">
                                    {q.text}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 text-xs text-muted-foreground">
                                {q.category} • {q.difficulty || 'Medium'}
                            </CardContent>
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
