"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Flag,
  Lock,
  CheckCircle2,
  Star,
  Play,
  GraduationCap,
  Users,
  BarChart3
} from 'lucide-react';
import Image from 'next/image';
import { COMPANY_TYPES, INTERVIEW_TYPES } from '@/lib/interview-constants';

export default function InterviewSuitePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Define steps
  const steps = [
    {
      id: "tcs_interviews",
      title: "TCS Technical & HR",
      description: "Comprehensive mock interviews tailored for TCS Digital and Ninja profiles.",
      status: "active",
      icon: GraduationCap,
      action: () => router.push(`/dashboard/interview-suite/start?company=${COMPANY_TYPES.TCS}&type=${INTERVIEW_TYPES.TECHNICAL}`)
    },
    {
      id: "wipro_interviews",
      title: "Wipro Business Rounds",
      description: "Scenario-based business discussions and managerial rounds for Wipro Elite.",
      status: "locked",
      icon: Users,
      action: () => router.push(`/dashboard/interview-suite/start?company=${COMPANY_TYPES.WIPRO}&type=${INTERVIEW_TYPES.MANAGERIAL}`)
    },
    {
      id: "analytics",
      title: "Performance Analytics",
      description: "Deep dive into your communication skills, confidence, and technical accuracy.",
      status: "locked",
      icon: BarChart3,
      action: () => router.push('/dashboard/interview-suite/analytics')
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans">

      {/* Header Greeting */}
      <div className="mb-12 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Hi Candidate, <span className="text-slate-500 font-normal">Ace Your Interviews</span>
        </h1>
        <p className="text-slate-500 text-lg">
          Practice with our AI-powered interviewers to build confidence.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 relative">

        {/* Visual Roadmap Section */}
        <div className="flex-1 max-w-2xl relative z-10">

          {/* Vertical Line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-300 -z-10" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-8 group"
              >
                {/* Node Icon */}
                <div className="relative shrink-0">
                  {step.status === 'active' ? (
                    <div className="w-12 h-12 rounded-full bg-yellow-400 border-4 border-[#F9FAFB] shadow-xl flex items-center justify-center z-20 relative">
                      <Flag className="w-6 h-6 text-slate-900 fill-slate-900" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 border-4 border-[#F9FAFB] flex items-center justify-center z-20 relative font-bold text-slate-500">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <div className="flex-1">
                  {step.status === 'active' ? (
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden group-hover:transform group-hover:scale-[1.02] transition-all duration-300">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        {step.title}
                        <Badge className="bg-yellow-400 text-slate-900 hover:bg-yellow-500">Suggested</Badge>
                      </h3>
                      <p className="text-slate-300 mb-6 max-w-sm leading-relaxed">
                        {step.description}
                      </p>

                      <Button
                        onClick={step.action}
                        className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 h-12 rounded-xl shadow-[0_4px_0_0_rgba(180,83,9,0.5)] active:shadow-none active:translate-y-1 transition-all"
                      >
                        <Play className="w-4 h-4 mr-2 fill-slate-900" />
                        Start Simulation
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={step.action}
                      className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between group-hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-slate-700">{step.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Illustration Section (Right Side) */}
        <div className="hidden lg:block flex-1 relative pt-20">
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {/* Abstract Background Circles */}
            <div className="absolute top-0 right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -left-4 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* Circle Behind Character */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-100 rounded-full opacity-100 shadow-2xl overflow-hidden border-4 border-white">
              <div className="absolute inset-0 bg-blue-100 mix-blend-overlay"></div>
            </div>

            {/* Character Image */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Image
                src="https://th.bing.com/th/id/R.981df2e9085598d99c9923d45089784e?rik=eKXIm9%2bGRdt4gw&pid=ImgRaw&r=0"
                alt="Interviewer Illustration"
                width={320}
                height={320}
                className="drop-shadow-2xl hover:scale-105 transition-transform rounded-full duration-500"
              />
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute top-24 -right-8 bg-white p-4 rounded-xl shadow-xl z-20 w-48"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-xs font-bold text-slate-700">
                  AI Analysis<br />Complete
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[92%]"></div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
              className="absolute bottom-20 -left-8 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3 z-20"
            >
              <div className="bg-orange-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-xs font-bold text-slate-700">
                Confidence<br />Boosted
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}