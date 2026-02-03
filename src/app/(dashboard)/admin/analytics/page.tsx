'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Users, BookOpen, Building2 } from "lucide-react";

interface TopPerformer {
  id: string;
  name: string;
  tests: number;
  avgScore: number;
}

interface TopicPerformance {
  topic: string;
  avgScore: number;
  difficulty: string;
  attempts: number;
}

interface CompanyPerformance {
  company: string;
  avgScore: number;
  difficulty: string;
  attempts: number;
}

interface AnalyticsData {
  topPerformers: TopPerformer[];
  topicPerformance: TopicPerformance[];
  companyPerformance: CompanyPerformance[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 md:p-10">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 font-semibold';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-red-600 dark:text-red-400 font-semibold';
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <TrendingUp className="h-8 w-8 text-blue-600" />
      </div>

      {/* Top Performers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topPerformers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No test results available yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Tests Taken</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topPerformers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-center">{user.tests}</TableCell>
                    <TableCell className={`text-right ${getScoreColor(user.avgScore)}`}>
                      {user.avgScore}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Test Performance Tabs */}
      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Aptitude Topics
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topicPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No aptitude test results available yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-center">Attempts</TableHead>
                      <TableHead className="text-center">Avg Score</TableHead>
                      <TableHead className="text-right">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topicPerformance.map((topic, index) => (
                      <TableRow key={`${topic.topic}-${index}`}>
                        <TableCell className="font-medium">{topic.topic}</TableCell>
                        <TableCell className="text-center">{topic.attempts}</TableCell>
                        <TableCell className={`text-center ${getScoreColor(topic.avgScore)}`}>
                          {topic.avgScore}%
                        </TableCell>
                        <TableCell className={`text-right ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Company Test Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data.companyPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No company test results available yet
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-center">Attempts</TableHead>
                      <TableHead className="text-center">Avg Score</TableHead>
                      <TableHead className="text-right">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.companyPerformance.map((company, index) => (
                      <TableRow key={`${company.company}-${index}`}>
                        <TableCell className="font-medium">{company.company}</TableCell>
                        <TableCell className="text-center">{company.attempts}</TableCell>
                        <TableCell className={`text-center ${getScoreColor(company.avgScore)}`}>
                          {company.avgScore}%
                        </TableCell>
                        <TableCell className={`text-right ${getDifficultyColor(company.difficulty)}`}>
                          {company.difficulty}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
