"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { importQuestionsFromContext } from '@/app/actions/import-questions';
import { toast } from 'sonner';

export default function BulkImportPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.id as string;

    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setParsedQuestions([]); // Reset if new file
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
            // We'll iterate and save individually or in batches to the existing API
            const response = await fetch(`/api/tests/${testId}/questions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: parsedQuestions })
            });

            if (response.ok) {
                toast.success(`Allocated ${parsedQuestions.length} questions to the test successfully!`);
                router.push(`/admin/tests/${testId}/questions`);
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

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/tests/${testId}/questions`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Import Questions</h1>
                    <p className="text-muted-foreground">Upload questions from CSV, Excel, JSON or PDF</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Upload File</CardTitle>
                    <CardDescription>
                        Supported formats: .csv, .xlsx, .json, .pdf (via AI)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}>
                        <Upload className={`h-10 w-10 mb-4 ${file ? 'text-green-600' : 'text-gray-400'}`} />
                        <div className="text-center space-y-2">
                            <Label htmlFor="file-upload" className="cursor-pointer">
                                <span className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md shadow text-sm font-medium">
                                    {file ? "Change File" : "Select File"}
                                </span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls,.json,.pdf"
                                    onChange={handleFileChange}
                                />
                            </Label>
                            {file && <p className="text-sm font-medium text-gray-900">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        className="w-full"
                        disabled={!file || isAnalyzing || parsedQuestions.length > 0}
                    >
                        {isAnalyzing ? "Analyzing File..." : parsedQuestions.length > 0 ? "File Analyzed" : "Analyze & Parse Questions"}
                    </Button>
                </CardContent>
            </Card>

            {parsedQuestions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Parsed Questions ({parsedQuestions.length})</h2>
                        <Button onClick={handleSaveToDatabase} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Confirm & Import All"}
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {parsedQuestions.map((q, i) => (
                            <Card key={i} className="bg-slate-50">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-sm text-gray-900">
                                            {i + 1}. {q.text}
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${q.type === 'coding' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {q.type}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    {q.type === 'coding' ? (
                                        <div className="text-xs text-gray-500 font-mono">
                                            METADATA: {q.metadata ? 'Present' : 'Missing'}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-gray-500">
                                            {q.options?.length || 0} Options • Correct: {q.options?.find((o: any) => o.isCorrect)?.text || 'None'}
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

function Label({ htmlFor, className, children }: any) {
    return <label htmlFor={htmlFor} className={className}>{children}</label>
}
