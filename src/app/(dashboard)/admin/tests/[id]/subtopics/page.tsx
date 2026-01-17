'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Trash2, FileEdit, ArrowLeft, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Subtopic {
  id: string;
  name: string;
  description?: string;
  totalQuestions: number;
  order?: number;
}

interface Test {
  id: string;
  title: string;
  description?: string;
}

export default function SubtopicsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<Test | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  useEffect(() => {
    fetchTestAndSubtopics();
  }, [testId]);

  const fetchTestAndSubtopics = async () => {
    try {
      // Fetch test details
      const testResponse = await fetch(`/api/tests/${testId}`);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        setTest(testData.test);
      }

      // Fetch subtopics
      const subtopicsResponse = await fetch(`/api/tests/${testId}/subtopics`);
      if (subtopicsResponse.ok) {
        const data = await subtopicsResponse.json();
        setSubtopics(data.subtopics || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtopic = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/subtopics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '', order: 0 });
        fetchTestAndSubtopics();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating subtopic:', error);
      alert('Failed to create subtopic');
    }
  };

  const handleDeleteSubtopic = async (subtopicId: string, subtopicName: string) => {
    if (!confirm(`Are you sure you want to delete "${subtopicName}"? This will also delete all associated questions.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tests/${testId}/subtopics/${subtopicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTestAndSubtopics();
      } else {
        alert('Failed to delete subtopic');
      }
    } catch (error) {
      console.error('Error deleting subtopic:', error);
      alert('Failed to delete subtopic');
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadFile || !selectedSubtopic) {
      alert('Please select a file and subtopic');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('testId', testId);
      formData.append('subtopicId', selectedSubtopic);

      const response = await fetch('/api/admin/subtopics/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (response.ok) {
        fetchTestAndSubtopics();
        setTimeout(() => {
          setIsUploadDialogOpen(false);
          setUploadFile(null);
          setSelectedSubtopic(null);
          setUploadResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({ error: 'Failed to upload file' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/tests')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subtopics</h1>
          <p className="text-muted-foreground mt-1">
            {test?.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            variant="outline"
            className="shadow-sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Subtopic
          </Button>
        </div>
      </div>

      {/* Subtopics Grid */}
      {subtopics.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No subtopics found. Create your first subtopic!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subtopics.map((subtopic) => (
            <Card key={subtopic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{subtopic.name}</CardTitle>
                  {subtopic.description && (
                    <CardDescription className="text-sm mt-1">
                      {subtopic.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{subtopic.totalQuestions} Questions</span>
                  {subtopic.order !== null && <span>Order: {subtopic.order}</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedSubtopic(subtopic.id);
                      setIsUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Questions
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSubtopic(subtopic.id, subtopic.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Subtopic Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Subtopic</DialogTitle>
            <DialogDescription>
              Add a new subtopic to organize questions within this test.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subtopic Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Time and Work"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this subtopic"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubtopic} disabled={!formData.name}>
              Create Subtopic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Questions CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with questions for {selectedSubtopic ? subtopics.find(s => s.id === selectedSubtopic)?.name : 'a subtopic'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subtopic">Select Subtopic *</Label>
              <select
                id="subtopic"
                className="w-full p-2 border rounded-md"
                value={selectedSubtopic || ''}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
              >
                <option value="">Choose a subtopic...</option>
                {subtopics.map((subtopic) => (
                  <option key={subtopic.id} value={subtopic.id}>
                    {subtopic.name} ({subtopic.totalQuestions} questions)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">CSV File *</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                CSV should have columns: question, option_1, option_2, option_3, option_4, correct_option, explanation (optional)
              </p>
            </div>
            {uploadResult && (
              <div className={`p-4 rounded-md ${uploadResult.error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
                <p className="font-semibold">
                  {uploadResult.error || uploadResult.message}
                </p>
                {uploadResult.created && (
                  <p className="text-sm mt-1">Created: {uploadResult.created} questions</p>
                )}
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                      {uploadResult.errors.slice(0, 10).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <li>... and {uploadResult.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadCSV}
              disabled={!uploadFile || !selectedSubtopic || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
