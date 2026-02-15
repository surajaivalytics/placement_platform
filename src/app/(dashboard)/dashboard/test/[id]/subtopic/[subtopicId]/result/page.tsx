'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, List, Trophy, Target, Zap, TrendingUp, Award, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SubtopicResultContent({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testId, setTestId] = useState<string>('');
  const [subtopicId, setSubtopicId] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseFloat(searchParams.get('percentage') || '0');

  useEffect(() => {
    params.then(({ id, subtopicId: subId }) => {
      setTestId(id);
      setSubtopicId(subId);
    });
  }, [params]);

  useEffect(() => {
    if (percentage >= 60) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [percentage]);

  const isPassed = percentage >= 60;
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;

  const getPerformanceData = (percentage: number) => {
    if (percentage >= 90) return { 
      grade: 'A+', 
      title: 'Outstanding Performance', 
      subtitle: 'Exceptional Mastery',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      icon: Trophy,
      message: 'You\'ve demonstrated exceptional understanding of this topic!'
    };
    if (percentage >= 80) return { 
      grade: 'A', 
      title: 'Excellent Work', 
      subtitle: 'Strong Understanding',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      icon: Award,
      message: 'Great job! You have a solid grasp of the material.'
    };
    if (percentage >= 70) return { 
      grade: 'B', 
      title: 'Good Performance', 
      subtitle: 'Competent Knowledge',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      icon: Target,
      message: 'Well done! You\'re on the right track.'
    };
    if (percentage >= 60) return { 
      grade: 'C', 
      title: 'Passed', 
      subtitle: 'Basic Understanding',
      color: 'from-yellow-500 to-amber-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      icon: Star,
      message: 'You passed! Keep practicing to improve further.'
    };
    return { 
      grade: 'F', 
      title: 'Needs Improvement', 
      subtitle: 'Review Required',
      color: 'from-orange-500 to-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      icon: XCircle,
      message: 'Don\'t worry! Review the material and try again.'
    };
  };

  const performance = getPerformanceData(percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-[#f8fcfb] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Confetti Effect for Success */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  top: '50%', 
                  left: '50%',
                  opacity: 1,
                  scale: 0
                }}
                animate={{ 
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0,
                  scale: 1,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.02,
                  ease: "easeOut"
                }}
                className={`absolute w-3 h-3 ${i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl"
        >
          {/* Main Result Card */}
          <div className="bg-white rounded-none shadow-lg overflow-hidden border border-gray-100">
            
            {/* Hero Section */}
            <div className={`relative bg-gradient-to-r ${performance.color} p-12 text-white overflow-hidden`}>
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] transform translate-x-1/3 -translate-y-1/3" />
              </div>

              <div className="relative z-10">
                {/* Icon with Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-none flex items-center justify-center border-4 border-white/30 shadow-xl">
                      <PerformanceIcon className="w-12 h-12" strokeWidth={2.5} />
                    </div>
                    {isExcellent && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center"
                      >
                        <Star className="w-4 h-4 text-white fill-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-2"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                    {performance.subtitle}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                    {performance.title}
                  </h1>
                  <p className="text-base opacity-90 max-w-2xl mx-auto leading-relaxed">
                    {performance.message}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-8">
              {/* Score Display - Large Circular */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-10"
              >
                <div className="relative">
                  {/* Circular Progress */}
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-100"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className={performance.textColor}
                      initial={{ strokeDasharray: "0 1000" }}
                      animate={{ strokeDasharray: `${percentage * 5.53} 1000` }}
                      transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                    />
                  </svg>
                  
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="text-center"
                    >
                      <div className={`text-5xl font-bold ${performance.textColor} mb-1`}>
                        {Math.round(percentage)}%
                      </div>
                      <div className={`text-3xl font-bold ${performance.textColor} opacity-50`}>
                        {performance.grade}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              >
                {/* Correct Answers */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-none transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative p-5 border-l-4 border-green-500 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <TrendingUp className="w-4 h-4 text-green-500/30" />
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-1">{score}</div>
                    <div className="text-caption text-gray-500 font-bold uppercase tracking-wider">Correct Answers</div>
                  </div>
                </div>

                {/* Total Questions */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-none transform group-hover:scale-105 transition-transform duration-300" />
                  <div className="relative p-5 border-l-4 border-blue-500 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <Zap className="w-4 h-4 text-blue-500/30" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{total}</div>
                    <div className="text-caption text-gray-500 font-bold uppercase tracking-wider">Total Questions</div>
                  </div>
                </div>

                {/* Accuracy */}
                <div className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${performance.color} opacity-10 rounded-none transform group-hover:scale-105 transition-transform duration-300`} />
                  <div className={`relative p-5 border-l-4 ${performance.borderColor} bg-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <PerformanceIcon className={`w-5 h-5 ${performance.textColor}`} />
                      <Star className={`w-4 h-4 ${performance.textColor} opacity-30`} />
                    </div>
                    <div className={`text-3xl font-bold ${performance.textColor} mb-1`}>{Math.round(percentage)}%</div>
                    <div className="text-caption text-gray-500 font-bold uppercase tracking-wider">Accuracy Rate</div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mb-8"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-caption text-gray-500 font-bold uppercase tracking-wider">Performance</span>
                  <span className={`text-base font-bold ${performance.textColor}`}>{Math.round(percentage)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-none overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${performance.color} relative overflow-hidden`}
                  >
                    <motion.div
                      animate={{ x: ["0%", "100%"] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Button
                  onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
                  variant="outline"
                  className="h-11 rounded-none border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/30 hover:text-primary text-gray-900 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2"
                >
                  <List className="w-4 h-4" />
                  All Subtopics
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${subtopicId}`)}
                  variant="outline"
                  className="h-11 rounded-none border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-blue-600 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Test
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/topics')}
                  className="h-11 rounded-none bg-gray-900 hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border-b-2 border-primary flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Topics
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 text-center"
          >
            <p className="text-base text-gray-500 italic">
              {isPassed 
                ? "\"Success is the sum of small efforts repeated day in and day out.\"" 
                : "\"The expert in anything was once a beginner. Keep learning!\""}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SubtopicResultPage({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base text-gray-500 font-bold">Loading your results...</p>
        </div>
      </div>
    }>
      <SubtopicResultContent params={params} />
    </Suspense>
  );
}
