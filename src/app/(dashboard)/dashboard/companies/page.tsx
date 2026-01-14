'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CheckCircle2, FileText, Code2, AlertCircle, PlayCircle, Lock } from 'lucide-react';
import { PageHeader } from "@/components/dashboard/page-header";

// Mock Data for immediate visualization (if API empty)
const MOCK_TCS_TESTS = [
  {
    id: 'tcs-foundation',
    title: 'TCS Foundation Test',
    description: 'Numerical, Verbal & Reasoning Ability',
    questions: 65,
    duration: 90,
    company: 'TCS',
    type: 'company'
  },
  {
    id: 'tcs-advanced',
    title: 'TCS Advanced Test',
    description: 'Quantitative & Logical Reasoning',
    questions: 15,
    duration: 45,
    company: 'TCS',
    type: 'company'
  },
  {
    id: 'tcs-coding',
    title: 'TCS Coding Test',
    description: 'Programming & Problem Solving',
    questions: 3,
    duration: 90,
    company: 'TCS',
    type: 'company'
  }
];

const MOCK_WIPRO_TESTS = [
  {
    id: 'wipro-aptitude',
    title: 'Wipro Aptitude Test',
    description: 'Quant, Logical & Verbal Ability',
    questions: 50,
    duration: 60,
    company: 'Wipro',
    type: 'company'
  },
  {
    id: 'wipro-essay',
    title: 'Wipro Essay Writing',
    description: 'Written Communication Skills',
    questions: 1,
    duration: 30,
    company: 'Wipro',
    type: 'company'
  },
  {
    id: 'wipro-coding',
    title: 'Wipro Coding Test',
    description: 'Programming Challenges',
    questions: 2,
    duration: 60,
    company: 'Wipro',
    type: 'company'
  }
];

export default function CompanyTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We try to fetch real data, if empty we use mock to ensure UI shows up
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/tests?type=company');
        const data = await res.json();
        if (data.tests && data.tests.length > 0) {
          setTests(data.tests);
        } else {
          // Fallback to mock data for demonstration
          setTests([...MOCK_TCS_TESTS, ...MOCK_WIPRO_TESTS]);
        }
      } catch (error) {
        console.error("Failed to fetch tests", error);
        setTests([...MOCK_TCS_TESTS, ...MOCK_WIPRO_TESTS]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tcsTests = tests.filter(t => t.company === 'TCS' || t.title.includes('TCS'));
  const wiproTests = tests.filter(t => t.company === 'Wipro' || t.title.includes('Wipro'));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-12"
    >

      {/* Page Items */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Company Specific Tests</h1>
        <p className="text-gray-500">Practice with company-specific placement tests and assessments</p>
      </div>

      {/* Banner Info */}
      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
        <div className="p-3 bg-emerald-100 rounded-xl">
          <Badge className="bg-emerald-600 hover:bg-emerald-700 h-6 w-6 rounded-full p-0 flex items-center justify-center">i</Badge>
        </div>
        <div>
          <h3 className="font-bold text-emerald-900 mb-1">About Placement Tests</h3>
          <p className="text-sm text-emerald-700 mb-4">These tests simulate actual company placement assessments. Practice as many times as you want to improve your skills.</p>
          <div className="flex gap-6 text-sm text-emerald-600 font-medium">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Timed tests to simulate pressure</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Comprehensive result analysis</span>
          </div>
        </div>
      </div>

      {/* TCS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-l-4 border-[#0067b1] pl-4">
          <div className="w-12 h-12 relative overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm">
            <img src="/logos/tcs-1696999494.jpg" alt="TCS Logo" className="object-contain p-1 w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">TCS Recruitment Drive</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tcsTests.map((test) => (
            <div key={test.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0067b1] to-[#e43d8d]" />

                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-24 relative">
                    <img src="/logos/tcs-1696999494.jpg" alt="TCS" className="object-contain w-full h-full object-left" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <Clock className="w-3 h-3" /> {test.duration} min
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-[#0067b1] transition-colors">{test.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{test.description || 'Simulate the actual TCS exam environment with official pattern questions.'}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      {test.title.includes('Coding') ? <Code2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    {test.questions || test._count?.questions} Qs
                  </div>
                  <Link href={`/dashboard/test/${test.id}`}>
                    <Button className="bg-[#0067b1] hover:bg-[#004d80] text-white rounded-xl shadow-lg shadow-blue-900/10 px-6 h-10">
                      Start Test
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WIPRO SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-l-4 border-[#E63312] pl-4">
          <div className="w-12 h-12 relative overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm">
            <img src="/logos/Wipro_Secondary-Logo_Color_RGB.png" alt="Wipro Logo" className="object-contain p-1 w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Wipro NTH Drive</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wiproTests.map((test) => (
            <div key={test.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-24 relative">
                    <img src="/logos/Wipro_Secondary-Logo_Color_RGB.png" alt="Wipro" className="object-contain w-full h-full object-left" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    <Clock className="w-3 h-3" /> {test.duration} min
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 group-hover:text-purple-600 transition-colors">{test.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{test.description || 'Specialized test for Wipro National Talent Hunt.'}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      {test.title.includes('Coding') ? <Code2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </div>
                    {test.questions || test._count?.questions} Qs
                  </div>
                  <Link href={`/dashboard/test/${test.id}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/10 px-6 h-10">
                      Start Test
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
