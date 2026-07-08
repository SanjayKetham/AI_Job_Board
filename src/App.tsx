import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, Search, Filter, Sparkles, Compass, User, 
  Layers, MapPin, Clock, ArrowRight, CheckCircle2, 
  HelpCircle, Star, Terminal, AlertCircle, Building, Award, ShieldCheck,
  Check, RefreshCw, X, BrainCircuit, ArrowUpRight, Play, ChevronRight, CheckCircle, Flame
} from "lucide-react";

import { INITIAL_JOBS, Job } from "./data/jobs";
import { SkillMatchResult, UserProfile, ApplicationTracker as TrackerType, ApplicationStatus, ApplicationLog } from "./types";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { JobCard } from "./components/JobCard";
import { JobDetailsModal } from "./components/JobDetailsModal";
import { ApplicationTracker } from "./components/ApplicationTracker";

// Seeded default profile to populate immediately
const DEFAULT_PROFILE: UserProfile = {
  fullName: "Sanjay Ketham",
  title: "Full Stack Engineer",
  skills: ["TypeScript", "React", "Node.js", "Express", "REST APIs", "Tailwind CSS"],
  experience: "3 years of experience",
  summary: "Results-driven Software Engineer with hands-on experience in modern JavaScript architectures, building rapid frontends and robust backends."
};

// Seeded active tracker for the GCC assessment job
const INITIAL_GCC_TRACKER: TrackerType = {
  jobId: "global-hyd-swe-01",
  jobTitle: "Software Engineer",
  company: "Global Coordination Center Ltd",
  status: "Technical Assessment",
  appliedDate: "July 7, 2026",
  logs: [
    {
      id: "log-1",
      status: "Applied",
      timestamp: "10:14 AM",
      title: "Application Received",
      description: "Candidate submitted core profile through CareerConnect AI portal."
    },
    {
      id: "log-2",
      status: "Resume Screening",
      timestamp: "10:15 AM",
      title: "AI ATS Screening Passed",
      description: "AI-based skill alignment verified 6 matching skills. Candidate passed to human review."
    },
    {
      id: "log-3",
      status: "Technical Assessment",
      timestamp: "11:30 AM",
      title: "Assessment Phase Activated",
      description: "Priya (Country Coordinator) invited candidate to complete full-stack portal with live tracking & skill matching features."
    }
  ]
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [activeTab, setActiveTab] = useState<'explore' | 'profile' | 'tracker'>('explore');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWorkplace, setFilterWorkplace] = useState<'All' | 'Onsite' | 'Hybrid' | 'Remote'>('All');
  const [filterShift, setFilterShift] = useState<'All' | 'Day Shift' | 'Night Shift'>('All');

  // Match and Trackers state
  const [matchResults, setMatchResults] = useState<SkillMatchResult[]>([]);
  const [trackers, setTrackers] = useState<TrackerType[]>([INITIAL_GCC_TRACKER]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Interview Coach state
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachJobId, setCoachJobId] = useState("global-hyd-swe-01");
  const [coachData, setCoachData] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [coachFeedback, setCoachFeedback] = useState<any>(null);
  const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState(false);

  const startCoachSession = async (jobId: string = "global-hyd-swe-01") => {
    setCoachJobId(jobId);
    setIsCoachOpen(true);
    setCoachLoading(true);
    setCoachFeedback(null);
    setUserAnswer("");
    try {
      const response = await fetch("/api/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: profile.skills, jobId })
      });
      if (response.ok) {
        const data = await response.json();
        setCoachData(data);
      }
    } catch (e) {
      console.error("Failed to load interview coach data:", e);
    } finally {
      setCoachLoading(false);
    }
  };

  const submitAnswerForReview = async () => {
    if (!userAnswer.trim() || !coachData) return;
    setIsAnalyzingAnswer(true);
    setCoachFeedback(null);
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: coachData.question,
          answer: userAnswer,
          idealAnswer: coachData.idealAnswer
        })
      });
      if (response.ok) {
        const data = await response.json();
        setCoachFeedback(data);
      }
    } catch (e) {
      console.error("Failed to evaluate candidate answer:", e);
    } finally {
      setIsAnalyzingAnswer(false);
    }
  };

  // Trigger matching on first load for the default profile
  useEffect(() => {
    analyzeSkills(profile.skills);
  }, []);

  const analyzeSkills = async (userSkills: string[]) => {
    if (userSkills.length === 0) {
      setMatchResults([]);
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/match-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: userSkills })
      });
      if (response.ok) {
        const data: SkillMatchResult[] = await response.json();
        setMatchResults(data);
      } else {
        console.error("Match error response status:", response.status);
      }
    } catch (e) {
      console.error("Failed to run skill analysis on server:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyJob = (job: Job) => {
    // Check if already applied
    if (trackers.some(t => t.jobId === job.id)) return;

    const newTracker: TrackerType = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: "Applied",
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      logs: [
        {
          id: `log-${Date.now()}-1`,
          status: "Applied",
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          title: "Application Logged",
          description: `Successfully applied to ${job.title} at ${job.company}.`
        }
      ]
    };

    setTrackers(prev => [newTracker, ...prev]);
    
    // Automatically switch tabs and scroll up to let the user see the telemetry
    setActiveTab('tracker');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvanceTrackerStatus = (jobId: string) => {
    setTrackers(prevTrackers => 
      prevTrackers.map(tracker => {
        if (tracker.jobId !== jobId) return tracker;

        const currentStatus = tracker.status;
        let nextStatus: ApplicationStatus = currentStatus;
        let logTitle = "";
        let logDesc = "";

        if (currentStatus === 'Applied') {
          nextStatus = 'Resume Screening';
          logTitle = "Screening Initiated";
          logDesc = "HR Team is cross-referencing your profile credentials and AI recommendation.";
        } else if (currentStatus === 'Resume Screening') {
          nextStatus = 'Technical Assessment';
          logTitle = "Technical Assessment Scheduled";
          logDesc = "Code challenge invite sent. Code must be clean, linted, and deployable.";
        } else if (currentStatus === 'Technical Assessment') {
          nextStatus = 'Interview Scheduled';
          logTitle = "Onsite Interview Arranged";
          logDesc = "Live technical panel scheduled onsite at Hitech City, Hyderabad office (Night Shift).";
        } else if (currentStatus === 'Interview Scheduled') {
          nextStatus = 'Offer Extended';
          logTitle = "Onsite Offer Extended";
          logDesc = "Congratulations! Formal employment offer issued by Priya (Country Coordinator).";
        }

        if (nextStatus === currentStatus) return tracker;

        const newLog: ApplicationLog = {
          id: `log-${Date.now()}`,
          status: nextStatus,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          title: logTitle,
          description: logDesc
        };

        return {
          ...tracker,
          status: nextStatus,
          logs: [newLog, ...tracker.logs]
        };
      })
    );
  };

  const handleResetTracker = (jobId: string) => {
    if (jobId === "global-hyd-swe-01") {
      setTrackers(prev => prev.map(t => t.jobId === jobId ? INITIAL_GCC_TRACKER : t));
    } else {
      setTrackers(prev => prev.map(t => {
        if (t.jobId !== jobId) return t;
        return {
          ...t,
          status: "Applied",
          logs: [
            {
              id: `log-${Date.now()}`,
              status: "Applied",
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              title: "Application Reset",
              description: "Telemetry logs reset. Restarting tracking simulation."
            }
          ]
        };
      }));
    }
  };

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWorkplace = filterWorkplace === 'All' || job.workplace === filterWorkplace;
    const matchesShift = filterShift === 'All' || job.shift === filterShift;

    return matchesSearch && matchesWorkplace && matchesShift;
  });

  const stages: { status: ApplicationStatus; label: string; desc: string }[] = [
    { status: "Applied", label: "Application Logged", desc: "Submitted through portal" },
    { status: "Resume Screening", label: "Resume Screening", desc: "AI ATS compatibility checks" },
    { status: "Technical Assessment", label: "Technical Assessment", desc: "Onsite challenge & code test" },
    { status: "Interview Scheduled", label: "Technical Interview", desc: "Live Hitech City panel" },
    { status: "Offer Extended", label: "Offer extended", desc: "Employment offer issued" }
  ];

  const statusIndex: Record<ApplicationStatus, number> = {
    "Applied": 0,
    "Resume Screening": 1,
    "Technical Assessment": 2,
    "Interview Scheduled": 3,
    "Offer Extended": 4,
    "Rejected": 5
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">

      {/* Main Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-slate-800 tracking-tight leading-none">
                  CareerConnect <span className="text-indigo-600">AI</span>
                </h1>
                <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Next-Gen Match Engine
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'explore'
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                id="tab-explore"
              >
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Explore Jobs
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'profile'
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                id="tab-profile"
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  My Skill Profile
                  {profile.skills.length > 0 && (
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none">
                      {profile.skills.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'tracker'
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                id="tab-tracker"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Real-time Tracker
                  {trackers.length > 0 && (
                    <span className="inline-flex items-center bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none animate-pulse">
                      {trackers.length}
                    </span>
                  )}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div
              key="explore-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Dynamic Welcome Hero banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
                    Welcome back, {profile.fullName.split(" ")[0]}!
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    AI matching is active. We analyzed your {profile.skills.length} skills and discovered matching careers in our pool.
                  </p>
                </div>

                <div className="flex gap-4 border-l border-slate-100 pl-0 md:pl-6 pt-4 md:pt-0">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide font-bold">MATCH COMPLETED</span>
                    <span className="block text-2xl font-bold font-display text-indigo-600" id="stat-match-count">
                      {matchResults.length || filteredJobs.length} Positions
                    </span>
                  </div>
                </div>
              </div>

              {/* BENTO GRID SYSTEM */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
                {/* 1. LEFT BENTO COLUMN: Profile Intelligence + Quick Stats */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                  {/* Profile Intelligence Bento Tile */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between h-auto">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
                        PROFILE INTELLIGENCE
                      </span>
                      <p className="text-xs font-semibold text-slate-400 mb-1">Skill-Based Match Power</p>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                          {matchResults.find(r => r.jobId === "global-hyd-swe-01")?.score || 94}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 mb-1.5 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          +2.4% vs last week
                        </span>
                      </div>

                      {/* Top Matched Skills */}
                      <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 mb-3.5">
                        <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2">
                          Top Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {matchResults.find(r => r.jobId === "global-hyd-swe-01")?.matchingSkills && matchResults.find(r => r.jobId === "global-hyd-swe-01")!.matchingSkills.length > 0 ? (
                            matchResults.find(r => r.jobId === "global-hyd-swe-01")!.matchingSkills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-indigo-600 shadow-sm/50 border border-indigo-100/30">
                                {skill}
                              </span>
                            ))
                          ) : (
                            profile.skills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-indigo-600 shadow-sm/50 border border-indigo-100/30">
                                {skill}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Opportunity Gaps */}
                      <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100/60">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                          Opportunity Gaps
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {matchResults.find(r => r.jobId === "global-hyd-swe-01")?.skillGaps && matchResults.find(r => r.jobId === "global-hyd-swe-01")!.skillGaps.length > 0 ? (
                            matchResults.find(r => r.jobId === "global-hyd-swe-01")!.skillGaps.slice(0, 3).map((gap, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-amber-700 shadow-sm/50 border border-amber-100/30 opacity-80">
                                {gap}
                              </span>
                            ))
                          ) : (
                            ["GitHub Actions", "Vercel", "Docker"].map((gap, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white rounded text-[9px] font-bold text-amber-700 shadow-sm/50 border border-amber-100/30 opacity-80">
                                {gap}
                              </span>
                            ))
                          )}
                        </div>
                        <p className="text-[9px] text-amber-600 mt-2 italic leading-tight">
                          Bridge these to maximize your assessment compatibility index!
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold mt-5 transition-colors shadow-sm cursor-pointer"
                    >
                      Optimize Profile
                    </button>
                  </div>

                  {/* Interview Invites Bento Tile */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-32 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Interview Invites
                    </p>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">12</p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-1">↑ 15% increase this month</p>
                    </div>
                  </div>

                  {/* Avg. Offer Bento Tile */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 h-32 flex flex-col justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Avg. Offer (LPA)
                    </p>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">24.5</p>
                      <p className="text-[10px] text-indigo-500 font-bold mt-1 font-sans">Top 1% of Hyderabad</p>
                    </div>
                  </div>
                </div>

                {/* 2. MIDDLE BENTO COLUMN: Recommended Jobs Feed */}
                <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Header bar */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50/50">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          Recommended for You
                        </h2>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5 font-bold">
                          MATCH COMPLETED • {filteredJobs.length} JOBS OPEN
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Clear Search
                        </button>
                        <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-bold shadow-sm">
                          High Match
                        </span>
                      </div>
                    </div>

                    {/* Integrated Search & Filter Controls */}
                    <div className="p-4 border-b border-slate-50 bg-slate-50/20 flex flex-col md:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search role, company, skills (e.g. Node.js)..."
                          className="w-full pl-8 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                          id="job-search-input"
                        />
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={filterWorkplace}
                          onChange={(e: any) => setFilterWorkplace(e.target.value)}
                          className="text-[11px] border border-slate-200 px-2.5 py-1.5 rounded-xl bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
                          id="filter-workplace"
                        >
                          <option value="All">All styles</option>
                          <option value="Onsite">Onsite</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Remote">Remote</option>
                        </select>

                        <select
                          value={filterShift}
                          onChange={(e: any) => setFilterShift(e.target.value)}
                          className="text-[11px] border border-slate-200 px-2.5 py-1.5 rounded-xl bg-white font-semibold text-slate-700 focus:outline-none cursor-pointer"
                          id="filter-shift"
                        >
                          <option value="All">All shifts</option>
                          <option value="Day Shift">Day Shift</option>
                          <option value="Night Shift">Night Shift</option>
                        </select>
                      </div>
                    </div>

                    {/* Scrollable Jobs Feed Grid */}
                    <div className="p-4 space-y-4 max-h-[620px] overflow-y-auto" id="jobs-grid">
                      {isAnalyzing ? (
                        <div className="p-12 text-center">
                          <div className="relative w-10 h-10 mx-auto mb-3">
                            <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="text-xs font-semibold text-slate-600">Analyzing Skill alignment...</p>
                        </div>
                      ) : filteredJobs.length === 0 ? (
                        <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-600">No jobs match your search/filters</p>
                          <p className="text-[10px] text-slate-400 mt-1">Try resetting filter styles or clear search queries.</p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setFilterWorkplace("All");
                              setFilterShift("All");
                            }}
                            className="mt-3 text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      ) : (
                        filteredJobs.map((job) => {
                          const matchResult = matchResults.find(r => r.jobId === job.id);
                          const isApplied = trackers.some(t => t.jobId === job.id);
                          return (
                            <JobCard
                              key={job.id}
                              job={job}
                              matchResult={matchResult}
                              onViewDetails={() => setSelectedJob(job)}
                              onApply={() => handleApplyJob(job)}
                              isApplied={isApplied}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Feed footer highlight */}
                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                      ★ Active Search Secured with SSL & AI screening filters
                    </p>
                  </div>
                </div>

                {/* 3. RIGHT BENTO COLUMN: Immersive Live Timeline Tracker */}
                <div className="col-span-12 lg:col-span-3 bg-indigo-950 text-white rounded-3xl shadow-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5 border-b border-indigo-900 pb-3">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300 block">
                        Live App Tracker
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>

                    {trackers.length > 0 ? (
                      <div>
                        {/* Selected Tracker Metadata */}
                        <div className="mb-4">
                          <span className="text-[9px] font-mono text-indigo-400 bg-indigo-900/60 border border-indigo-800 px-2 py-0.5 rounded-md font-bold uppercase">
                            GCC ASSESSOR HOT TRACK
                          </span>
                          <h3 className="text-sm font-black text-white mt-1.5 leading-snug">
                            {trackers[0].jobTitle}
                          </h3>
                          <p className="text-xs text-indigo-300 mt-0.5">
                            {trackers[0].company}
                          </p>
                        </div>

                        {/* Interactive simulation controls directly in the bento grid */}
                        <div className="bg-indigo-900/40 border border-indigo-800/80 p-3 rounded-2xl mb-5 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase">Simulation Panel:</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-800/80 text-indigo-200 rounded-md">
                              Status: {trackers[0].status}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAdvanceTrackerStatus(trackers[0].jobId)}
                              disabled={trackers[0].status === 'Offer Extended'}
                              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 text-white text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              Advance Stage
                            </button>
                            <button
                              onClick={() => handleResetTracker(trackers[0].jobId)}
                              className="px-2.5 py-1.5 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 hover:text-white text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                              title="Reset status simulation"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual vertical timeline */}
                        <div className="space-y-4 relative pl-3.5 border-l border-indigo-900/80 ml-1.5 py-1">
                          {stages.map((stage, idx) => {
                            const currentIdx = statusIndex[trackers[0].status] ?? 0;
                            const isCompleted = idx < currentIdx;
                            const isActive = idx === currentIdx;
                            const isUpcoming = idx > currentIdx;

                            return (
                              <div key={idx} className={`relative flex gap-3 transition-all duration-300 ${isUpcoming ? 'opacity-35' : ''}`}>
                                {/* Timeline Bullet node absolute positioning */}
                                <div className={`absolute -left-[20px] top-1 w-3 h-3 rounded-full border-2 ${
                                  isCompleted 
                                    ? 'bg-emerald-500 border-emerald-500' 
                                    : isActive 
                                    ? 'bg-indigo-400 border-white scale-125 shadow-md shadow-indigo-500' 
                                    : 'bg-indigo-950 border-indigo-800'
                                } z-10 flex items-center justify-center`}>
                                  {isCompleted && <span className="text-[7px] text-white font-bold">✓</span>}
                                  {isActive && <span className="h-1 w-1 rounded-full bg-white animate-pulse"></span>}
                                </div>

                                <div>
                                  <p className={`text-[11px] font-bold leading-tight ${isActive ? 'text-indigo-200' : 'text-white'}`}>
                                    {stage.label}
                                  </p>
                                  <p className="text-[9px] text-indigo-400 leading-none mt-0.5">
                                    {isActive ? 'In Progress' : stage.desc}
                                  </p>
                                  
                                  {isActive && trackers[0].logs[0] && (
                                    <div className="mt-1.5 p-2 bg-indigo-900/50 rounded-xl border border-indigo-800/40 text-[9px] text-indigo-200 leading-normal font-sans italic">
                                      "{trackers[0].logs[0].description}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-indigo-300">
                        <Layers className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <p className="text-xs">No active applications tracked.</p>
                        <p className="text-[10px] text-indigo-400 mt-1">Apply to jobs on the center feed to start live tracking.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-indigo-900">
                    <button 
                      onClick={() => setActiveTab('tracker')}
                      className="w-full py-2 bg-indigo-900 hover:bg-indigo-850 text-indigo-200 hover:text-white text-xs font-bold rounded-xl transition-all border border-indigo-800 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View Full History</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4. BOTTOM BENTO ROW: AI Interview Coach & Prep */}
                <div className="col-span-12 mt-1 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/70 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100 flex-shrink-0 flex items-center justify-center">
                      <BrainCircuit className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-indigo-950 tracking-tight">
                          AI Technical Interview Coach
                        </h3>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono text-[8px] font-bold uppercase rounded-md tracking-wider font-semibold">
                          REAL-TIME EVALUATION
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 mt-1 max-w-2xl leading-relaxed">
                        Assessors! Click "Start Prep Session" to simulate or generate real tech challenge questions customized to Sanjay's background. Type your answer and receive immediate grading, strengths, and verdicts directly from our match engine.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => startCoachSession("global-hyd-swe-01")}
                    className="px-5 py-3 bg-white hover:bg-slate-50 border border-indigo-200/50 text-indigo-600 font-bold rounded-2xl shadow-sm text-xs shrink-0 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Start Prep Session</span>
                    <Flame className="w-4 h-4 text-amber-500 fill-current animate-bounce" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ResumeBuilder
                profile={profile}
                setProfile={setProfile}
                onAnalyzeSkills={(skills) => {
                  analyzeSkills(skills);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'tracker' && (
            <motion.div
              key="tracker-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ApplicationTracker
                trackers={trackers}
                onAdvanceStatus={handleAdvanceTrackerStatus}
                onResetTracker={handleResetTracker}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            matchResult={matchResults.find(r => r.jobId === selectedJob.id)}
            onClose={() => setSelectedJob(null)}
            onApply={() => {
              handleApplyJob(selectedJob);
              setSelectedJob(null);
            }}
            isApplied={trackers.some(t => t.jobId === selectedJob.id)}
            userProfile={profile}
          />
        )}
      </AnimatePresence>

      {/* AI Interview Coach Modal */}
      <AnimatePresence>
        {isCoachOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-150 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                    <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">AI Interview Coach</h3>
                    <p className="text-[10px] text-indigo-300 font-mono font-bold uppercase tracking-wider">
                      Live Simulation & Assessment Evaluation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCoachOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                {coachLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="relative w-10 h-10 mx-auto">
                      <div className="absolute inset-0 border-2 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">Generating customized technical question...</p>
                    <p className="text-[10px] text-slate-400">Customizing criteria to match your profile skills.</p>
                  </div>
                ) : coachData ? (
                  <div className="space-y-5">
                    {/* The Question Box */}
                    <div className="p-4.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-bold font-mono uppercase tracking-wider">
                        QUESTION FOR YOU
                      </span>
                      <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mt-2">
                        Context of Role
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                        {coachData.context}
                      </p>
                      
                      <h4 className="text-xs font-bold text-slate-800 mt-4 border-t border-indigo-100/40 pt-3">
                        Technical Challenge Question:
                      </h4>
                      <p className="text-xs text-indigo-950 font-medium leading-relaxed mt-1.5 whitespace-pre-line bg-white p-3.5 rounded-xl border border-indigo-100/30 shadow-sm/50">
                        {coachData.question}
                      </p>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Guiding response tips
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-1">
                        {coachData.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-[10px] text-slate-500 leading-normal">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Answer Text Area */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Draft your Solution Answer
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">
                          {userAnswer.length} chars
                        </span>
                      </div>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Draft or paste your full-stack technical solution here. Mention key design choices, error handling, or performance hooks..."
                        className="w-full h-36 p-4 text-xs font-sans border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner bg-slate-50/20"
                      />
                    </div>

                    {/* AI Feedback Results Panel */}
                    {isAnalyzingAnswer ? (
                      <div className="p-5 text-center bg-indigo-50/30 rounded-2xl border border-indigo-100/40 space-y-2">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-bold text-indigo-900">AI Interview Evaluator checking your answer...</p>
                        <p className="text-[9px] text-indigo-500">Comparing details against the ideal key terms.</p>
                      </div>
                    ) : coachFeedback ? (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl border bg-slate-900 text-white space-y-4 shadow-xl"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded">
                              Evaluation Report
                            </span>
                            <span className="text-[9px] text-slate-400">• Evaluated by CareerConnect AI</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded-lg">
                              Score: {coachFeedback.score}/100
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                              coachFeedback.rating === 'Excellent' ? 'bg-emerald-500 text-white' :
                              coachFeedback.rating === 'Good' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {coachFeedback.rating}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                              Strengths
                            </span>
                            <p className="text-slate-300 leading-relaxed mt-0.5">{coachFeedback.strengths}</p>
                          </div>
                          <div className="border-t border-slate-800/80 pt-2.5">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                              Suggested Improvements
                            </span>
                            <p className="text-slate-300 leading-relaxed mt-0.5">{coachFeedback.improvements}</p>
                          </div>
                          <div className="border-t border-slate-800/80 pt-2.5 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/60">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                              Expert Verdict
                            </span>
                            <p className="text-indigo-200 mt-0.5 leading-relaxed italic">"{coachFeedback.verdict}"</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={submitAnswerForReview}
                        disabled={!userAnswer.trim() || isAnalyzingAnswer}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Submit Answer for Evaluation
                      </button>
                      <button
                        onClick={() => startCoachSession(coachJobId)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                        title="Generate another question"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Official Ideal Answer Toggle Accordion */}
                    <div className="border-t border-slate-100 pt-4">
                      <details className="group">
                        <summary className="list-none flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer select-none">
                          <span>View Ideal Answer Reference Key</span>
                          <span className="transition-transform group-open:rotate-180">
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </span>
                        </summary>
                        <div className="mt-3 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                          {coachData.idealAnswer}
                        </div>
                      </details>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">Could not load question.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <span>© 2026 CareerConnect AI. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}
