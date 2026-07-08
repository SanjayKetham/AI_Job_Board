import React from "react";
import { X, Briefcase, MapPin, DollarSign, Clock, Calendar, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Sparkles, Star } from "lucide-react";
import { Job, SkillMatchResult, UserProfile } from "../types";

interface JobDetailsModalProps {
  job: Job;
  matchResult?: SkillMatchResult;
  onClose: () => void;
  onApply: () => void;
  isApplied: boolean;
  userProfile: UserProfile;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, matchResult, onClose, onApply, isApplied, userProfile }) => {
  const isAssessmentJob = job.id === "global-hyd-swe-01";

  // Score styling
  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-emerald-500 text-white";
    if (score >= 50) return "bg-indigo-500 text-white";
    if (score >= 30) return "bg-amber-500 text-white";
    return "bg-slate-500 text-white";
  };

  const getScoreBorder = (score: number) => {
    if (score >= 80) return "border-emerald-200 bg-emerald-50/40";
    if (score >= 50) return "border-indigo-200 bg-indigo-50/40";
    if (score >= 30) return "border-amber-200 bg-amber-50/40";
    return "border-slate-200 bg-slate-50/40";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="job-details-modal">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-100 flex flex-col max-h-[90vh]">
          
          {/* Modal Header */}
          <div className={`p-6 border-b border-slate-100 flex items-start justify-between relative ${isAssessmentJob ? "bg-indigo-50/30" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${job.logoColor} shadow-inner flex-shrink-0`}>
                {job.company.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-800 leading-tight">
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm font-medium text-slate-500">
                  <span>{job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              id="close-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            
            {/* AI Match Banner */}
            {matchResult ? (
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-5 items-start md:items-center ${getScoreBorder(matchResult.score)}`}>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Dynamic radial match score visual */}
                  <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-mono ${getScoreBadge(matchResult.score)} shadow-sm`}>
                    <span className="text-lg font-bold">{matchResult.score}%</span>
                    <span className="text-[8px] uppercase tracking-wide opacity-90">Match</span>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-slate-800 text-sm">
                      Compatibility Analysis
                    </h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      Fit Rating: <span className="font-semibold text-indigo-600">{matchResult.fitCategory}</span>
                    </p>
                  </div>
                </div>

                <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200/60 md:pl-5 pt-3 md:pt-0">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-600 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-indigo-100" />
                    AI Advisory
                  </span>
                  <p className="text-xs text-slate-600 italic leading-relaxed mt-1">
                    "{matchResult.recommendation}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Want to see how you match?</p>
                    <p className="text-[11px] text-slate-500">Paste your resume in the "My Skill Profile" tab to unlock instant AI matching analysis!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">OFFERED SALARY</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">{job.salary}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">SHIFT TIMINGS</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">{job.shift}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">REQUIRED EXPERIENCE</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">{job.experience}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">OFFICE SETTING</span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">{job.workplace} ({job.type})</span>
              </div>
            </div>

            {/* Side by Side Skills Match details */}
            {matchResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Met Skills */}
                <div className="bg-emerald-50/10 border border-emerald-100 rounded-xl p-4">
                  <h4 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matching Skills ({matchResult.matchingSkills.length})
                  </h4>
                  {matchResult.matchingSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No exact skills matching. Try adding them to your profile!</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matchingSkills.map((s, i) => (
                        <span key={i} className="text-xs font-medium bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skill Gaps */}
                <div className="bg-amber-50/10 border border-amber-100 rounded-xl p-4">
                  <h4 className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Skills to Develop ({matchResult.skillGaps.length})
                  </h4>
                  {matchResult.skillGaps.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-medium italic">Excellent! You have met all requirements.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.skillGaps.map((s, i) => (
                        <span key={i} className="text-xs font-medium bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Description */}
            <div>
              <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Job Overview
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                {job.description}
              </p>
            </div>

            {/* Requirements Bullet list */}
            <div>
              <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Core Requirements
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((reqLine, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <span>{reqLine}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
            <span className="text-xs font-mono text-slate-400">
              Reference Code: {job.id}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  onApply();
                }}
                disabled={isApplied}
                className={`text-sm font-medium px-6 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                  isApplied
                    ? "bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-default shadow-none"
                    : isAssessmentJob
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
                id="apply-modal-btn"
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Active</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
