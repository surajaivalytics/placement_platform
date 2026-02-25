'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Save, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import { importQuestionsFromContext } from '@/app/actions/import-questions';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label'; // Ensure this exists or use html label

export default function BulkImportPage() {
    const params = useParams();
    const router = useRouter();
    const driveId = params.id as string;
    const roundId = params.roundId as string;

    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setParsedQuestions([]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await importQuestionsFromContext(formData);

            if (result.error) {
                toast.error(result.error);
            } else if (result.questions) {
                setParsedQuestions(result.questions);
                toast.success(`Successfully analyzed ${result.questions.length} questions!`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze file.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSaveToDatabase = async () => {
        if (parsedQuestions.length === 0) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/mock-drives/${driveId}/rounds/${roundId}/questions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: parsedQuestions })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(data.message || `Imported ${parsedQuestions.length} questions!`);
                router.push(`/admin/mock-drives/${driveId}/rounds/${roundId}`);
            } else {
                throw new Error("Failed to save questions");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save questions to database.");
        } finally {
            setIsSaving(false);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                'Question Text': 'What is the capital of France?',
                'Type': 'mcq',
                'Option A': 'London',
                'Option B': 'Paris',
                'Option C': 'Berlin',
                'Option D': 'Madrid',
                'Correct Answer': 'Paris',
                'Difficulty': 'Easy',
                'Category': 'General Knowledge',
                'Points': 1
            },
            {
                'Question Text': 'Write a function to sum two numbers.',
                'Type': 'coding',
                'Input Format': 'Two integers a and b',
                'Output Format': 'One integer representing the sum',
                'Sample Input': '5 10',
                'Sample Output': '15',
                'Difficulty': 'Medium',
                'Category': 'Basic Programming',
                'Points': 5
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        // Use XLSX.write to create a buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'question_import_template.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/mock-drives/${driveId}/rounds/${roundId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Import Questions</h1>
                    <p className="text-muted-foreground">Upload questions from CSV, Excel, JSON or AI-powered Docs (PDF/Word)</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Step 1: Upload File</CardTitle>
                        <CardDescription>
                            Supported formats: .csv, .xlsx, .json, .pdf, .docx (AI analysis)
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-slate-400'}`}>
                        <Upload className={`h-10 w-10 mb-4 ${file ? 'text-green-600' : 'text-slate-400'}`} />
                        <div className="text-center space-y-2">
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md shadow text-sm font-medium transition-colors">
                                    {file ? "Change File" : "Select File"}
                                </span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls,.json,.pdf,.docx,.doc"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {file && <p className="text-sm font-medium text-slate-900 mt-2">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        className="w-full"
                        disabled={!file || isAnalyzing || parsedQuestions.length > 0}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {['pdf', 'docx', 'doc'].includes(file?.name.split('.').pop()?.toLowerCase() || '')
                                    ? "AI is analyzing your document..."
                                    : "Analyzing File..."}
                            </>
                        ) : parsedQuestions.length > 0 ? "File Analyzed" : "Analyze & Parse Questions"}
                    </Button>
                </CardContent>
            </Card>

            {parsedQuestions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Parsed Questions ({parsedQuestions.length})</h2>
                        <Button onClick={handleSaveToDatabase} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Confirm & Import All"}
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {parsedQuestions.map((q, i) => (
                            <Card key={i} className="bg-slate-50 border-slate-200">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-sm text-slate-900">
                                            {i + 1}. {q.text}
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${q.type === 'coding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {q.type}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    {q.type === 'coding' ? (
                                        <div className="space-y-1">
                                            <div className="text-xs text-slate-500 font-mono">
                                                METADATA: {q.metadata ? 'Present' : 'Missing'}
                                            </div>
                                            {q.metadata && (
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    {q.metadata}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-xs text-slate-500">
                                                {q.options?.length || 0} Options • Correct: <span className={q.options?.find((o: any) => o.isCorrect) ? "text-green-600 font-medium" : "text-red-600 font-bold"}>
                                                    {q.options?.find((o: any) => o.isCorrect)?.text || 'None (Header mismatch?)'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                {q.options?.map((opt: any, idx: number) => (
                                                    <div key={idx} className={`text-[10px] p-1 rounded border ${opt.isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-100 text-slate-400'}`}>
                                                        {idx + 1}. {opt.text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
