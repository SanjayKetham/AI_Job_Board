export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  shift: 'Day Shift' | 'Night Shift' | 'Flexible';
  workplace: 'Onsite' | 'Hybrid' | 'Remote';
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  skills: string[];
  postedAt: string;
  logoColor: string;
  category: string;
}

export interface SkillMatchResult {
  jobId: string;
  score: number;
  matchingSkills: string[];
  skillGaps: string[];
  recommendation: string;
  fitCategory: string;
}

export interface UserProfile {
  fullName: string;
  title: string;
  skills: string[];
  experience: string;
  summary: string;
}

export type ApplicationStatus = 'Applied' | 'Resume Screening' | 'Technical Assessment' | 'Interview Scheduled' | 'Offer Extended' | 'Rejected';

export interface ApplicationLog {
  id: string;
  status: ApplicationStatus;
  timestamp: string;
  title: string;
  description: string;
}

export interface ApplicationTracker {
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedDate: string;
  logs: ApplicationLog[];
}
