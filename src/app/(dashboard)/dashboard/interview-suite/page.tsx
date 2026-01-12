'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  GraduationCap, 
  Users, 
  FileText, 
  Clock, 
  Play,
  History,
  BarChart3
} from 'lucide-react';
import { 
  INTERVIEW_CATEGORIES, 
  INTERVIEW_CONFIG, 
  COMPANY_TYPES, 
  INTERVIEW_TYPES 
} from '@/lib/interview-constants';

export default function InterviewSuitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = (company: keyof typeof COMPANY_TYPES, type: keyof typeof INTERVIEW_TYPES) => {
    setIsLoading(true);
    // Navigate to the interview page with company and type parameters
    router.push(`/dashboard/interview-suite/start?company=${company}&type=${type}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Interview Suite</h1>
        <p className="text-gray-600 mt-2">
          Practice for real interviews with our AI-powered virtual interviewers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TCS Interview Options */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">TCS Interviews</CardTitle>
                <p className="text-sm text-gray-600">Tata Consultancy Services</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(INTERVIEW_CATEGORIES[COMPANY_TYPES.TCS] || []).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-500">
                      {INTERVIEW_CONFIG[category.type as keyof typeof INTERVIEW_CONFIG]?.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartInterview(COMPANY_TYPES.TCS, category.type as keyof typeof INTERVIEW_TYPES)}
                    disabled={isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wipro Interview Options */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Wipro Business Discussion</CardTitle>
                <p className="text-sm text-gray-600">Wipro Limited</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(INTERVIEW_CATEGORIES[COMPANY_TYPES.WIPRO] || []).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-500">
                      {INTERVIEW_CONFIG[category.type as keyof typeof INTERVIEW_CONFIG]?.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartInterview(COMPANY_TYPES.WIPRO, category.type as keyof typeof INTERVIEW_TYPES)}
                    disabled={isLoading}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 rounded-full mb-4">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Interview History</h3>
            <p className="text-sm text-gray-600 mb-4">View your past interview sessions and performance</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/interview-suite/history')}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              View History
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 rounded-full mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Detailed analysis of your interview performance</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/interview-suite/analytics')}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="p-3 bg-purple-100 rounded-full mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Preparation Guide</h3>
            <p className="text-sm text-gray-600 mb-4">Tips and resources to prepare for interviews</p>
            <Button 
              variant="outline" 
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              View Guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}