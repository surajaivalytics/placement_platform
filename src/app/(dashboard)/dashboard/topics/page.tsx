'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/loader";
import { BookOpen, HelpCircle, Code2, Calculator, BrainCircuit } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { parseJsonSafely } from "@/lib/fetch-utils";

interface Test {
  id: string;
  title: string;
  _count: {
    questions: number;
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

// Helper to deduce icon or logo
const getTopicIcon = (title: string) => {
  const lower = title.toLowerCase();

  // Check for company logos first
  if (lower.includes('tcs')) return <img src="/logos/tcs-1696999494.jpg" alt="TCS" className="w-10 h-10 object-contain" />;
  if (lower.includes('wipro')) return <img src="/logos/Wipro_Secondary-Logo_Color_RGB.png" alt="Wipro" className="w-10 h-10 object-contain" />;
  if (lower.includes('ibm')) return <img src="/logos/IBM.png" alt="IBM" className="w-10 h-10 object-contain" />;
  if (lower.includes('accenture')) return <img src="/logos/acc.png" alt="Accenture" className="w-10 h-10 object-contain" />;

  // Default topic icons
  if (lower.includes('verbal')) return <BookOpen className="w-6 h-6 text-purple-600" />;
  if (lower.includes('logic') || lower.includes('reasoning')) return <BrainCircuit className="w-6 h-6 text-indigo-600" />;
  if (lower.includes('math') || lower.includes('quant')) return <Calculator className="w-6 h-6 text-emerald-600" />;
  if (lower.includes('code') || lower.includes('program')) return <Code2 className="w-6 h-6 text-blue-600" />;

  return <BookOpen className="w-6 h-6 text-gray-600" />;
};

const getAccentColor = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('tcs')) return 'bg-[#0067b1]'; // TCS Blue
  if (lower.includes('wipro')) return 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500'; // Wipro Rainbow
  if (lower.includes('verbal')) return 'bg-purple-500';
  if (lower.includes('logic')) return 'bg-indigo-500';
  if (lower.includes('math')) return 'bg-emerald-500';
  return 'bg-blue-600';
}

export default function TopicsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only topic/aptitude tests
    fetch('/api/tests?type=topic')
      .then(parseJsonSafely)
      .then(data => {
        if (data.tests) {
          setTests(data.tests);
        }
      })
      .catch(err => console.error('Failed to fetch tests:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spinner size={40} className="text-emerald-600" />
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
        <PageHeader
          title="Aptitude Tests by Topic"
          description="Practice aptitude questions organized by specific topics and companies."
        />
      </motion.div>

      {tests.length === 0 ? (
        <motion.div variants={item} className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">No Tests Found</h3>
          <p className="text-gray-500">There are no aptitude tests available at the moment.</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tests.map((test) => (
            <Card key={test.id} className="group flex flex-col border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white rounded-3xl relative h-full">
              {/* Color Accent */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${getAccentColor(test.title)}`} />

              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {getTopicIcon(test.title)}
                  </div>
                  {test.title.toLowerCase().includes('tcs') || test.title.toLowerCase().includes('wipro') ? (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">Premium</Badge>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-50" />
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                    {test.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Topic Practice Set</p>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {test._count?.questions || 0} Qs
                  </div>

                  <Link href={`/dashboard/test/${test.id}/subtopics`} className="w-full ml-4">
                    <Button className="w-full bg-gray-900 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-gray-200 group-hover:shadow-blue-200 transition-all font-semibold h-10 text-sm">
                      Start
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
