'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { Trophy, Calendar, Target, Award, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock Data
const RESULTS = [
  { id: 1, test: "Time & Work", type: "Topic", score: 80, accuracy: 85, date: "2023-11-20" },
  { id: 2, test: "TCS NQT Mock", type: "Company", score: 72, accuracy: 78, date: "2023-11-18" },
  { id: 3, test: "Percentage", type: "Topic", score: 90, accuracy: 95, date: "2023-11-15" },
  { id: 4, test: "Wipro NTH", type: "Company", score: 65, accuracy: 70, date: "2023-11-10" },
  { id: 5, test: "Ratio & Proportions", type: "Topic", score: 88, accuracy: 92, date: "2023-11-05" },
];

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

export default function ResultsHistoryPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-8"
    >
      <motion.div variants={item}>
        <PageHeader
          title="My Results"
          description="Track your performance and test history"
        >
          <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
            <ArrowUpRight className="w-4 h-4" /> Export Report
          </Button>
        </PageHeader>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-emerald-100 shadow-sm bg-emerald-50/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">79%</div>
            <p className="text-xs text-emerald-600 font-medium">
              +2.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border border-teal-100 shadow-sm bg-teal-50/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Tests Taken</CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">12</div>
            <p className="text-xs text-teal-600 font-medium">
              4 this week
            </p>
          </CardContent>
        </Card>
        <Card className="border border-cyan-100 shadow-sm bg-cyan-50/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-700">84%</div>
            <p className="text-xs text-cyan-600 font-medium">
              Consistent performance
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-white/50 border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Recent Performance</CardTitle>
                <CardDescription className="text-gray-500">View detailed analysis of your recent attempts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-[300px] font-semibold text-gray-700">Test Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Score</TableHead>
                  <TableHead className="font-semibold text-gray-700">Accuracy</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RESULTS.map((result) => (
                  <TableRow key={result.id} className="group hover:bg-emerald-50/30 transition-colors border-b border-gray-100">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-gray-900">{result.test}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium bg-white text-gray-600 border-gray-200">{result.type}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {result.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">{result.score}%</TableCell>
                    <TableCell className="text-gray-700">{result.accuracy}%</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={result.score >= 75 ? "outline" : result.score >= 50 ? "secondary" : "destructive"}
                        className={result.score >= 75 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" : ""}
                      >
                        {result.score >= 75 ? "Excellent" : result.score >= 50 ? "Average" : "Needs Improvement"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
