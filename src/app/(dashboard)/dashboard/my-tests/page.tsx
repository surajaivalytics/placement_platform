'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Clock, AlertCircle } from 'lucide-react';

interface AssignedTest {
  id: string;
  test: {
    id: string;
    title: string;
    description: string;
    type: string;
    company: string | null;
    topic: string | null;
    difficulty: string;
    duration: number;
  };
}

export default function MyTestsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignedTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTests();
  }, []);

  const fetchAssignedTests = async () => {
    try {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assigned tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: string) => {
    router.push(`/dashboard/test/${testId}`);
  };

  if (loading) {
    return <div className="p-8">Loading your tests...</div>;
  }

  const companyTests = assignments.filter(a => a.test.type === 'company');
  const topicTests = assignments.filter(a => a.test.type === 'topic');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Tests</h1>
        <p className="text-muted-foreground mt-1">
          Tests assigned to you by your instructors
        </p>
      </div>

      {assignments.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Tests Assigned</h3>
          <p className="text-muted-foreground">
            You don&apos;t have any tests assigned yet. Check back later or contact your instructor.
          </p>
        </Card>
      )}

      {companyTests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Company Tests</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companyTests.map(({ test }) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {test.company}
                  </CardTitle>
                  <CardDescription>{test.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className={`font-medium ${
                        test.difficulty === 'Easy' ? 'text-green-600' :
                        test.difficulty === 'Medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration} mins
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleStartTest(test.id)}
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {topicTests.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Topic Tests</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topicTests.map(({ test }) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {test.topic}
                  </CardTitle>
                  <CardDescription>{test.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {test.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {test.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className={`font-medium ${
                        test.difficulty === 'Easy' ? 'text-green-600' :
                        test.difficulty === 'Medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration} mins
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleStartTest(test.id)}
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
