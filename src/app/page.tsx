"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Shield, Zap, Target, BookOpen, Clock, TrendingUp, Award, Laptop, Users, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { SiteLoader } from "@/components/landing/site-loader";
import { ScrollAnimation } from "@/components/landing/scroll-animation";
import LifeAtCollage from "@/components/landing/life-at-collage";
import MentorsSection from "@/components/landing/mentors-section";
import SubjectsGrid from "@/components/landing/subjects-grid";
import { WhyChooseUsSlideshow } from "@/components/landing/why-choose-us-slideshow";
import { cn } from "@/lib/utils";
import { BackgroundBeams } from "@/components/landing/background-beams";
import { CompanyTicker } from "@/components/landing/company-ticker";
import { JourneyLine } from "@/components/landing/journey-line";

export default function Home() {
  return (
    <div className="bg-[#020617] min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SiteLoader />
      <Navbar />

      <main className="relative bg-[#020617] min-h-screen overflow-hidden">
        <BackgroundBeams />
        {/* <JourneyLine /> */}

        {/* HERO SECTION (Image 1) */}
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
              {/* Left Content */}
              <div className="w-full lg:w-[600px] space-y-8 text-center lg:text-left">
                <ScrollAnimation>
                  <h1 className="text-5xl lg:text-[3.5rem] font-[900] text-white leading-[1.05] tracking-tight">
                    <span className="text-emerald-600">Aivalytics </span>Aptitude
                    <br />
                    Simplified!!!
                  </h1>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-4 mt-8">
                    {["Aptitude", "Coding", "Interview Prep", "New Age Skills"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-gray-400 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-10">
                    <Link href="/signup">
                      <Button size="lg" className="rounded-2xl px-12 h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95">
                        Sign Up for Free
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center lg:justify-start gap-4 pt-12">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                        </div>
                      ))}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-white leading-none">10 Million+</p>
                      <p className="text-sm text-gray-400 font-medium">Monthly Active Learners</p>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>

              {/* Right Content - Visual Elements */}
              <div className="w-full lg:flex-1 relative">
                <ScrollAnimation delay={0.2} className="relative z-10 flex justify-end">
                  <div className="relative w-[560px] rounded-xl ">
                    <img
                      src="/images/image copy 2.png"
                      alt="Student Success"
                      className="w-[560px] h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-0 -left-6 lg:-left-12 bg-white p-3 lg:p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-3 lg:gap-4 animate-bounce duration-[3000ms]">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl lg:text-2xl">🏆</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Got Placed</p>
                          <span className="bg-emerald-600 text-[8px] lg:text-[10px] text-white px-2 py-0.5 rounded-full font-bold">10 LPA</span>
                        </div>
                        <p className="text-xs lg:text-sm font-bold text-white">Mayur Jain</p>
                      </div>
                    </div>

                    <div className="absolute bottom-12 -right-4 lg:-right-8 bg-white p-3 lg:p-4 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-3 lg:gap-4">
                      <div className="text-right">
                        <p className="text-lg lg:text-xl font-black text-white">4.5</p>
                        <p className="text-[8px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Google Reviews</p>
                      </div>
                      <div className="flex text-amber-400">
                        <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* COMPANY TICKER (New) */}
        <CompanyTicker />

        {/* PREMIUM LEARNING SECTION (Image 2) */}
        <section className="py-12 lg:py-16 relative" id="how-it-works">
          {/* Subtle patterned background */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/grid-pattern.svg')] pointer-events-none" />

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              {/* Left Image Column */}
              <div className="w-full lg:w-1/2 relative bg-white/50 backdrop-blur-sm p-4 rounded-[4rem] border border-white/40 shadow-xl">
                <ScrollAnimation delay={0.1} className="relative">
                  <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-emerald-50/50 shadow-2xl rotate-[-2deg]">
                    <img
                      src="/images/image copy.png"
                      alt="Premium Experience"
                      className="w-full h-auto"
                    />
                  </div>
                  {/* Background Decorative Frame */}
                  <div className="absolute -inset-4 border-2 border-emerald-100 rounded-[3.5rem] -z-10 rotate-[1deg]"></div>
                </ScrollAnimation>
              </div>

              {/* Right Content Column */}
              <div className="w-full lg:w-[600px] space-y-10">
                <ScrollAnimation>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs tracking-widest uppercase">
                    ✨ Premium Learning
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] pt-4">
                    Master Your <span className="text-emerald-500">Career path </span> <br /> with AI
                  </h2>
                  <p className="text-xl text-gray-300 leading-relaxed font-medium">
                    Unlock your potential with our AI-driven placement platform.
                    We provide tailored resources, real-time feedback, and
                    comprehensive analytics to help you crack the toughest interviews.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {[
                      { title: "Personalized Roadmap", icon: <Target className="w-6 h-6 text-emerald-400" /> },
                      { title: "Mock Interviews", icon: <MessageSquare className="w-6 h-6 text-emerald-400" /> },
                      { title: "Real-time Analytics", icon: <TrendingUp className="w-6 h-6 text-emerald-400" /> },
                      { title: "Expert Mentorship", icon: <Users className="w-6 h-6 text-emerald-400" /> },
                    ].map((feat) => (
                      <div key={feat.title} className="flex items-center gap-4 p-5 rounded-3xl bg-[#0f172a]/80 backdrop-blur-md border border-gray-800 shadow-sm hover:shadow-md transition-shadow hover:border-emerald-500/50 group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          {feat.icon}
                        </div>
                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{feat.title}</span>
                      </div>
                    ))}
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </section>

        {/* SUBJECTS GRID (New) */}
        <SubjectsGrid />

        {/* WHY CHOOSE US (Image 3) */}
        <section className="py-12 lg:py-16 relative" id="features">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-transparent -z-10" />

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
              {/* Left Column: Heading + Image */}
              <div className="w-full lg:w-[700px] space-y-8">
                <ScrollAnimation>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs tracking-widest uppercase">
                    ★ Why Choose Us
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] pt-4">
                    Experience the <br />
                    <span className="text-emerald-600">Difference</span>
                  </h2>
                  <p className="text-xl text-gray-300 font-medium max-w-lg mt-6">
                    Join a community of thousands of students achieving their career goals with our advanced, human-centric platform.
                  </p>
                </ScrollAnimation>

                <ScrollAnimation delay={0.2} className="w-full">
                  <WhyChooseUsSlideshow />
                </ScrollAnimation>
              </div>

              {/* Right Column: Grid */}
              <div className="w-full lg:w-1/2 pt-12 lg:pt-32">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    {
                      title: "AI Analysis Engine",
                      desc: "Real-time performance tracking and personalized roadmaps.",
                      icon: <Shield className="w-8 h-8 text-emerald-600" />
                    },
                    {
                      title: "Company Patterns",
                      desc: "Exact test patterns for top MNCs like TCS & Infosys.",
                      icon: <Zap className="w-8 h-8 text-emerald-600" />
                    },
                    {
                      title: "Smart Feedback",
                      desc: "Instant, actionable insights on your weak areas.",
                      icon: <Star className="w-8 h-8 text-emerald-600" />
                    },
                    {
                      title: "Real-Time Sims",
                      desc: "Experience the actual pressure of exam environments.",
                      icon: <Target className="w-8 h-8 text-emerald-600" />
                    },
                  ].map((item, idx) => (
                    <ScrollAnimation key={idx} delay={idx * 0.1}>
                      <div className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:border-emerald-500/30 transition-all h-full shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 group">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-sm border border-white/10 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                          {item.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                        <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </ScrollAnimation>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MENTORS SECTION (New) */}
        <MentorsSection />

        {/* CTA BANNER (Image 4) */}
        <section className="py-16 mt-28 container mx-auto px-4 relative z-10">
          <ScrollAnimation>
            <div className="bg-emerald-600 rounded-[3.5rem] p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-48 bg-emerald-500/30 rounded-full blur-[80px] -mr-32 -mt-32"></div>

              {/* Decorative circle */}
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-700/30 rounded-full mix-blend-multiply filter blur-3xl -ml-20 -mb-20"></div>

              <div className="relative z-10 w-full lg:w-3/5 space-y-10 text-center lg:text-left">
                <h2 className="text-5xl lg:text-6xl font-extrabold leading-[1.1]">
                  Start Your Success <br />
                  Story Today
                </h2>
                <p className="text-xl lg:text-2xl text-emerald-100 font-medium max-w-lg mx-auto lg:mx-0">
                  Join thousands of students who have cracked their dream companies with Aivalytics.
                </p>
                <div>
                  <Link href="/signup">
                    <Button size="lg" className="rounded-2xl px-12 h-16 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xl shadow-2xl shadow-black/10 transition-all hover:scale-105 active:scale-95">
                      Get Started Now
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-2/5 mt-16 lg:-mt-10 relative flex justify-center ">
                <img
                  src="/images/image.png"
                  alt="Success Image"
                  className="relative h-[400px] lg:h-[400px] w-auto object-contain z-10 scale-[1.6] translate-y-12 drop-shadow-2xl"
                />
              </div>
            </div>
          </ScrollAnimation>
        </section>

        {/* LIFE AT AIVALYTICS (Image 1 - Collage) */}
        <LifeAtCollage />
      </main>

      {/* FOOTER (Image 5) */}
      <footer className="bg-[#020617] text-white py-24 relative overflow-hidden">
        {/* Background Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <Laptop className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black tracking-tight text-white">Aivalytics</span>
              </Link>
              <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
                Empowering your career with AI-driven aptitude preparation, real-time analytics, and personalized mentorship.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <div key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer group">
                    <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xl font-bold text-white mb-8">Navigation</h5>
              <ul className="space-y-4">
                {['Home', 'Products', 'Features', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 scale-0 group-hover:scale-100 transition-transform" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xl font-bold text-white mb-8">Legal</h5>
              <ul className="space-y-4">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 font-medium hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 scale-0 group-hover:scale-100 transition-transform" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h5 className="text-xl font-bold text-white mb-8">Newsletter</h5>
              <p className="text-gray-400 font-medium">Subscribe to get the latest updates and job alerts.</p>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 font-medium text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-gray-400 font-medium text-sm">
              © {new Date().getFullYear()} Aivalytics. Designed with passion for students.
            </p>
            <div className="flex gap-8 text-sm font-bold text-gray-400">
              <Link href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Support</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Help Center</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors uppercase tracking-widest">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
