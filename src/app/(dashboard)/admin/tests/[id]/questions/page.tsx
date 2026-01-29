'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, Download, Upload, Code, FileText, CheckCircle2, MoreVertical, Search, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

      const response = await fetch(`/api/tests/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions([...questions, data.question]);
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
        setShowAddForm(false);
      } else {
        alert('Failed to add question');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error adding question');
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
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <Card className="border-indigo-100 shadow-xl shadow-indigo-50/50 bg-white/80 backdrop-blur-sm ring-1 ring-indigo-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Plus className="w-4 h-4" />
                    </div>
                    Question Designer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddQuestion} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Type Selection */}
                      <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Question Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${newQuestion.type === 'mcq' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                            <input type="radio" className="peer sr-only" name="type" checked={newQuestion.type === 'mcq'} onChange={() => setNewQuestion({ ...newQuestion, type: 'mcq', marks: 1 })} />
                            <FileText className="w-6 h-6" />
                            <span className="font-medium text-sm">Multiple Choice</span>
                            {newQuestion.type === 'mcq' && <div className="absolute top-2 right-2 text-indigo-500"><CheckCircle2 className="w-4 h-4" /></div>}
                          </label>
                          <label className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${newQuestion.type === 'coding' ? 'border-purple-500 bg-purple-50/50 text-purple-700' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                            <input type="radio" className="peer sr-only" name="type" checked={newQuestion.type === 'coding'} onChange={() => setNewQuestion({ ...newQuestion, type: 'coding', marks: 15 })} />
                            <Code className="w-6 h-6" />
                            <span className="font-medium text-sm">Coding Problem</span>
                            {newQuestion.type === 'coding' && <div className="absolute top-2 right-2 text-purple-500"><CheckCircle2 className="w-4 h-4" /></div>}
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
                            value={newQuestion.marks}
                            onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                            className="pl-9 font-semibold text-lg"
                          />
                          <div className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">#</div>
                        </div>
                        <p className="text-xs text-muted-foreground">Default marks: {newQuestion.type === 'coding' ? '15' : '1'}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Problem Statement</Label>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shadow-sm resize-y"
                        placeholder="Type your question or problem description here..."
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                        required
                      />
                    </div>

                    {newQuestion.type === 'mcq' ? (
                      <div className="space-y-4 bg-slate-50/80 p-5 rounded-xl border border-dashed border-slate-200">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">Answer Options</Label>
                        <div className="grid gap-3">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex gap-3 items-center group">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${newQuestion.correctOptionIndex === index ? 'bg-green-500 text-white border-green-600 ring-2 ring-green-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setNewQuestion({ ...newQuestion, options: newOptions });
                                }}
                                required
                                className="flex-1 bg-white"
                              />
                              <div
                                onClick={() => setNewQuestion({ ...newQuestion, correctOptionIndex: index })}
                                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${newQuestion.correctOptionIndex === index ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                              >
                                {newQuestion.correctOptionIndex === index ? 'Correct Answer' : 'Mark Correct'}
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
                              value={newQuestion.codingMetadata.inputFormat}
                              onChange={(e) => setNewQuestion({
                                ...newQuestion,
                                codingMetadata: { ...newQuestion.codingMetadata, inputFormat: e.target.value }
                              })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block text-slate-600">Output Format</Label>
                            <Input
                              className="bg-white"
                              placeholder="e.g. The sum of N and M"
                              value={newQuestion.codingMetadata.outputFormat}
                              onChange={(e) => setNewQuestion({
                                ...newQuestion,
                                codingMetadata: { ...newQuestion.codingMetadata, outputFormat: e.target.value }
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
                                value={newQuestion.codingMetadata.testCases[0].input}
                                onChange={(e) => {
                                  const newTC = [...newQuestion.codingMetadata.testCases];
                                  newTC[0].input = e.target.value;
                                  setNewQuestion({ ...newQuestion, codingMetadata: { ...newQuestion.codingMetadata, testCases: newTC } });
                                }}
                              />
                            </div>
                            <div className="relative">
                              <div className="absolute top-2 left-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">Output</div>
                              <textarea
                                className="w-full p-2 pt-6 border rounded-lg bg-slate-900 text-slate-50 min-h-[80px]"
                                value={newQuestion.codingMetadata.testCases[0].output}
                                onChange={(e) => {
                                  const newTC = [...newQuestion.codingMetadata.testCases];
                                  newTC[0].output = e.target.value;
                                  setNewQuestion({ ...newQuestion, codingMetadata: { ...newQuestion.codingMetadata, testCases: newTC } });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button type="submit" size="lg" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200">Save Question</Button>
                      <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
                      <Card className="border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 bg-white/50 hover:bg-white overflow-hidden">
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
                          <Button variant="outline" size="icon" className="h-8 w-8 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
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
