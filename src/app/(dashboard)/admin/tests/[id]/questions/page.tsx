'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
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
    options: ['', '', '', ''],
    correctOptionIndex: 0,
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
      const response = await fetch(`/api/tests/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newQuestion.text,
          options: newQuestion.options.map((text, index) => ({
            text,
            isCorrect: index === newQuestion.correctOptionIndex,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions([...questions, data.question]);
        setNewQuestion({
          text: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
        });
        setShowAddForm(false);
        alert('Question added successfully');
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
        alert('Question deleted successfully');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground">Test not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/tests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
            <p className="text-muted-foreground">
              {test.type === 'company' ? `Company: ${test.company}` : `Topic: ${test.topic}`}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <textarea
                  id="questionText"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your question here..."
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      required
                    />
                    <input
                      type="radio"
                      name="correctOption"
                      checked={newQuestion.correctOptionIndex === index}
                      onChange={() => setNewQuestion({ ...newQuestion, correctOptionIndex: index })}
                      className="w-4 h-4"
                    />
                    <Label className="text-sm">Correct</Label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Question</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
        {questions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No questions added yet. Click &quot;Add Question&quot; to get started.
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium">
                      {index + 1}. {question.text}
                    </CardTitle>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    disabled={deletingId === question.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`p-2 rounded border ${
                        option.isCorrect
                          ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
