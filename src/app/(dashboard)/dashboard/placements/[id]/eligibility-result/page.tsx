'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, XCircle, ArrowRight, ArrowLeft, 
  Trophy, Sparkles, BrainCircuit, ChevronRight, ListChecks
} from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { motion } from "framer-motion";

interface Application {
  id: string;
  company: string;
  status: string;
  eligibilityStatus: string | null;
  eligibilityCheck: {
    isEligible: boolean;
    rejectionReasons: string | null;
  } | null;
}

export default function EligibilityResultPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/placements/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      } else {
        alert("Application not found");
        router.push("/dashboard/placements");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!application) return;

    // Redirect to next stage based on company
    if (application.company === "TCS") {
      router.push(`/dashboard/placements/${applicationId}/foundation`);
    } else {
      router.push(`/dashboard/placements/${applicationId}/aptitude`);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <Spinner size={64} />
      <p className="mt-4 text-slate-400 font-medium tracking-wide italic">Verifying your eligibility...</p>
    </div>
  );

  if (!application || !application.eligibilityCheck) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Eligibility Data Missing</h2>
        <p className="text-slate-500">Please complete the eligibility form first.</p>
        <Button onClick={() => router.push(`/dashboard/placements/${applicationId}/eligibility`)}>
          Go to Eligibility Form
        </Button>
      </div>
    );
  }

  const isEligible = application.eligibilityCheck.isEligible;

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-20">
      {/* Dynamic Header Background */}
      <div className="h-64 w-full bg-slate-900 absolute top-0 left-0 z-0 rounded-b-[3rem]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 pt-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push(`/dashboard/placements/${applicationId}`)} 
            className="flex items-center text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Application Status</span>
          </button>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <ListChecks className="w-6 h-6 text-indigo-400" />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-white mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl font-black tracking-tight"
          >
            Eligibility Result
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">
            {application.company} Placement Drive
          </p>
        </section>

        {/* Main Result Card */}
        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-0 shadow-2xl shadow-indigo-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative flex items-center justify-center w-40 h-40">
                  {isEligible ? (
                    <div className="w-full h-full bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                      <CheckCircle2 className="w-20 h-20 text-indigo-600" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-rose-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                      <XCircle className="w-20 h-20 text-rose-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <Badge className={`border-none px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      isEligible ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isEligible ? 'Verified Eligible' : 'Criteria Not Met'}
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">
                    {isEligible ? 'Congratulations!' : 'Heads Up'}
                  </h2>
                  <p className="text-slate-500 font-medium max-w-md">
                    {isEligible 
                      ? "You meet all the eligibility requirements for this drive. You can now proceed to the assessment phase." 
                      : "Unfortunately, your application does not meet the specified criteria at this stage."}
                  </p>
                </div>
              </div>

              {/* Seamless Info Section */}
              <div className="bg-slate-50 p-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black uppercase tracking-tighter text-slate-700">Detailed Insights</h3>
                </div>
                
                {isEligible ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-3">
                      <p className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-1">
                        <Sparkles size={10} /> Your Preparation
                      </p>
                      <p className="text-sm text-slate-700 font-bold">Foundation Test Schedule</p>
                      <ul className="text-xs text-slate-500 space-y-1">
                        <li>• Numerical & Verbal Ability</li>
                        <li>• Reasoning Proficiency</li>
                        <li>• Timed Assessments</li>
                      </ul>
                    </div>
                    <div className="p-5 bg-white rounded-3xl border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">Requirement Status</p>
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Accurate Profile Data
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-500" /> Academic Percentile
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-3xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-3">Rejection Reasons</p>
                    <div className="space-y-3">
                      {application.eligibilityCheck.rejectionReasons?.split("; ").map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="p-1 bg-rose-50 rounded-full mt-0.5"><XCircle size={10} className="text-rose-500" /></div>
                          <p className="text-sm text-slate-700 font-medium">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Primary Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isEligible ? (
              <Button 
                onClick={handleContinue} 
                className="h-16 px-12 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-200 group"
              >
                Proceed to Test
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={() => router.push("/dashboard/placements")}
                variant="outline"
                className="h-16 px-12 rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Back to Placements
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
