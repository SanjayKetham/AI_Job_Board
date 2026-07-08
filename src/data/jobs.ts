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

export const INITIAL_JOBS: Job[] = [
  {
    id: "global-hyd-swe-01",
    title: "Software Engineer",
    company: "Global Coordination Center Ltd",
    location: "Hitech City, Hyderabad, India",
    type: "Full-time",
    shift: "Night Shift",
    workplace: "Onsite",
    salary: "₹12,00,000 - ₹20,00,000 / year",
    experience: "1 - 4 years",
    description: "Join our core platform engineering team strictly onsite at our state-of-the-art office in Hitech City, Hyderabad. This role requires working on a dedicated night shift schedule supporting global infrastructure and real-time operations. You will be building resilient APIs, optimizing full-stack performance, and writing deployment workflows.",
    requirements: [
      "Proficient in TypeScript, React, and Node.js (Express)",
      "Strong understanding of CI/CD concepts (GitHub Actions, Vercel deployments)",
      "Comfortable working in a fast-paced environment supporting night shift schedules",
      "Hands-on experience with RESTful APIs and modern database systems",
      "Excellent communication and collaboration skills to sync with international coordinators"
    ],
    skills: ["TypeScript", "React", "Node.js", "Express", "GitHub Actions", "Vercel", "Tailwind CSS", "REST APIs"],
    postedAt: "Just now",
    logoColor: "bg-indigo-600 text-white",
    category: "Software Engineering"
  },
  {
    id: "tech-corp-02",
    title: "Senior React Developer",
    company: "Stellar Cloud Solutions",
    location: "Bangalore, India",
    type: "Full-time",
    shift: "Flexible",
    workplace: "Hybrid",
    salary: "₹18,00,000 - ₹26,00,000 / year",
    experience: "5+ years",
    description: "We are seeking a seasoned Frontend Architect or Senior React Developer to lead our next-generation web client codebase. You will write highly interactive components, build responsive layouts with Tailwind CSS, and improve performance.",
    requirements: [
      "Extensive experience with React 18/19, custom hooks, and state management",
      "Proficiency with modern css engines, Tailwind CSS, and headless UI libraries",
      "Experience setting up complex Vite architectures and web performance optimization",
      "Strong background in test-driven development (TDD) and clean code architecture"
    ],
    skills: ["React", "TypeScript", "Tailwind CSS", "Vite", "State Management", "TDD", "Webpack"],
    postedAt: "1 day ago",
    logoColor: "bg-emerald-600 text-white",
    category: "Frontend Development"
  },
  {
    id: "hyper-data-03",
    title: "AI Integrations Engineer",
    company: "NeuralFlow AI",
    location: "Remote (India)",
    type: "Contract",
    shift: "Flexible",
    workplace: "Remote",
    salary: "₹15,00,000 - ₹22,00,000 / year",
    experience: "2+ years",
    description: "Build intelligence into production web apps! Work closely with our product team to integrate LLMs (specifically Gemini API), orchestrate compound AI systems, and implement structured JSON response schemas.",
    requirements: [
      "Experience integrating OpenAI, Anthropic, or Google Gemini APIs in production",
      "Deep understanding of prompt engineering, function calling, and grounding techniques",
      "Highly skilled in Node.js, Python, and serverless architectures"
    ],
    skills: ["Gemini API", "TypeScript", "Node.js", "Python", "Prompt Engineering", "Function Calling"],
    postedAt: "2 days ago",
    logoColor: "bg-purple-600 text-white",
    category: "AI & Machine Learning"
  },
  {
    id: "devops-pro-04",
    title: "DevOps & CI/CD Specialist",
    company: "SecurOps Networks",
    location: "Mumbai, India",
    type: "Full-time",
    shift: "Day Shift",
    workplace: "Hybrid",
    salary: "₹14,00,000 - ₹22,00,000 / year",
    experience: "3+ years",
    description: "Own the build, test, and release cycle! We need an automation wizard who can build robust GitHub Actions workflows, set up seamless Vercel or AWS pipelines, and maintain high-security compliance.",
    requirements: [
      "In-depth knowledge of GitHub Actions, GitLab CI, or Jenkins",
      "Experience configuring automated cloud deployments (Vercel, AWS, GCP)",
      "Strong scripting abilities in Bash, Python, or Node.js",
      "Familiarity with Docker, Kubernetes, and secure secrets storage"
    ],
    skills: ["GitHub Actions", "Vercel", "Docker", "AWS", "Bash", "CI/CD", "YAML"],
    postedAt: "3 days ago",
    logoColor: "bg-amber-600 text-white",
    category: "DevOps & Infrastructure"
  },
  {
    id: "fullstack-ind-05",
    title: "Full Stack Engineer (Express/Node)",
    company: "Cognitive Labs",
    location: "Chennai, India",
    type: "Full-time",
    shift: "Day Shift",
    workplace: "Onsite",
    salary: "₹10,00,000 - ₹16,00,000 / year",
    experience: "2 - 5 years",
    description: "We are expanding our core team and looking for a developer who excels at full-stack JavaScript. You will design PostgreSQL schemas, write resilient Express backend routers, and compose elegant React views.",
    requirements: [
      "Excellent mastery over Node.js and Express server routing",
      "Hands-on database skills with PostgreSQL, SQL, or MongoDB",
      "Proficiency with modern React and Tailwind CSS",
      "A passion for creating fast, scalable, and responsive web products"
    ],
    skills: ["Node.js", "Express", "TypeScript", "React", "PostgreSQL", "SQL", "Tailwind CSS"],
    postedAt: "4 days ago",
    logoColor: "bg-blue-600 text-white",
    category: "Full Stack Engineering"
  },
  {
    id: "mobile-dev-06",
    title: "Mobile App Developer (React Native)",
    company: "Apex Mobile Inc",
    location: "Pune, India",
    type: "Full-time",
    shift: "Flexible",
    workplace: "Hybrid",
    salary: "₹12,00,000 - ₹18,00,000 / year",
    experience: "2+ years",
    description: "Craft pixel-perfect experiences for iOS and Android. You will manage our React Native product and translate design tokens to beautiful cross-platform native views.",
    requirements: [
      "Proven track record shipping React Native applications to stores",
      "Understanding of mobile animations, storage, and push notifications",
      "Familiarity with TypeScript and modern React patterns"
    ],
    skills: ["React Native", "TypeScript", "React", "iOS", "Android", "Mobile UI"],
    postedAt: "1 week ago",
    logoColor: "bg-rose-600 text-white",
    category: "Mobile Development"
  }
];
