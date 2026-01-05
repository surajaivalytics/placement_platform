'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Upload, Download, Edit, Trash2, Loader2, 
  FileText, Code, MessageSquare, Search 
} from 'lucide-react';

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
    // Fetch placement tests (auto-creates if they don't exist)
    fetch('/api/admin/placement-tests')
      .then(res => res.json())
      .then(data => {
        if (data.tests) {
          setTests(data.tests);
          console.log('Placement tests loaded:', data.tests);
          if (data.created > 0) {
            console.log(`Created ${data.created} new placement tests`);
          }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bulk Upload Placement Questions</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CSV Format Instructions
            </h3>
            <div className="text-sm space-y-2">
              <p><strong>Required columns for all questions:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>text</code> - Question text</li>
                <li><code>type</code> - Question type: multiple-choice, coding, or essay</li>
                <li><code>category</code> - Category: numerical, verbal, reasoning, logical, quant, programming</li>
                <li><code>difficulty</code> - Optional: Easy, Medium, Hard</li>
              </ul>
              
              <p className="mt-3"><strong>For Multiple Choice Questions (MCQ):</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>option_1, option_2, option_3, option_4</code> - Four answer options</li>
                <li><code>correct_option</code> - A, B, C, or D indicating the correct answer</li>
                <li><code>explanation</code> - Optional: Explanation for the correct answer</li>
              </ul>

              <p className="mt-3"><strong>For Coding Questions:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code>testCases</code> - Optional: Test cases description</li>
                <li><code>sampleInput</code> - Optional: Sample input</li>
                <li><code>sampleOutput</code> - Optional: Sample output</li>
                <li><code>constraints</code> - Optional: Problem constraints</li>
              </ul>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Placement Test</label>
              <select
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Choose a test...</option>
                {tests.map(test => {
                  // Format display: "TCS - Foundation (10 questions)" or "Wipro - Aptitude (0 questions)"
                  const displayName = test.topic 
                    ? `${test.company} - ${test.topic}` 
                    : test.title;
                  
                  const questionCount = (test as CompanyTest & { _count?: { questions: number } })._count?.questions || 0;
                  
                  return (
                    <option key={test.id} value={test.id}>
                      {displayName} ({questionCount} questions)
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500">
                Select the test type that matches your questions (e.g., TCS - Foundation for foundation test questions)
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-lg cursor-pointer"
                required
              />
            </div>

            {/* Result Messages */}
            {result && (
              <div className={`p-4 rounded-lg ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
              }`}>
                <h4 className={`font-semibold mb-2 ${
                  result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {result.success ? '✓ Success' : '✗ Error'}
                </h4>
                <p className={`text-sm ${
                  result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {result.message}
                </p>
                {result.created !== undefined && (
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {result.created} questions uploaded successfully
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Errors encountered:
                    </p>
                    <div className="max-h-40 overflow-y-auto bg-white dark:bg-gray-800 p-2 rounded border">
                      {result.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                type="submit"
                disabled={loading || !file || !selectedTest}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Questions
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Example */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2 text-sm">Example CSV Content:</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`question,option_1,option_2,option_3,option_4,correct_option,explanation,difficulty,category
"What is 2+2?",2,3,4,5,C,"2+2=4",Easy,numerical
"Capital of India?",Mumbai,Delhi,Kolkata,Chennai,B,"Delhi is the capital",Easy,verbal`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
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
      'coding': 'bg-green-100 text-green-800',
      'essay': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      'Easy': 'bg-green-100 text-green-800',
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
    <div className="space-y-6">
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
                              className={`text-xs p-2 rounded ${
                                opt.isCorrect
                                  ? 'bg-green-50 border border-green-200'
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
                        onClick={() => {/* Edit functionality */}}
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
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => {
            setShowBulkUpload(false);
            fetchQuestions(); // Refresh questions after upload
          }}
        />
      )}
    </div>
  );
}
