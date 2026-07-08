import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Play, CheckCircle, ArrowRight, Activity, Terminal, Send, Bell, Mail, HelpCircle, FileCheck2, UserCheck, ShieldAlert, Sparkles } from "lucide-react";
import { ApplicationTracker as TrackerType, ApplicationStatus } from "../types";

interface ApplicationTrackerProps {
  trackers: TrackerType[];
  onAdvanceStatus: (jobId: string) => void;
  onResetTracker: (jobId: string) => void;
}

const STATUS_STEPS: { status: ApplicationStatus; label: string; desc: string }[] = [
  { status: 'Applied', label: 'Applied', desc: 'Application submitted successfully' },
  { status: 'Resume Screening', label: 'Screening', desc: 'AI profile matching and assessment review' },
  { status: 'Technical Assessment', label: 'Assessment', desc: 'CI/CD & Code review assessment' },
  { status: 'Interview Scheduled', label: 'Interview', desc: 'Onsite interview at Hyderabad office' },
  { status: 'Offer Extended', label: 'Offer', desc: 'Full-time employment proposal issued' }
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ trackers, onAdvanceStatus, onResetTracker }) => {
  const getStepIndex = (status: ApplicationStatus): number => {
    return STATUS_STEPS.findIndex(step => step.status === status);
  };

  const getStepColorClass = (stepIndex: number, currentStepIndex: number, isRejected: boolean) => {
    if (isRejected) {
      if (stepIndex === currentStepIndex) return { bg: "bg-rose-100 border-rose-400 text-rose-700", text: "text-rose-700 font-semibold" };
      if (stepIndex < currentStepIndex) return { bg: "bg-emerald-50 border-emerald-300 text-emerald-600", text: "text-slate-500" };
      return { bg: "bg-slate-50 border-slate-200 text-slate-300", text: "text-slate-300" };
    }

    if (stepIndex === currentStepIndex) {
      return { bg: "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100", text: "text-indigo-700 font-semibold" };
    }
    if (stepIndex < currentStepIndex) {
      return { bg: "bg-emerald-500 border-emerald-500 text-white", text: "text-slate-700 font-medium" };
    }
    return { bg: "bg-slate-50 border-slate-200 text-slate-400", text: "text-slate-400" };
  };

  // Render a specific mock email message depending on the status of the GCC assessment
  const renderMockGCCEmail = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans mt-3">
            <div className="flex items-center gap-2 text-slate-600 font-semibold mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>GCC Systems Auto-Acknowledge</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              "Hi candidate, thank you for submitting your application to the <strong>Global Coordination Center Ltd</strong>. Your profile has been sent to the recruiting team for initial skill screening."
            </p>
          </div>
        );
      case 'Resume Screening':
        return (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs font-sans mt-3">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>GCC AI Screening Report</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              "AI Matcher completed scan: Your resume matching score is <strong>95%</strong>! Key requirements met: TypeScript, React, and Node.js. Transferring file to Priya (GCC Country Coordinator) for immediate hiring assessment."
            </p>
          </div>
        );
      case 'Technical Assessment':
        return (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs font-sans mt-3">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>From: priya@globalcoordination.com (GCC India Coordinator)</span>
            </div>
            <p className="text-slate-600 leading-relaxed font-sans">
              "Thank you for your application. We would like to invite you to complete an assessment for the <strong>Software Engineer</strong> position. Please build a job portal featuring real-time tracking, push to GitHub, write CI/CD pipeline, deploy to Vercel, and provide documentation within 3 days. Good luck!"
            </p>
          </div>
        );
      case 'Interview Scheduled':
        return (
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-xs font-sans mt-3">
            <div className="flex items-center gap-2 text-amber-700 font-semibold mb-1">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>GCC Technical Interview Schedule</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              "Congratulations! Your React dashboard and GitHub workflow met all criteria. You are invited strictly onsite at our <strong>Hitech City, Hyderabad office</strong> for the final technical rounds. Please note this role operates on a <strong>night shift schedule</strong>."
            </p>
          </div>
        );
      case 'Offer Extended':
        return (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs font-sans mt-3">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>GCC Official Offer Letter</span>
            </div>
            <p className="text-emerald-950 font-semibold mb-1">OFFER DECLARED: Software Engineer (Onsite, Hyderabad)</p>
            <p className="text-emerald-800 leading-relaxed">
              "On behalf of Global Coordination Center Ltd, we are thrilled to extend you a formal offer. Welcome to the team! Our coordinator will call you to finalize onboarding details."
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8" id="tracker-dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800">
            Real-time Application Pipelines
          </h2>
          <p className="text-sm text-slate-500">
            Monitor the continuous, simulated status of your active job applications in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-xs font-medium">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Sync Status: Live and Connected</span>
        </div>
      </div>

      {trackers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No Applied Jobs Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Search for your preferred jobs on the 'Explore Jobs' tab and submit an application to start real-time telemetry tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {trackers.map((tracker) => {
            const currentStepIdx = getStepIndex(tracker.status);
            const isGCCJob = tracker.jobId === "global-hyd-swe-01";
            
            return (
              <div 
                key={tracker.jobId}
                className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden transition-all ${
                  isGCCJob 
                    ? "border-indigo-200 ring-1 ring-indigo-100 shadow-indigo-50/40" 
                    : "border-slate-100"
                }`}
                id={`tracker-item-${tracker.jobId}`}
              >
                {/* Simulated Simulator Overlay Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Live Telemetry
                    </span>
                    <h3 className="font-display font-bold text-slate-800 text-lg mt-1">
                      {tracker.jobTitle}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {tracker.company} • Applied on {tracker.appliedDate}
                    </p>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/60 w-full md:w-auto">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 px-2 uppercase hidden lg:inline">
                      Simulate Pipeline:
                    </span>
                    
                    <button
                      onClick={() => onAdvanceStatus(tracker.jobId)}
                      disabled={tracker.status === 'Offer Extended'}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors flex-1 md:flex-initial justify-center"
                      id={`advance-btn-${tracker.jobId}`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{tracker.status === 'Offer Extended' ? 'Onboard' : 'Advance Stage'}</span>
                    </button>

                    <button
                      onClick={() => onResetTracker(tracker.jobId)}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium py-1.5 px-2.5 rounded-lg transition-colors"
                      id={`reset-btn-${tracker.jobId}`}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* VISUAL STEPPER */}
                <div className="py-4 overflow-x-auto">
                  <div className="min-w-[650px] relative flex justify-between">
                    
                    {/* Stepper Progress Connector line */}
                    <div className="absolute top-[18px] left-[3%] right-[3%] h-[3px] bg-slate-100 -z-1">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${(Math.max(currentStepIdx, 0) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      ></div>
                    </div>

                    {STATUS_STEPS.map((step, idx) => {
                      const colors = getStepColorClass(idx, currentStepIdx, tracker.status === 'Rejected');
                      const isCompleted = idx < currentStepIdx;
                      
                      return (
                        <div key={idx} className="flex flex-col items-center text-center w-1/5 z-10">
                          {/* Circle badge */}
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono text-xs transition-all duration-300 ${colors.bg}`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 fill-emerald-500 stroke-white" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          {/* Text labels */}
                          <span className={`text-xs mt-2 transition-all ${colors.text}`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 px-2 hidden sm:block">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* LOWER SPLIT: Live logs and mock notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
                  
                  {/* GCC Simulated Notifications */}
                  <div className="lg:col-span-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-indigo-500" />
                        Live Communications
                      </h4>
                      
                      {isGCCJob ? (
                        renderMockGCCEmail(tracker.status)
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs italic text-slate-500 mt-3">
                          Standard pipeline telemetry initialized. Advance this role to trigger automated hiring coordinator notifications.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Log Terminal */}
                  <div className="lg:col-span-7 bg-slate-900 rounded-xl p-4 text-xs font-mono text-slate-300 border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        <span>TELEMETRY_LOGS</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {tracker.logs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-[11px] leading-relaxed">
                          <span className="text-indigo-400 shrink-0 font-medium select-none">
                            [{log.timestamp}]
                          </span>
                          <div className="flex-1">
                            <span className="text-emerald-400 font-bold">
                              {log.title}:
                            </span>{" "}
                            <span className="text-slate-300">{log.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
