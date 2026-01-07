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
import { Building2, Plus, Pencil, Trash2, Upload, BookOpen, Shield, Target, Clock } from 'lucide-react';

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
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
          <Plus className="h-4 w-4 mr-2" />
          Create Company Test
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-none shadow-xl shadow-blue-500/5 overflow-hidden">
          <div className="h-2 bg-blue-600 w-full" />
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Create New Company Test</CardTitle>
                <CardDescription>
                  Setup a specialized test for a specific company recruitment drive
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google, Microsoft, Amazon"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    Test Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Google Aptitude Test 2024"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the test content and format"
                  className="min-h-[100px] rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Difficulty
                  </Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
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
                  <Label htmlFor="duration" className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="1"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                  Create Assessment
                </Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-xl hover:shadow-blue-500/5 transition-all border-gray-100 group">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">{test.company}</CardTitle>
                  <CardDescription className="mt-1 font-medium text-blue-600">{test.title}</CardDescription>
                </div>
                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => router.push(`/admin/company-tests/${test.id}/questions`)}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => router.push(`/admin/company-tests/${test.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium">Difficulty</p>
                    <p className="font-bold text-gray-900">{test.difficulty}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-400 font-medium">Duration</p>
                    <p className="font-bold text-gray-900">{test.duration}m</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {test._count.questions} Questions
                  </span>
                </div>

                <Button
                  className="w-full h-11 rounded-xl border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-bold"
                  variant="outline"
                  onClick={() => router.push(`/admin/company-tests/${test.id}/assign`)}
                >
                  Assign to Users
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && !showCreateForm && (
        <Card className="p-16 text-center border-dashed border-2 border-gray-100 shadow-none">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Company Tests Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Create specialized assessments for top companies to help students prepare for their dream placements.
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Test
          </Button>
        </Card>
      )}
    </div>
  );
}
