'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Building2, TrendingUp, Loader2 } from "lucide-react";
import Leaderboard from "@/components/leaderboard";

interface UserStats {
  testsTaken: number;
  avgScore: number;
  accuracy: number;
  strongestTopic: string;
}

interface RecentTest {
  id: string;
  name: string;
  score: number;
  percentage: number;
  date: string;
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats>({
    testsTaken: 0,
    avgScore: 0,
    accuracy: 0,
    strongestTopic: "N/A",
  });
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      // Fetch user's results
      const resultsRes = await fetch('/api/results');
      const resultsData = await resultsRes.json();
      
      if (resultsData.results && resultsData.results.length > 0) {
        interface ApiResult {
          id: string;
          score: number;
          total: number;
          createdAt: string;
          test?: {
            title?: string;
            topic?: string;
            company?: string;
          };
        }
        const results = resultsData.results;
        
        // Calculate statistics
        const testsTaken = results.length;
        const totalPercentage = results.reduce((sum: number, r: ApiResult) => {
          return sum + (r.score / r.total) * 100;
        }, 0);
        const avgScore = Math.round(totalPercentage / testsTaken);
        
        // Calculate accuracy (same as average for now)
        const accuracy = avgScore;
        
        // Find strongest topic
        const topicScores: Record<string, { total: number; count: number }> = {};
        results.forEach((r: ApiResult) => {
          const topic = r.test?.topic || r.test?.company || 'General';
          const percentage = (r.score / r.total) * 100;
          if (!topicScores[topic]) {
            topicScores[topic] = { total: 0, count: 0 };
          }
          topicScores[topic].total += percentage;
          topicScores[topic].count += 1;
        });
        
        let strongestTopic = 'N/A';
        let highestAvg = 0;
        Object.entries(topicScores).forEach(([topic, data]) => {
          const avg = data.total / data.count;
          if (avg > highestAvg) {
            highestAvg = avg;
            strongestTopic = topic;
          }
        });
        
        setStats({
          testsTaken,
          avgScore,
          accuracy,
          strongestTopic,
        });
        
        // Format recent tests
        const recent = results.slice(0, 5).map((r: ApiResult) => ({
          id: r.id,
          name: r.test?.title || 'Test',
          score: r.score,
          percentage: Math.round((r.score / r.total) * 100),
          date: new Date(r.createdAt).toLocaleDateString(),
        }));
        
        setRecentTests(recent);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.testsTaken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strongest Topic</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats.strongestTopic}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/topics">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        Practice by Topic
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Master specific topics like Time & Work, Probability, etc.</p>
                </CardContent>
            </Link>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/companies">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Building2 className="mr-2 h-5 w-5 text-primary" />
                        Company Specific Tests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Prepare for TCS, Infosys, Wipro and more.</p>
                </CardContent>
            </Link>
        </Card>
      </div>

      {/* Leaderboard */}
      <Leaderboard limit={10} />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tests taken yet. Start practicing to see your progress!
            </p>
          ) : (
            <div className="space-y-4">
              {recentTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.date}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold mr-2">{test.percentage}%</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/results/${test.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
