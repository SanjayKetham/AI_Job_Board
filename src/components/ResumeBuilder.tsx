import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Plus, X, ArrowRight, User, Briefcase, FileText, CheckCircle2, RotateCcw } from "lucide-react";
import { UserProfile } from "../types";

interface ResumeBuilderProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onAnalyzeSkills: (skills: string[]) => void;
}

const RESUME_PRESETS = [
  {
    name: "Full Stack Engineer Preset (TypeScript / Node)",
    title: "TypeScript Full Stack Developer",
    skills: ["TypeScript", "React", "Node.js", "Express", "REST APIs", "Tailwind CSS", "PostgreSQL", "GitHub Actions", "Vercel"],
    experience: "3 years of professional full-stack development",
    summary: "Passionate Full Stack Engineer specializing in TypeScript architectures. Experienced in building robust Express REST APIs, modern fluid React frontends, and automated CI/CD deployment pipelines.",
    text: `Sanjay Ketham
Software Engineer
Email: kethamsanjay@gmail.com

PROFESSIONAL SUMMARY
Highly motivated Software Engineer with 3 years of hands-on experience in full-stack development. Proficient in TypeScript, React, and Node.js. Passionate about automating deployment workflows and delivering pixel-perfect interfaces with Tailwind CSS.

SKILLS
- Core Languages: TypeScript, JavaScript, SQL, Python
- Frontend: React, Redux, Tailwind CSS, Vite, HTML5, CSS3
- Backend: Node.js, Express, REST APIs, PostgreSQL
- DevOps: GitHub Actions, Vercel, Docker, AWS

EXPERIENCE
Full Stack Developer | Cognitive Labs (2024 - Present)
- Designed and built secure, high-traffic Express APIs handling over 10,000 daily active requests.
- Integrated modern React frontend with Tailwind CSS, reducing bundle sizes by 30% using Vite.
- Implemented responsive, animated layouts with motion controls to maximize engagement.

Software Engineer Intern | Tech Solutions (2023 - 2024)
- Developed responsive React web views and configured PostgreSQL schemas.
- Set up initial GitHub Actions pipelines for automated staging releases.`
  },
  {
    name: "React Frontend Architect Preset",
    title: "Frontend Architect",
    skills: ["React", "TypeScript", "Tailwind CSS", "Vite", "State Management", "Webpack", "TDD"],
    experience: "5+ years of building clean client products",
    summary: "Senior Frontend Engineer with deep mastery of React, design systems, and frontend build optimization. Focused on user experience, high performance, and visual craft.",
    text: `Meera Sen
Senior Frontend Developer
Bangalore, India

SUMMARY
Creative and detail-oriented Senior React Developer with over 5 years of experience leading frontend teams. Deep understanding of React performance patterns, modular design tokens, and robust client states.

CORE TECH STACK
React, TypeScript, Tailwind CSS, Next.js, Webpack, Vite, Redux Toolkit, Jest, React Native, iOS

EXPERIENCE
Lead Frontend Architect | Stellar Cloud Solutions (2022 - Present)
- Architected a brand-new multi-tenant web application using React 18, Vite, and tailwind.
- Standardized reusable headless UI component library, boosting developer productivity by 40%.
- Achieved perfect 100/100 Lighthouse scores through dynamic chunking and lazy-loading.`
  }
];

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ profile, setProfile, onAnalyzeSkills }) => {
  const [resumeInput, setResumeInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");

  const parsingStepsText = [
    "Reading raw text input...",
    "Scanning keywords for frameworks and languages...",
    "Using Gemini 3.5 Flash to extract full structured profile...",
    "Finalizing resume profile categorization..."
  ];

  const handleParseResume = async (textToParse: string) => {
    setIsParsing(true);
    setParsingStep(0);

    // Simulated steps interval
    const stepInterval = setInterval(() => {
      setParsingStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 850);

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: textToParse })
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data: UserProfile = await response.json();
      
      clearInterval(stepInterval);
      setParsingStep(3);
      
      // Delay briefly to show completion
      setTimeout(() => {
        setProfile(data);
        setIsParsing(false);
        onAnalyzeSkills(data.skills);
      }, 500);

    } catch (error) {
      console.error("Parsing error:", error);
      clearInterval(stepInterval);
      setIsParsing(false);
    }
  };

  const applyPreset = (presetIndex: number) => {
    const p = RESUME_PRESETS[presetIndex];
    setResumeInput(p.text);
    handleParseResume(p.text);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      const updatedSkills = [...profile.skills, skillInput.trim()];
      const updatedProfile = { ...profile, skills: updatedSkills };
      setProfile(updatedProfile);
      onAnalyzeSkills(updatedSkills);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profile.skills.filter(s => s !== skillToRemove);
    const updatedProfile = { ...profile, skills: updatedSkills };
    setProfile(updatedProfile);
    onAnalyzeSkills(updatedSkills);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="resume-builder-section">
      {/* Left Panel: Paste or Choose Preset */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-semibold text-slate-800">
              Paste Resume or Bio
            </h2>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            Paste your current raw text resume, a list of your roles, or just a bio. Our integrated AI matching engine will automatically structure your profile.
          </p>

          {/* Preset Buttons */}
          <div className="mb-4">
            <span className="text-xs font-mono font-medium text-slate-400 block mb-2">QUICK TEST PRESETS:</span>
            <div className="flex flex-col sm:flex-row gap-2">
              {RESUME_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(index)}
                  disabled={isParsing}
                  className="text-left text-xs bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 px-3 py-2 rounded-lg transition-colors font-sans flex items-center justify-between"
                  id={`preset-${index}-btn`}
                >
                  <span className="truncate">{preset.name}</span>
                  <ArrowRight className="w-3 h-3 ml-2 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={resumeInput}
            onChange={(e) => setResumeInput(e.target.value)}
            disabled={isParsing}
            placeholder="Sanjay Ketham&#10;Software Engineer&#10;&#10;TypeScript, React, Node.js, Express, CI/CD, GitHub Actions..."
            className="w-full h-64 border border-slate-200 rounded-xl p-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none mb-4"
            id="resume-text-input"
          />
        </div>

        <div>
          {isParsing ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="relative w-12 h-12 mb-3">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {parsingStepsText[parsingStep]}
              </p>
              <div className="w-48 bg-slate-200 h-1 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300" 
                  style={{ width: `${(parsingStep + 1) * 25}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleParseResume(resumeInput)}
              disabled={!resumeInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              id="analyze-resume-btn"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse with AI & Analyze Skills</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Panel: Structured Profile Preview */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Profile Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-display font-semibold text-slate-800">
                Your AI Profile
              </h2>
            </div>
            
            {profile.fullName !== "Job Seeker" && (
              <button 
                onClick={() => {
                  setProfile({ fullName: "Job Seeker", title: "Software Professional", skills: [], experience: "No experience specified", summary: "Please add your skills or parse a resume to get matching insights." });
                  onAnalyzeSkills([]);
                  setResumeInput("");
                }}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
                id="reset-profile-btn"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Header details */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold font-display text-lg">
                  {profile.fullName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-base" id="profile-name">
                    {profile.fullName}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 flex items-center gap-1 mt-0.5" id="profile-title">
                    <Briefcase className="w-3 h-3" />
                    {profile.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Exp and summary */}
            <div>
              <span className="text-xs font-mono font-medium text-slate-400 block mb-1">EXPERIENCE LEVEL:</span>
              <p className="text-sm font-medium text-slate-700" id="profile-experience">
                {profile.experience}
              </p>
            </div>

            <div>
              <span className="text-xs font-mono font-medium text-slate-400 block mb-1">AI PROFESSIONAL BIO:</span>
              <p className="text-sm text-slate-500 leading-relaxed italic" id="profile-summary">
                "{profile.summary}"
              </p>
            </div>
          </div>
        </div>

        {/* Skill Keywords */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-semibold text-slate-700">
              YOUR MATCHING SKILLS ({profile.skills.length})
            </h3>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill (e.g. React, SQL)"
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              id="new-skill-input"
            />
            <button
              type="submit"
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              id="add-skill-btn"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </form>

          {profile.skills.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 italic">
              No skills listed. Type a skill or load a preset above to analyze matching positions!
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5" id="skills-list">
              {profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 pl-2.5 pr-1.5 py-1 rounded-full transition-all hover:bg-slate-100"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
