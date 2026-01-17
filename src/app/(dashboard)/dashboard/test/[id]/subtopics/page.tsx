'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, CheckCircle2, Clock, ArrowLeft, Trophy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { motion } from "framer-motion";

interface Subtopic {
  id: string;
  name: string;
  description?: string;
  totalQuestions: number;
  progress: {
    score: number;
    total: number;
    percentage: number;
    completed: boolean;
    attempted: boolean;
  } | null;
}

interface Test {
  id: string;
  title: string;
  description?: string;
  duration: number;
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

export default function SubtopicsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [testId, setTestId] = useState<string>('');
  const [test, setTest] = useState<Test | null>(null);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setTestId(id);
      // Fetch test details
      fetch(`/api/tests?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) {
            setTest(data.test);
          }
        })
        .catch(err => console.error('Failed to fetch test:', err));

      // Fetch subtopics
      fetch(`/api/tests/${id}/subtopics`)
        .then(res => res.json())
        .then(data => {
          if (data.subtopics) {
            setSubtopics(data.subtopics);
          }
        })
        .catch(err => console.error('Failed to fetch subtopics:', err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const getStatusBadge = (subtopic: Subtopic) => {
    if (subtopic.progress?.completed) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (subtopic.progress?.attempted) {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-gray-300 text-gray-600">
        Not Started
      </Badge>
    );
  };

  const completedCount = subtopics.filter(s => s.progress?.completed).length;
  const totalSubtopics = subtopics.length;
  const overallProgress = totalSubtopics > 0 ? (completedCount / totalSubtopics) * 100 : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      <motion.div variants={item}>
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/topics')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </Button>
        </div>
        
        <PageHeader
          title={test?.title || 'Select Subtopic'}
          description={test?.description || 'Choose a subtopic to practice'}
        />

        {/* Overall Progress Card */}
        {totalSubtopics > 0 && (
          <Card className="mt-6 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Overall Progress</h3>
                    <p className="text-sm text-gray-600">
                      {completedCount} of {totalSubtopics} subtopics completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(overallProgress)}%
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {subtopics.length === 0 ? (
        <motion.div variants={item} className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">No Subtopics Found</h3>
          <p className="text-gray-500">This topic doesn't have any subtopics yet.</p>
          <Button
            onClick={() => router.push(`/dashboard/test/${testId}`)}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Take Full Test Instead
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subtopics.map((subtopic) => (
            <Card
              key={subtopic.id}
              className="group flex flex-col border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white rounded-3xl relative h-full"
            >
              {/* Status Indicator */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                subtopic.progress?.completed
                  ? 'bg-green-500'
                  : subtopic.progress?.attempted
                  ? 'bg-yellow-500'
                  : 'bg-gray-300'
              }`} />

              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  {getStatusBadge(subtopic)}
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-2">
                    {subtopic.name}
                  </h3>
                  {subtopic.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {subtopic.description}
                    </p>
                  )}
                </div>

                {/* Progress Info */}
                {subtopic.progress?.completed && (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Score:</span>
                      <span className="font-bold text-green-700">
                        {subtopic.progress.score}/{subtopic.progress.total} ({Math.round(subtopic.progress.percentage)}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                    <BookOpen className="w-3.5 h-3.5" />
                    {subtopic.totalQuestions} Questions
                  </div>

                  <Button
                    onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${subtopic.id}`)}
                    className="bg-gray-900 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-gray-200 group-hover:shadow-blue-200 transition-all font-semibold h-10 text-sm px-6"
                  >
                    {subtopic.progress?.completed ? 'Retry' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Summary Button - Show after all completed */}
      {completedCount === totalSubtopics && totalSubtopics > 0 && (
        <motion.div variants={item} className="flex justify-center pt-8">
          <Button
            onClick={() => router.push(`/dashboard/test/${testId}/summary`)}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl shadow-xl px-12 py-6 text-lg font-bold"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Topic Summary
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
