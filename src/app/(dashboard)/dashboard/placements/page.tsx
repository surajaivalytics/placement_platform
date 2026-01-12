'use client';

import { ApplicationsTable } from "@/components/placements/applications-table";
import { PlacementFilters } from "@/components/placements/placement-filters";
import { LayoutDashboard, Briefcase, TrendingUp, Clock, Award, Building2, ChevronRight } from "lucide-react";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Application {
  id: string;
  company: string;
  status: string;
  currentStage: string | null;
  finalTrack: string | null;
  finalDecision: string | null;
  createdAt: string;
}

export default function PlacementsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/placements/my-applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header Section - Professional & Minimal */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Placements</h1>
              <p className="text-lg text-gray-600 mt-2">Track your applications and manage your placement journey</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Placement Drive 2025–2026 • Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">Placements</span>
        </nav>
      </div>

      {/* Main Content */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8"
      >
        {/* Main Area - 3 columns */}
        <motion.div variants={item} className="xl:col-span-3 space-y-8">
          {/* Filters Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <PlacementFilters />
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Your Applications</CardTitle>
                  <CardDescription>Real-time progress across all active drives</CardDescription>
                </div>
                <Badge variant="outline">{applications.length} Applications</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ApplicationsTable />
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - 1 column */}
        <div className="space-y-8">

          {/* Quick Stats Card */}
          <motion.div variants={item}>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Placement Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        <Briefcase className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-600">Total Applications</p>
                      <p className="text-2xl font-semibold">1,248</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-green-100 text-green-700">
                        <Award className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-600">Selection Growth</p>
                      <p className="text-2xl font-semibold text-green-600">+14.2%</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        <Clock className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-600">Pending Actions</p>
                      <p className="text-2xl font-semibold text-amber-600">45</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Profile Completeness</span>
                    <span className="font-semibold">75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-sm text-gray-600 mt-2">Complete your profile to increase visibility</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Urgent Drives Card */}
          <motion.div variants={item}>
            <Card className="shadow-sm border-l-4 border-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">Drives Closing Soon</h4>
                    <p className="text-sm text-gray-600 mb-4">TCS, Wipro, Infosys — assessments in progress</p>
                    <Button variant="outline" size="sm">
                      View Drives <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}