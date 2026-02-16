'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, CheckCircle2, Code } from 'lucide-react';

interface QuestionFormProps {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export function QuestionForm({ formData, setFormData, onSubmit, onCancel, isEditing }: QuestionFormProps) {
    return (
        <Card className="border-indigo-100 shadow-xl shadow-indigo-50/50 bg-white/80 backdrop-blur-sm ring-1 ring-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Plus className="w-4 h-4" />
                    </div>
                    {isEditing ? 'Edit Question' : 'Question Designer'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question Type</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'mcq' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" className="peer sr-only" name="type" checked={formData.type === 'mcq'} onChange={() => setFormData({ ...formData, type: 'mcq', marks: 1 })} />
                                    <FileText className="w-6 h-6" />
                                    <span className="font-medium text-sm">Multiple Choice</span>
                                    {formData.type === 'mcq' && <div className="absolute top-2 right-2 text-indigo-500"><CheckCircle2 className="w-4 h-4" /></div>}
                                </label>
                                <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'coding' ? 'border-purple-500 bg-purple-50/50 text-purple-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" className="peer sr-only" name="type" checked={formData.type === 'coding'} onChange={() => setFormData({ ...formData, type: 'coding', marks: 15 })} />
                                    <Code className="w-6 h-6" />
                                    <span className="font-medium text-sm">Coding Problem</span>
                                    {formData.type === 'coding' && <div className="absolute top-2 right-2 text-purple-500"><CheckCircle2 className="w-4 h-4" /></div>}
                                </label>
                            </div>
                        </div>

                        {/* Marks Input */}
                        <div className="space-y-3">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Points & Scoring</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.marks}
                                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                                    className="pl-9 font-semibold text-lg"
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">#</div>
                            </div>
                            <p className="text-xs text-muted-foreground">Default marks: {formData.type === 'coding' ? '15' : '1'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Problem Statement</Label>
                        <textarea
                            className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm resize-y"
                            placeholder="Type your question or problem description here..."
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            required
                        />
                    </div>

                    {formData.type === 'mcq' ? (
                        <div className="space-y-4 bg-slate-50/80 p-5 rounded-xl border border-dashed border-slate-200">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Answer Options</Label>
                            <div className="grid gap-3">
                                {formData.options.map((option: string, index: number) => (
                                    <div key={index} className="flex gap-3 items-center group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${formData.correctOptionIndex === index ? 'bg-green-500 text-white border-green-600 ring-2 ring-green-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <Input
                                            placeholder={`Option ${index + 1}`}
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...formData.options];
                                                newOptions[index] = e.target.value;
                                                setFormData({ ...formData, options: newOptions });
                                            }}
                                            required
                                            className="flex-1 bg-white"
                                        />
                                        <div
                                            onClick={() => setFormData({ ...formData, correctOptionIndex: index })}
                                            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${formData.correctOptionIndex === index ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                        >
                                            {formData.correctOptionIndex === index ? 'Correct Answer' : 'Mark Correct'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 bg-slate-50/80 p-5 rounded-xl border border-dashed border-slate-200">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Coding Configuration</Label>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <Label className="text-xs mb-1.5 block text-slate-600">Input Format</Label>
                                    <Input
                                        className="bg-white"
                                        placeholder="e.g. Two integers N and M"
                                        value={formData.codingMetadata.inputFormat}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            codingMetadata: { ...formData.codingMetadata, inputFormat: e.target.value }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs mb-1.5 block text-slate-600">Output Format</Label>
                                    <Input
                                        className="bg-white"
                                        placeholder="e.g. The sum of N and M"
                                        value={formData.codingMetadata.outputFormat}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            codingMetadata: { ...formData.codingMetadata, outputFormat: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs mb-1.5 block text-slate-600">Sample Test Case</Label>
                                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                                    <div className="relative">
                                        <div className="absolute top-2 left-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Input</div>
                                        <textarea
                                            className="w-full p-2 pt-6 border rounded-lg bg-slate-900 text-slate-50 min-h-[80px]"
                                            value={formData.codingMetadata.testCases[0].input}
                                            onChange={(e) => {
                                                const newTC = [...formData.codingMetadata.testCases];
                                                newTC[0].input = e.target.value;
                                                setFormData({ ...formData, codingMetadata: { ...formData.codingMetadata, testCases: newTC } });
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute top-2 left-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Output</div>
                                        <textarea
                                            className="w-full p-2 pt-6 border rounded-lg bg-slate-900 text-slate-50 min-h-[80px]"
                                            value={formData.codingMetadata.testCases[0].output}
                                            onChange={(e) => {
                                                const newTC = [...formData.codingMetadata.testCases];
                                                newTC[0].output = e.target.value;
                                                setFormData({ ...formData, codingMetadata: { ...formData.codingMetadata, testCases: newTC } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" size="lg" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200">
                            {isEditing ? 'Update Question' : 'Save Question'}
                        </Button>
                        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onCancel}>Cancel</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
