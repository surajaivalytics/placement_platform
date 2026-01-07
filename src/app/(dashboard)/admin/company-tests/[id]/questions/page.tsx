'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
}

interface Test {
  id: string;
  title: string;
  company: string;
}

export default function CompanyTestQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchTestAndQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/tests/${id}/questions`);
      const data = await res.json();
      setTest(data.test);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching test:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTestAndQuestions();
  }, [fetchTestAndQuestions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadResult({ success: false, message: 'Please select a CSV file' });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', id);

    try {
      const res = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadResult({ success: true, message: data.message });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchTestAndQuestions();
      } else {
        setUploadResult({ success: false, message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadResult({ success: false, message: 'An error occurred during upload' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTestAndQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const exampleFormat = `question,option_1,option_2,option_3,option_4,correct_option,explanation,difficulty,category
"What is 2+2?",3,4,5,6,B,"2+2=4",Easy,numerical
"Capital of France?",London,Berlin,Madrid,Paris,D,"Paris is the capital",Easy,General`;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {test?.company} - Questions
          </h1>
          <p className="text-muted-foreground">{test?.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Questions
          </CardTitle>
          <CardDescription>
            Upload multiple questions at once using CSV format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {uploadResult && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                uploadResult.success 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}>
                <div>
                  <h5 className="font-medium mb-1">{uploadResult.success ? "Success" : "Error"}</h5>
                  <p className="text-sm">{uploadResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={!file}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Questions
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/company-tests/${id}/questions/new`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Single Question
              </Button>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View CSV format example
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto">
{exampleFormat}
              </pre>
            </details>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No questions added yet. Use bulk upload or add questions individually.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        Q{index + 1}. {question.text}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={option.id}
                          className={`p-2 rounded border ${
                            option.isCorrect
                              ? 'bg-green-50 dark:bg-green-950 border-green-500'
                              : 'bg-muted'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          {option.text}
                          {option.isCorrect && (
                            <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
