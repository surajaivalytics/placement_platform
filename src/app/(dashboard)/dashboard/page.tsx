'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Leaderboard from "@/components/leaderboard";
import {
  Calendar,
  ThumbsUp,
  Clock,
  Zap,
  MoreHorizontal,
  Phone,
  Video,
  MoreVertical,
  Download,
  Smile,
  Send,
  Paperclip,
  CheckCircle2,
  Circle,
  Clock3,
  Search,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

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
  status: 'Done' | 'In progress' | 'On hold';
}

export default function UserDashboard() {
  /* ----------------------------------------------------------------------------------
   *  STATE: User Profile
   * ---------------------------------------------------------------------------------- */
  const [profile, setProfile] = useState({
    name: "User",
    image: null as string | null,
    role: "student",
    accountType: "Regular"
  });

  /* ----------------------------------------------------------------------------------
   *  STATE: Dashboard Stats & Charts
   * ---------------------------------------------------------------------------------- */
  const [stats, setStats] = useState<UserStats>({
    testsTaken: 0,
    avgScore: 0,
    accuracy: 0,
    strongestTopic: "N/A",
  });
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  /* ----------------------------------------------------------------------------------
   *  EFFECT: Fetch Dashboard Data
   * ---------------------------------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch Profile Data
      const profileRes = await fetch('/api/user/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile({
          name: profileData.name || "User",
          image: profileData.image || null,
          role: profileData.role || "student",
          accountType: profileData.accountType || "Regular"
        });
      }

      // 2. Fetch Results/Stats Data
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
        const accuracy = avgScore; // Mapping Accuracy to Avg Score for now

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

        setStats({ testsTaken, avgScore, accuracy, strongestTopic });

        // Format recent tests for List
        const recent = results.slice(0, 5).map((r: ApiResult) => ({
          id: r.id,
          name: r.test?.title || 'Test Application',
          score: r.score,
          percentage: Math.round((r.score / r.total) * 100),
          date: new Date(r.createdAt).toLocaleDateString(),
          status: 'Done' as const // Assuming all results are completed tests
        }));
        setRecentTests(recent);

        // Format Chart Data (Reverse chronological order for chart)
        const chartDataFormatted = results.slice(0, 7).reverse().map((r: ApiResult, i: number) => ({
          name: `Test ${i + 1}`,
          score: Math.round((r.score / r.total) * 100),
          avg: avgScore // Baseline
        }));
        setChartData(chartDataFormatted);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* LEFT COLUMN (Main Content) - 8/12 */}
        <div className="xl:col-span-8 flex flex-col gap-8">

          {/* Top Bar: Search & Date */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-12 pr-4 h-14 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-0 text-gray-600 placeholder:text-gray-400 font-medium"
              />
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm h-14">
              <span>{currentDate}</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Greeting Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hello, {profile.name}</h1>
            <p className="text-gray-500 mt-1">Track your placement progress here. You almost reach a goal!</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1: Finished */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.testsTaken} <span className="text-sm font-normal text-green-500 ml-1">▼ +8 tasks</span></h3>
                  <p className="text-gray-500 text-sm font-medium">Finished</p>
                </div>
              </div>
            </div>

            {/* Stat 2: Tracked (Score) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.avgScore}% <span className="text-sm font-normal text-red-500 ml-1">▲ -6 hours</span></h3>
                  <p className="text-gray-500 text-sm font-medium">Average Score</p>
                </div>
              </div>
            </div>

            {/* Stat 3: Efficiency */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.accuracy}% <span className="text-sm font-normal text-green-500 ml-1">▼ +12%</span></h3>
                  <p className="text-gray-500 text-sm font-medium">Efficiency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900">Performance</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">01-07 May ▼</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [{ name: "01", score: 40 }, { name: "02", score: 60 }, { name: "03", score: 55 }, { name: "04", score: 80 }, { name: "05", score: 70 }]}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skills Mastery Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Aptitude', 'Verbal', 'Reasoning', 'Technical'].map((skill, idx) => (
              <div key={skill} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 group hover:shadow-md transition-all">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={200} strokeDashoffset={200 - (200 * [75, 45, 90, 60][idx]) / 100} className={`text-${['blue', 'orange', 'green', 'purple'][idx]}-500 transition-all duration-1000 ease-out`} />
                  </svg>
                  <span className="absolute text-lg font-bold text-gray-700">{[75, 45, 90, 60][idx]}%</span>
                </div>
                <h4 className="font-bold text-gray-900">{skill}</h4>
              </div>
            ))}
          </div>

          {/* Upcoming Tests Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Tests</h3>
              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200">View Calendar</Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide relative z-10">
              {[
                { company: 'Google', role: 'SDE Assessment', date: '12th Aug' },
                { company: 'Microsoft', role: 'Coding Round', date: '15th Aug' },
                { company: 'Amazon', role: 'Aptitude Test', date: '20th Aug' },
                { company: 'TCS', role: 'NQT Exam', date: '25th Aug' },
              ].map((drive, i) => (
                <div key={i} className="min-w-[200px] bg-white p-4 rounded-2xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{drive.company}</h4>
                    <p className="text-sm text-gray-500">{drive.role}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold bg-gray-50 text-gray-600 w-fit px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" /> {drive.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Current Tasks List */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <h3 className="text-xl font-bold text-gray-900">Current Tasks</h3>
                <span className="text-sm font-semibold text-gray-400">Done 30%</span>
              </div>
              <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">Week ▼</span>
            </div>

            <div className="space-y-6">
              {recentTests.length > 0 ? recentTests.map((test, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-gray-900">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${test.status === 'Done' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="text-sm font-medium text-gray-600">{test.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock3 className="w-4 h-4" />
                    <span className="text-sm font-medium">{test.score}%</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">No active tasks</div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Profile & Activity) - 4/12 */}
        <div className="xl:col-span-4 flex flex-col gap-8">

          {/* Profile Card */}
          <div className="bg-white rounded-[32px] p-8 flex flex-col items-center text-center shadow-sm border border-gray-100">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src={profile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} />
                <AvatarFallback>{profile.name ? profile.name[0] : 'U'}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500 text-sm">@{profile.name.toLowerCase().replace(/\s+/g, '_')}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 capitalize">{profile.role}</Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100">{profile.accountType === 'Premium' ? 'Pro Member' : 'Basic Member'}</Badge>
            </div>
          </div>

          {/* Leaderboard & Start Test Section */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-lg font-bold text-gray-900">Leaderboard</h3>
              <Link href="/dashboard/leaderboard" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <Leaderboard limit={5} />
            </div>

            {/* Start Test CTA */}
            <div className="bg-gray-900 rounded-[24px] p-6 text-white text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to compete?</h3>
                <p className="text-gray-400 text-sm mb-6">Take a new test to boost your rank on the leaderboard!</p>

                <Button asChild className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold h-12 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/dashboard/topics">
                    Start New Test
                  </Link>
                </Button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
