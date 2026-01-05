'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Loader2, FileText, Code, Mic, MessageSquare, Award, LucideIcon } from "lucide-react";

interface Test {
  id: string;
  title: string;
  company?: string;
  duration: number;
  _count: {
    questions: number;
  };
}

interface PlacementTest {
  id: string;
  company: string;
  title: string;
  description: string;
  icon: LucideIcon;
  duration: string;
  questions: number;
  route: string;
  color: string;
}

export default function CompaniesPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch company-specific tests
    fetch('/api/tests?type=company')
      .then(res => res.json())
      .then(data => {
        if (data.tests) {
          setTests(data.tests);
        }
      })
      .catch(err => console.error('Failed to fetch company tests:', err))
      .finally(() => setLoading(false));
  }, []);

  // Placement Tests - Direct Access
  const placementTests: PlacementTest[] = [
    // TCS Tests
    {
      id: 'tcs-foundation',
      company: 'TCS',
      title: 'TCS Foundation Test',
      description: 'Numerical, Verbal & Reasoning Ability',
      icon: FileText,
      duration: '90 min',
      questions: 65,
      route: '/dashboard/placement-test/tcs-foundation',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 'tcs-advanced',
      company: 'TCS',
      title: 'TCS Advanced Test',
      description: 'Quantitative & Logical Reasoning',
      icon: Award,
      duration: '45 min',
      questions: 15,
      route: '/dashboard/placement-test/tcs-advanced',
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'tcs-coding',
      company: 'TCS',
      title: 'TCS Coding Test',
      description: 'Programming & Problem Solving',
      icon: Code,
      duration: '90 min',
      questions: 3,
      route: '/dashboard/placement-test/tcs-coding',
      color: 'from-green-600 to-emerald-600',
    },
    // Wipro Tests
    {
      id: 'wipro-aptitude',
      company: 'Wipro',
      title: 'Wipro Aptitude Test',
      description: 'Quant, Logical & Verbal Ability',
      icon: FileText,
      duration: '60 min',
      questions: 48,
      route: '/dashboard/placement-test/wipro-aptitude',
      color: 'from-orange-600 to-red-600',
    },
    {
      id: 'wipro-essay',
      company: 'Wipro',
      title: 'Wipro Essay Writing',
      description: 'Written Communication Skills',
      icon: MessageSquare,
      duration: '30 min',
      questions: 1,
      route: '/dashboard/placement-test/wipro-essay',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'wipro-coding',
      company: 'Wipro',
      title: 'Wipro Coding Test',
      description: 'Programming Challenges',
      icon: Code,
      duration: '60 min',
      questions: 2,
      route: '/dashboard/placement-test/wipro-coding',
      color: 'from-teal-600 to-cyan-600',
    },
    {
      id: 'wipro-voice',
      company: 'Wipro',
      title: 'Wipro Voice Assessment',
      description: 'Communication & Fluency',
      icon: Mic,
      duration: '2 min',
      questions: 1,
      route: '/dashboard/placement-test/wipro-voice',
      color: 'from-pink-600 to-rose-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Specific Tests</h1>
        <p className="text-muted-foreground mt-2">
          Practice with company-specific placement tests and assessments
        </p>
      </div>

      {/* Placement Tests Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Placement Assessment Tests</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Take individual placement tests directly. Practice for TCS and Wipro recruitment drives.
        </p>

        {/* TCS Tests */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            TCS Tests
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {placementTests.filter(t => t.company === 'TCS').map((test) => {
              const Icon = test.icon;
              return (
                <Card key={test.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${test.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="text-sm font-semibold">{test.duration}</div>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{test.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {test.questions} {test.questions === 1 ? 'Question' : 'Questions'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${test.color} text-white`}>
                        {test.company}
                      </span>
                    </div>
                    <Button asChild className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90`}>
                      <Link href={test.route}>
                        Start Test
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Wipro Tests */}
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Wipro Tests
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {placementTests.filter(t => t.company === 'Wipro').map((test) => {
              const Icon = test.icon;
              return (
                <Card key={test.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${test.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="text-sm font-semibold">{test.duration}</div>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{test.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {test.questions} {test.questions === 1 ? 'Question' : 'Questions'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${test.color} text-white`}>
                        {test.company}
                      </span>
                    </div>
                    <Button asChild className={`w-full bg-gradient-to-r ${test.color} hover:opacity-90`}>
                      <Link href={test.route}>
                        Start Test
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Created Company Tests */}
      {tests.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Additional Company Tests</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Custom company tests created by administrators
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{test.company || test.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{test.title}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                    <span>Duration: {test.duration} mins</span>
                    <span>{test._count?.questions || 0} Questions</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/test/${test.id}`}>
                      Start Test
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">About Placement Tests</h3>
              <p className="text-sm text-muted-foreground mb-2">
                These tests simulate actual company placement assessments. Practice as many times as you want to improve your skills.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each test has a time limit - manage your time wisely</li>
                <li>• You can take tests multiple times to improve</li>
                <li>• Results are saved and can be reviewed anytime</li>
                <li>• For full placement simulation, visit the Placements section</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
