'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Clock,
  CheckCircle2,
  FileText,
  Code2,
  PlayCircle,
  AlertCircle
} from 'lucide-react';

// ---------------- MOCK DATA ----------------
const MOCK_TCS_TESTS = [
  {
    id: 'tcs-foundation',
    title: 'Foundation Assessment',
    description: 'Numerical, Verbal & Reasoning Ability',
    questions: 65,
    duration: 90,
    company: 'TCS',
    type: 'company'
  },
  {
    id: 'tcs-advanced',
    title: 'Advanced Aptitude Test',
    description: 'Quantitative & Logical Reasoning',
    questions: 15,
    duration: 45,
    company: 'TCS',
    type: 'company'
  },
  {
    id: 'tcs-coding',
    title: 'Coding Challenge',
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
    title: 'Aptitude Assessment',
    description: 'Quant, Logical & Verbal Ability',
    questions: 50,
    duration: 60,
    company: 'Wipro',
    type: 'company'
  },
  {
    id: 'wipro-essay',
    title: 'Written Communication Test',
    description: 'Essay & Written Skills',
    questions: 1,
    duration: 30,
    company: 'Wipro',
    type: 'company'
  },
  {
    id: 'wipro-coding',
    title: 'Coding Evaluation',
    description: 'Programming Challenges',
    questions: 2,
    duration: 60,
    company: 'Wipro',
    type: 'company'
  }
];

// ---------------- HELPERS ----------------
const getDifficulty = (title: string) => {
  if (title.toLowerCase().includes('foundation')) return 'Easy';
  if (title.toLowerCase().includes('advanced')) return 'Medium';
  if (title.toLowerCase().includes('coding')) return 'Hard';
  return 'Medium';
};

const difficultyColor = (level: string) => {
  if (level === 'Easy') return 'border-green-300 text-green-600';
  if (level === 'Hard') return 'border-red-300 text-red-600';
  return 'border-yellow-300 text-yellow-600';
};

// ---------------- PAGE ----------------
export default function CompanyTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/tests?type=company');
        const data = await res.json();
        if (data.tests?.length) {
          setTests(data.tests);
        } else {
          setTests([...MOCK_TCS_TESTS, ...MOCK_WIPRO_TESTS]);
        }
      } catch {
        setTests([...MOCK_TCS_TESTS, ...MOCK_WIPRO_TESTS]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const tcsTests = tests.filter(t => t.company === 'TCS');
  const wiproTests = tests.filter(t => t.company === 'Wipro');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-14 pb-12"
    >
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Company Specific Tests
        </h1>
        <p className="text-gray-500">
          Practice placement-style assessments with a premium test experience
        </p>
      </div>

      {/* EMPTY STATE */}
      {tests.length === 0 && (
        <div className="text-center py-24">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <p className="text-gray-500">No company tests available right now.</p>
        </div>
      )}

      {/* TCS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Enterprise Assessment Series</h2>
            <p className="text-sm text-gray-500">
              {tcsTests.length} Tests • Designed for large-scale recruitment
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tcsTests.map(test => {
            const level = getDifficulty(test.title);
            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-gray-100
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      {test.title.includes('Coding')
                        ? <Code2 className="text-blue-600" />
                        : <FileText className="text-blue-600" />}
                    </div>
                    <Badge variant="outline" className={difficultyColor(level)}>
                      {level}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {test.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {test.duration} min • {test.questions} Qs
                    </span>
                    <Link href={`/dashboard/test/${test.id}`}>
                      <Button className="rounded-xl px-5">
                        Start Test
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WIPRO SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Talent Evaluation Track</h2>
            <p className="text-sm text-gray-500">
              {wiproTests.length} Tests • Skill-focused hiring assessments
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wiproTests.map(test => {
            const level = getDifficulty(test.title);
            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl border border-gray-100
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <PlayCircle className="text-purple-600" />
                    </div>
                    <Badge variant="outline" className={difficultyColor(level)}>
                      {level}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-lg mb-1">{test.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {test.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {test.duration} min • {test.questions} Qs
                    </span>
                    <Link href={`/dashboard/test/${test.id}`}>
                      <Button className="rounded-xl px-5 bg-gradient-to-r from-purple-600 to-pink-600">
                        Start Test
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
