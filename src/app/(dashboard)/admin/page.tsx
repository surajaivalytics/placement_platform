'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileQuestion, GraduationCap, BarChart3, Upload, Building2, Loader2 } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalQuestions: number;
  totalTests: number;
  topicTests: number;
  companyTests: number;
  avgPlatformScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalTests: 0,
    topicTests: 0,
    companyTests: 0,
    avgPlatformScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all required data in parallel
      const [usersRes, testsRes, resultsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/tests'),
        fetch('/api/admin/stats'),
      ]);

      const usersData = await usersRes.json();
      const testsData = await testsRes.json();
      const resultsData = await resultsRes.json();

      // Calculate statistics
      const totalUsers = usersData.users?.length || 0;
      const tests = testsData.tests || [];
      const totalTests = tests.length;
      const topicTests = tests.filter((t: { type: string }) => t.type === 'topic').length;
      const companyTests = tests.filter((t: { type: string }) => t.type === 'company').length;
      
      // Count total questions
      const totalQuestions = tests.reduce((sum: number, test: { _count?: { questions: number } }) => {
        return sum + (test._count?.questions || 0);
      }, 0);

      // Calculate average platform score
      const avgPlatformScore = resultsData.avgScore || 0;

      setStats({
        totalUsers,
        totalQuestions,
        totalTests,
        topicTests,
        companyTests,
        avgPlatformScore,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topicTests} Aptitude • {stats.companyTests} Company
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Platform Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPlatformScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/questions/new" className="flex flex-col items-center justify-center gap-2">
                <FileQuestion className="h-8 w-8" />
                Add Question
            </Link>
        </Button>
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/questions/upload" className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8" />
                Bulk Upload
            </Link>
        </Button>
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/tests/new" className="flex flex-col items-center justify-center gap-2">
                <GraduationCap className="h-8 w-8" />
                Create Test
            </Link>
        </Button>
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/company-tests" className="flex flex-col items-center justify-center gap-2">
                <Building2 className="h-8 w-8" />
                Company Tests
            </Link>
        </Button>
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/users" className="flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8" />
                Manage Users
            </Link>
        </Button>
        <Button asChild className="h-24 text-lg" variant="outline">
            <Link href="/admin/analytics" className="flex flex-col items-center justify-center gap-2">
                <BarChart3 className="h-8 w-8" />
                View Analytics
            </Link>
        </Button>
      </div>
    </div>
  );
}
