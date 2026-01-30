'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Zap,
  MoreHorizontal,
  CheckCircle2,
  Search,
  Building2,
  Trophy,
  Target,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  LayoutDashboard,
  Clock3,
  Settings2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

/* ----------------------------------------------------------------------------------
 *  TYPES
 * ---------------------------------------------------------------------------------- */
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

/* ----------------------------------------------------------------------------------
 *  COMPONENT: UserDashboard
 * ---------------------------------------------------------------------------------- */
export default function UserDashboard() {
  const [profile, setProfile] = useState({
    name: "User",
    image: null as string | null,
    role: "student",
    accountType: "Regular"
  });

  const [stats, setStats] = useState<UserStats>({
    testsTaken: 0,
    avgScore: 0,
    accuracy: 0,
    strongestTopic: "N/A",
  });

  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  // Visibility State
  const [visibleSections, setVisibleSections] = useState({
    stats: true,
    performance: true,
    activity: true,
    profile: true,
    upcoming: true
  });

  /* ----------------------------------------------------------------------------------
   *  DATA FETCHING
   * ---------------------------------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
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

        // Stats Calculation
        const testsTaken = results.length;
        const totalPercentage = results.reduce((sum: number, r: ApiResult) => sum + (r.score / r.total) * 100, 0);
        const avgScore = Math.round(totalPercentage / testsTaken);

        setStats({ testsTaken, avgScore, accuracy: avgScore, strongestTopic: "Logic" }); // Mock logic for topic

        // Recent Tests
        setRecentTests(results.slice(0, 5).map((r: ApiResult) => ({
          id: r.id,
          name: r.test?.title || 'Assessment',
          score: r.score,
          percentage: Math.round((r.score / r.total) * 100),
          date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          status: 'Done'
        })));

        // Chart Data
        setChartData(results.slice(0, 7).reverse().map((r: ApiResult, i: number) => ({
          name: `Test ${i + 1}`,
          score: Math.round((r.score / r.total) * 100),
        })));
      }
    } catch (error) {
      console.error('Failed load dashboard', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ----------------------------------------------------------------------------------
   *  ANIMATIONS
   * ---------------------------------------------------------------------------------- */
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-10 font-sans text-slate-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >

        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-500 font-medium mb-1">
              <Calendar className="w-4 h-4" />
              {currentDate}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Welcome back, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl">
              Here's what's happening with your job applications and assessments today.
            </p>
          </div>


          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Dashboard Content</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={visibleSections.stats}
                  onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, stats: checked }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  Stats Overview
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleSections.performance}
                  onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, performance: checked }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  Performance Chart
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleSections.activity}
                  onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, activity: checked }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  Recent Activity
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleSections.profile}
                  onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, profile: checked }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  Profile Card
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={visibleSections.upcoming}
                  onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, upcoming: checked }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  Upcoming Events
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20">
              Start Assessment
            </Button>
          </div>
        </motion.div>

        {/* STATS OVERVIEW CARDS */}
        {visibleSections.stats && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              icon={<Target className="w-6 h-6 text-indigo-600" />}
              label="Tests Completed"
              value={stats.testsTaken}
              trend="+12% this week"
              color="indigo"
            />
            <StatCard
              icon={<Trophy className="w-6 h-6 text-emerald-600" />}
              label="Average Score"
              value={`${stats.avgScore}%`}
              trend="Top 15% of class"
              color="emerald"
            />
            <StatCard
              icon={<BrainCircuit className="w-6 h-6 text-purple-600" />}
              label="Strongest Skill"
              value={stats.strongestTopic || "Logic"}
              trend="92% accuracy"
              color="purple"
            />
            <StatCard
              icon={<Clock className="w-6 h-6 text-orange-600" />}
              label="Learning Time"
              value="12h 4m"
              trend="+2.5h vs last week"
              color="orange"
            />
          </motion.div>
        )}

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (Chart & Activity) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">

            {/* Performance Chart */}
            {visibleSections.performance && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Performance Trend</h3>
                    <p className="text-sm text-slate-500">Your score progression over the last 7 tests</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </div>

                <div className="h-[300px] w-full" style={{ minHeight: '300px', minWidth: '100px' }}>
                  {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.length ? chartData : [{ name: 'T1', score: 0 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity List */}
            {visibleSections.activity && (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Recent Assessments</h3>
                  <Link href="/dashboard/history" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</Link>
                </div>

                <div className="space-y-1">
                  {recentTests.length > 0 ? (
                    recentTests.map((test, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${test.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                            {test.score >= 80 ? <Trophy className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{test.name}</h4>
                            <p className="text-sm text-slate-500">{test.date} &bull; {test.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{test.score}%</div>
                          {test.score >= 70 ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">PASSED</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">AVG</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">No recent activity found.</div>
                  )}
                </div>
              </div>
            )}

          </motion.div>

          {/* RIGHT COLUMN (Profile & Upcoming) */}
          <motion.div variants={itemVariants} className="space-y-8">

            {/* Profile Card */}
            {visibleSections.profile && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-slate-50 to-transparent"></div>
                <div className="relative z-10 -mt-2">
                  <div className="relative inline-block">
                    <Avatar className="w-28 h-28 border-4 border-white shadow-xl">
                      <AvatarImage src={profile.image || undefined} />
                      <AvatarFallback className="bg-slate-900 text-white text-3xl font-bold">{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-4">{profile.name}</h2>
                  <p className="text-slate-500 font-medium">{profile.role}</p>

                  <div className="mt-6 flex gap-2 w-full">
                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Rank</div>
                      <div className="text-xl font-black text-slate-900">#42</div>
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Plan</div>
                      <div className="text-xl font-black text-indigo-600">{profile.accountType}</div>
                    </div>
                  </div>

                  <Link href="/dashboard/settings" className="w-full mt-6 block">
                    <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 h-12 font-semibold">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Upcoming Event Card */}
            {visibleSections.upcoming && (
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl">
                      <Building2 className="w-6 h-6 text-indigo-300" />
                    </div>
                    <Badge className="bg-indigo-500 text-white border-0">Upcoming</Badge>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">Google SDE Assessment</h3>
                  <div className="flex items-center gap-2 text-slate-300 mb-6 font-medium">
                    <Clock3 className="w-4 h-4" />
                    Aug 15 &bull; 2:00 PM
                  </div>

                  <Button className="w-full bg-white text-black hover:bg-slate-100 font-bold h-12 rounded-xl">
                    Register Now
                  </Button>
                </div>
              </div>
            )}

          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------------------
 *  HELPER COMPONENTS
 * ---------------------------------------------------------------------------------- */
function StatCard({ icon, label, value, trend, color }: any) {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorStyles[color as keyof typeof colorStyles]}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend.includes('%') ? trend.split(' ')[0] : 'Up'}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-medium text-slate-900 tracking-tight">{value}</h3>
        <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
