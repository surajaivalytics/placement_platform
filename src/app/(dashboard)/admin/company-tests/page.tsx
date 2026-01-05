'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building2, Plus, Pencil, Trash2, Upload } from 'lucide-react';

interface CompanyTest {
  id: string;
  title: string;
  description: string;
  company: string;
  difficulty: string;
  duration: number;
  _count: {
    questions: number;
  };
}

export default function CompanyTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<CompanyTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    difficulty: 'Medium',
    duration: 60,
  });

  const fetchCompanyTests = useCallback(async () => {
    try {
      const res = await fetch('/api/tests?type=company');
      const data = await res.json();
      setTests(data.tests || []);
    } catch (error) {
      console.error('Error fetching company tests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyTests();
  }, [fetchCompanyTests]);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'company',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          company: '',
          difficulty: 'Medium',
          duration: 60,
        });
        fetchCompanyTests();
        // Navigate to add questions
        router.push(`/admin/company-tests/${data.test.id}/questions`);
      }
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      const res = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCompanyTests();
      }
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading company tests...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Company Tests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage company-specific aptitude tests
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company Test
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Company Test</CardTitle>
            <CardDescription>
              Create a test for a specific company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, Amazon"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Google Aptitude Test 2024"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the test content and format"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Test</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.company}</CardTitle>
                  <CardDescription className="mt-1">{test.title}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => router.push(`/admin/company-tests/${test.id}/questions`)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => router.push(`/admin/company-tests/${test.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium">{test.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{test.duration} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions:</span>
                  <span className="font-medium">{test._count.questions}</span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push(`/admin/company-tests/${test.id}/assign`)}
              >
                Assign to Users
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && !showCreateForm && (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Company Tests Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first company-specific test to get started
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Company Test
          </Button>
        </Card>
      )}
    </div>
  );
}
