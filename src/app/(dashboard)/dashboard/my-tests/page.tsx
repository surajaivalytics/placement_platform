'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Building2, BookOpen, Clock, AlertCircle, PlayCircle, BarChart3 } from 'lucide-react';
import { PageHeader } from "@/components/dashboard/page-header";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";

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
    questionCount?: number;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader text="Loading Assignments..." />
      </div>
    );
  }

  const companyTests = assignments.filter(a => a.test.type === 'company');
  const topicTests = assignments.filter(a => a.test.type === 'topic');

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      <motion.div variants={item}>
        <PageHeader
          title="My Tests"
          description="Tests assigned to you by your instructors"
        />
      </motion.div>

      {assignments.length === 0 && (
        <motion.div variants={item}>
          <Card className="p-12 text-center border-dashed border-gray-200 bg-gray-50/50">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-sm">
                <AlertCircle className="h-12 w-12 text-gray-300" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">No Tests Assigned</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don&apos;t have any tests assigned yet. Check back later or contact your instructor.
            </p>
          </Card>
        </motion.div>
      )}

      {companyTests.length > 0 && (
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Company Tests</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companyTests.map(({ test }) => (
              <Card key={test.id} className="group h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-200 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="bg-white text-xs font-medium border-emerald-100 text-emerald-700">
                      {test.company}
                    </Badge>
                    <Badge
                      variant={test.difficulty === 'Easy' ? 'secondary' : test.difficulty === 'Medium' ? 'default' : 'destructive'}
                      className="text-xs rounded-lg px-2"
                    >
                      {test.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-xl group-hover:text-emerald-700 transition-colors">
                    {test.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {test.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-emerald-500" />
                        {test.duration} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                        Assessment
                      </span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-all rounded-xl"
                      onClick={() => handleStartTest(test.id)}
                    >
                      Start Test <PlayCircle className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {topicTests.length > 0 && (
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 rounded-xl">
              <BookOpen className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Topic Tests</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topicTests.map(({ test }) => (
              <Card key={test.id} className="group h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-200 bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="bg-white text-xs font-medium border-teal-100 text-teal-700">
                      {test.topic}
                    </Badge>
                    <Badge
                      variant={test.difficulty === 'Easy' ? 'secondary' : test.difficulty === 'Medium' ? 'default' : 'destructive'}
                      className="text-xs rounded-lg px-2"
                    >
                      {test.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2 text-xl group-hover:text-teal-700 transition-colors">
                    {test.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  {test.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-teal-500" />
                        {test.duration} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-teal-500" />
                        Practice
                      </span>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-all rounded-xl"
                      onClick={() => handleStartTest(test.id)}
                    >
                      Start Test <PlayCircle className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
