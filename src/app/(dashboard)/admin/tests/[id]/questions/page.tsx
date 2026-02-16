'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, Download, Upload, Code, FileText, CheckCircle2, MoreVertical, Search, Check, Pencil } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionForm } from '@/components/admin/question-form';

interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'coding';
  metadata?: string; // JSON string for coding questions
  marks?: number;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface Test {
  id: string;
  title: string;
  type: string;
  company?: string;
  topic?: string;
}

export default function ManageTestQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for adding a new question
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'mcq' as 'mcq' | 'coding',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 1,
    codingMetadata: {
      inputFormat: '',
      outputFormat: '',
      testCases: [{ input: '', output: '' }]
    }
  });

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  const fetchTestData = async () => {
    try {
      const response = await fetch(`/api/tests?id=${testId}`);
      if (response.ok) {
        const data = await response.json();
        setTest(data.test);
        setQuestions(data.test.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    // Determine editing inline, so we don't open the top form.
    // Close top form if open
    setShowAddForm(false);
    setEditingId(question.id);
    let codingMetadata = {
      inputFormat: '',
      outputFormat: '',
      testCases: [{ input: '', output: '' }]
    };

    if (question.type === 'coding' && question.metadata) {
      try {
        codingMetadata = JSON.parse(question.metadata);
      } catch (e) {
        console.error("Error parsing metadata", e);
      }
    }

    setNewQuestion({
      text: question.text,
      type: question.type,
      options: question.options.length > 0 ? question.options.map(o => o.text) : ['', '', '', ''],
      correctOptionIndex: question.options.findIndex(o => o.isCorrect) !== -1 ? question.options.findIndex(o => o.isCorrect) : 0,
      marks: question.marks || 1,
      codingMetadata: codingMetadata
    });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
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
        payload.metadata = JSON.stringify(newQuestion.codingMetadata);
      }

      let response;
      if (editingId) {
        // Update existing question
        payload.id = editingId;
        response = await fetch(`/api/tests/${testId}/questions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new question
        response = await fetch(`/api/tests/${testId}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (editingId) {
          setQuestions(questions.map(q => q.id === editingId ? data.question : q));
        } else {
          setQuestions([...questions, data.question]);
        }

        // Reset form
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
        alert(editingId ? 'Failed to update question' : 'Failed to add question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    setDeletingId(questionId);
    try {
      const response = await fetch(`/api/tests/${testId}/questions?questionId=${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question');
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = ["Question Text", "Type (mcq/coding)", "Option A", "Option B", "Option C", "Option D", "Correct Option (A/B/C/D)", "Input Format (Coding)", "Output Format (Coding)", "Sample Input", "Sample Output"];
    const rows = [
      ["What is 2+2?", "mcq", "3", "4", "5", "6", "B", "", "", "", ""],
      ["Write a function to add two numbers", "coding", "", "", "", "", "", "Two integers a and b", "Sum of a and b", "2 3", "5"]
    ];

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "question_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCodingMetadata = (json?: string) => {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Test Not Found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => router.push('/admin/mock-tests')}>
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Button>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {test.title}
                </motion.h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <Badge variant="secondary" className="font-normal bg-slate-100 hover:bg-slate-200">
                    {test.type === 'company' ? `🏢 ${test.company}` : `📚 ${test.topic}`}
                  </Badge>
                  <span>•</span>
                  <span>{questions.length} Questions</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <Button variant="ghost" size="sm" onClick={downloadCsvTemplate} className="text-xs hover:bg-white hover:shadow-sm">
                  <Download className="mr-2 h-3.5 w-3.5" /> Template
                </Button>
                <Button variant="ghost" size="sm" asChild className="text-xs hover:bg-white hover:shadow-sm">
                  <Link href={`/admin/tests/${testId}/import`}>
                    <Upload className="mr-2 h-3.5 w-3.5" /> Bulk Import
                  </Link>
                </Button>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className={`bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all ${showAddForm ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                >
                  <Plus className={`mr-2 h-4 w-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                  {showAddForm ? 'Close Designer' : 'Add Question'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8 mt-4">

        {/* Designer / Add Form */}
        {/* Designer / Add Form (Only show if not editing, to avoid confusion?) Or allow both. For simplicity, hide top form if editing inline, or just keep it. */}
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
                onSubmit={handleAddQuestion}
                onCancel={() => setShowAddForm(false)}
                isEditing={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Questions
              <Badge className="bg-slate-900 text-white hover:bg-slate-800">{questions.length}</Badge>
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search questions..." className="pl-9 bg-white border-slate-200" />
            </div>
          </div>

          <motion.div layout className="grid gap-4">
            <AnimatePresence>
              {questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200"
                >
                  <div className="p-4 bg-indigo-50 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">No questions yet</h3>
                  <p className="text-slate-500 max-w-sm text-center mt-1 mb-6">Start by adding questions manually or perform a bulk upload to populate this test.</p>
                  <Button onClick={() => setShowAddForm(true)} variant="outline">Create First Question</Button>
                </motion.div>
              ) : (
                questions.map((question, index) => {
                  const isCoding = question.type === 'coding';
                  const metadata = isCoding ? parseCodingMetadata(question.metadata) : null;

                  return (
                    <motion.div
                      key={question.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group"
                    >
                      <Card className="relative border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 bg-white/50 hover:bg-white overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-gradient-to-b group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors" />
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            {/* Question Meta & Content */}
                            <div className="flex-1 p-6 pl-8">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="font-mono text-xs text-slate-500 border-slate-200">#{index + 1}</Badge>
                                <Badge className={isCoding ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200'} variant="outline">
                                  {question.type === 'coding' ? 'Coding Challenge' : 'Multiple Choice'}
                                </Badge>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                  {question.marks || 1} Points
                                </Badge>
                              </div>
                              <h3 className="text-lg font-medium text-slate-800 mb-2 leading-relaxed">
                                {question.text}
                              </h3>

                              {/* Coding Metadata Preview */}
                              {isCoding && metadata && (
                                <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800">
                                  <div className="flex gap-4 text-xs font-mono text-slate-400">
                                    <div><span className="text-slate-500 uppercase">Input:</span> {metadata.inputFormat}</div>
                                    <div><span className="text-slate-500 uppercase">Output:</span> {metadata.outputFormat}</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Options Column (MCQ) or Action Column */}
                            <div className="w-full md:w-1/3 bg-slate-50/50 border-l border-slate-100 p-6 flex flex-col justify-center gap-2">
                              {isCoding ? (
                                <div className="text-center">
                                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Test Cases</div>
                                  <div className="text-sm font-mono bg-white border p-2 rounded shadow-sm inline-block">
                                    {metadata?.testCases?.length || 0} Case(s)
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {question.options?.map((option, i) => (
                                    <div key={i} className={`text-sm px-3 py-2 rounded-lg border flex items-center gap-2 ${option.isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-100 text-slate-500'}`}>
                                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${option.isCorrect ? 'bg-green-200 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {String.fromCharCode(65 + i)}
                                      </span>
                                      <span className="truncate">{option.text}</span>
                                      {option.isCorrect && <Check className="w-3 h-3 ml-auto" />}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm" onClick={() => handleEditQuestion(question)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>

                      {/* Inline Edit Form */}
                      <AnimatePresence>
                        {editingId === question.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <QuestionForm
                              formData={newQuestion}
                              setFormData={setNewQuestion}
                              onSubmit={handleAddQuestion}
                              onCancel={() => {
                                setEditingId(null);
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
                              }}
                              isEditing={true}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
