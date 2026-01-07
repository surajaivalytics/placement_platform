'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Upload, Download, Edit, Trash2, Loader2,
  FileText, Code, MessageSquare, Search, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacementQuestion {
  id: string;
  text: string;
  type: string;
  category: string | null;
  difficulty: string | null;
  test: {
    id: string;
    title: string;
    company: string | null;
  };
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface CompanyTest {
  id: string;
  title: string;
  company: string | null;
  topic: string | null;
}

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [tests, setTests] = useState<CompanyTest[]>([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    created?: number;
    errors?: string[];
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/placement-tests')
      .then(res => res.json())
      .then(data => {
        if (data.tests) {
          setTests(data.tests);
        }
      })
      .catch(err => console.error('Failed to fetch placement tests:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedTest) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', selectedTest);

    try {
      const res = await fetch('/api/admin/placement-questions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          created: data.created,
          errors: data.errors,
        });
        setFile(null);
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setResult({
          success: false,
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during upload',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question,option_1,option_2,option_3,option_4,correct_option,explanation,difficulty,category,type
"What is 2+2?","2","3","4","5","C","2+2 equals 4.","Easy","numerical","multiple-choice"
"Find the sum of two numbers","","","","","","","Medium","programming","coding"
"Describe your career goals","","","","","","","Easy","verbal","essay"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'placement_questions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="max-w-4xl w-full"
      >
        <Card className="max-h-[85vh] overflow-y-auto border-gray-200/50 dark:border-gray-800/50 shadow-2xl bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="sticky top-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-10 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Bulk Upload Questions</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-5 rounded-xl">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <FileText className="w-5 h-5" />
                CSV Format Instructions
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <p className="font-medium text-blue-900 dark:text-blue-200">Required columns:</p>
                  <ul className="space-y-2">
                    {['text', 'type', 'category', 'difficulty'].map((col) => (
                      <li key={col} className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <code>{col}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-blue-900 dark:text-blue-200">Question Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {['multiple-choice', 'coding', 'essay'].map((type) => (
                      <Badge key={type} variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-600 dark:text-blue-500 italic">
                  * For MCQ, include option1-4 and correctOption (1-4). For Coding, sampleInput/Output are recommended.
                </p>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Placement Test</label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  >
                    <option value="">Choose a test...</option>
                    {tests.map(test => {
                      const displayName = test.topic
                        ? `${test.company} - ${test.topic}`
                        : test.title;
                      const questionCount = (test as any)._count?.questions || 0;
                      return (
                        <option key={test.id} value={test.id}>
                          {displayName} ({questionCount} questions)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">CSV File</label>
                  <div className="relative">
                    <input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="csv-file"
                      className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <span className="text-sm text-gray-500 truncate mr-2">
                        {file ? file.name : 'Choose a CSV file...'}
                      </span>
                      <Upload className="w-4 h-4 text-gray-400" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Result Messages */}
              {result && (
                <div className={`p-4 rounded-xl border ${result.success
                  ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30'
                  }`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                        }`}>
                        {result.success ? 'Success' : 'Upload Failed'}
                      </h4>
                      <p className={`text-sm ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        }`}>
                        {result.message}
                      </p>
                      {result.created !== undefined && result.created > 0 && (
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1 font-medium">
                          Created {result.created} new questions.
                        </p>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                            Errors ({result.errors.length}):
                          </p>
                          <div className="max-h-40 overflow-y-auto bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                            {result.errors.map((error, idx) => (
                              <p key={idx} className="text-xs text-red-600 dark:text-red-400 pb-1 border-b border-red-50 dark:border-red-900/10 mb-1 last:border-0 last:pb-0">
                                • {error}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !file || !selectedTest}
                  className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Confirm Upload
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Example Preview */}
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500">CSV Example Preview</h4>
                <Badge variant="outline" className="text-[10px] h-4">Valid Structure</Badge>
              </div>
              <pre className="text-[11px] font-mono p-3 bg-gray-900 text-gray-300 rounded-lg overflow-x-auto ring-1 ring-white/10">
                {`text,type,category,difficulty,option1,option2,option3,option4,correctOption
"What is React?",multiple-choice,programming,Easy,Library,Framework,Language,Tool,1
"Dynamic Programming is?",essay,logical,Hard,,,,,,`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function PlacementQuestionsPage() {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    type: '',
    category: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.company) params.append('company', filters.company);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);

      const res = await fetch(`/api/admin/placement-questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/admin/placement-questions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
        alert('Question deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code className="w-4 h-4" />;
      case 'essay':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'multiple-choice': 'bg-blue-100 text-blue-800',
      'coding': 'bg-indigo-100 text-indigo-800',
      'essay': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      'Easy': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Placement Questions</h1>
          <p className="text-muted-foreground mt-1">
            Manage questions for TCS and Wipro placement tests
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBulkUpload(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">MCQ Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.type === 'multiple-choice').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Coding Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.type === 'coding').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Essay Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.filter(q => q.type === 'essay').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <select
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Companies</option>
                <option value="TCS">TCS</option>
                <option value="Wipro">Wipro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="multiple-choice">MCQ</option>
                <option value="coding">Coding</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="numerical">Numerical</option>
                <option value="verbal">Verbal</option>
                <option value="reasoning">Reasoning</option>
                <option value="logical">Logical</option>
                <option value="quant">Quantitative</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ company: '', type: '', category: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add questions using the &quot;Add Question&quot; or &quot;Bulk Upload&quot; buttons
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(question.type)}
                        <Badge className={getTypeBadge(question.type)}>
                          {question.type}
                        </Badge>
                        {question.category && (
                          <Badge variant="outline">{question.category}</Badge>
                        )}
                        {question.difficulty && (
                          <Badge className={getDifficultyBadge(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-blue-50">
                          {question.test.company || 'General'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">{question.text}</p>
                      {question.type === 'multiple-choice' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {question.options.map((opt, idx) => (
                            <div
                              key={opt.id}
                              className={`text-xs p-2 rounded ${opt.isCorrect
                                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                : 'bg-gray-50'
                                }`}
                            >
                              {String.fromCharCode(65 + idx)}. {opt.text}
                              {opt.isCorrect && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Test: {question.test.title}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {/* Edit functionality */ }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Question Modal - Will be implemented next */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Form will be implemented in next step...
              </p>
              <Button
                onClick={() => setShowAddModal(false)}
                className="mt-4"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => {
              setShowBulkUpload(false);
              fetchQuestions(); // Refresh questions after upload
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
