import React from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, DollarSign, Clock, Award, Star, ArrowRight, Zap, CheckCircle } from "lucide-react";
import { Job, SkillMatchResult } from "../types";

interface JobCardProps {
  job: Job;
  matchResult?: SkillMatchResult;
  onViewDetails: () => void;
  onApply: () => void;
  isApplied: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, matchResult, onViewDetails, onApply, isApplied }) => {
  const isAssessmentJob = job.id === "global-hyd-swe-01";

  // Score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50", fill: "text-emerald-600" };
    if (score >= 50) return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", fill: "text-indigo-600" };
    if (score >= 30) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50", fill: "text-amber-600" };
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", fill: "text-slate-400" };
  };

  const scoreDetails = matchResult ? getScoreColor(matchResult.score) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-3xl p-6 bg-white border transition-all relative overflow-hidden shadow-sm flex flex-col justify-between h-full ${
        isAssessmentJob 
          ? "border-indigo-500 ring-2 ring-indigo-500/10 shadow-indigo-100/50" 
          : "border-slate-100 hover:border-slate-200 hover:shadow-md"
      }`}
      id={`job-card-${job.id}`}
    >
      {/* Glow highlight for the assessment job */}
      {isAssessmentJob && (
        <div className="absolute top-0 right-0 bg-indigo-500 text-white font-mono text-[10px] tracking-wider uppercase font-semibold px-4 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current animate-pulse" />
          <span>GCC ASSESSMENT</span>
        </div>
      )}

      {/* Main Card Content */}
      <div>
        {/* Title & Company */}
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${job.logoColor} shadow-inner flex-shrink-0`}>
            {job.company.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div className="pr-12">
            <h3 className="font-display font-semibold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-snug">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {job.company}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/50">
            <MapPin className="w-3 h-3" />
            {job.workplace}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200/50">
            <Clock className="w-3 h-3" />
            {job.type}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
            job.shift === 'Night Shift' ? 'bg-purple-50 text-purple-700 border-purple-200/50' : 'bg-slate-50 text-slate-600 border-slate-200/50'
          }`}>
            {job.shift}
          </span>
        </div>

        {/* Short Summary */}
        <p className="text-xs text-slate-500 mt-4 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        {/* Skill matching meter if results are analyzed */}
        {matchResult && scoreDetails && (
          <div className={`mt-5 p-3 rounded-xl border ${scoreDetails.bg} ${scoreDetails.border}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                AI Match Assessment
              </span>
              <span className={`text-xs font-mono font-bold ${scoreDetails.text}`}>
                {matchResult.score}% Compatibility
              </span>
            </div>
            
            {/* Score progress bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className={`h-full transition-all duration-500 ${
                  matchResult.score >= 80 ? 'bg-emerald-500' : matchResult.score >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                }`}
                style={{ width: `${matchResult.score}%` }}
              ></div>
            </div>

            <div className="mt-2 text-[10px] font-medium text-slate-600 flex items-center justify-between">
              <span>{matchResult.fitCategory}</span>
              <span className="font-mono text-slate-400">
                {matchResult.matchingSkills.length} matched • {matchResult.skillGaps.length} gaps
              </span>
            </div>
          </div>
        )}

        {/* Fallback skills preview if no matching analyzed */}
        {!matchResult && (
          <div className="mt-5">
            <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">Core Stack:</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {job.skills.slice(0, 4).map((s, idx) => (
                <span key={idx} className="text-[10px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50 font-mono">
                  {s}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[9px] font-medium text-slate-400 px-1 py-0.5">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom info & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">SALARY RANGE</span>
          <span className="text-xs font-semibold text-slate-700 leading-none">{job.salary}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="text-xs text-slate-600 hover:text-indigo-600 font-medium px-2.5 py-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            id={`details-btn-${job.id}`}
          >
            Details
          </button>
          
          <button
            onClick={onApply}
            disabled={isApplied}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isApplied
                ? "bg-slate-100 text-slate-400 cursor-default"
                : isAssessmentJob
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
            id={`apply-btn-${job.id}`}
          >
            {isApplied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Tracking</span>
              </>
            ) : (
              <>
                <span>Apply</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
