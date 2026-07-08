import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_JOBS } from "./src/data/jobs.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to initialize GoogleGenAI lazy-loaded
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or has a placeholder value. Falling back to rule-based parser & matching.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
  });
});

// 2. API: Parse Resume / Profile Info using AI
app.post("/api/parse-resume", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
    return res.status(400).json({ error: "Resume text is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant programmatical fallback if no API key
    return res.json(fallbackParseResume(resumeText));
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert ATS (Applicant Tracking System) recruiter. Extract core structured details from the following resume text. Format your response exactly to match the schema provided. Here is the resume text:\n\n${resumeText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Candidate's full name if found, otherwise 'Job Seeker'" },
            title: { type: Type.STRING, description: "Professional title, e.g. Software Engineer, Frontend Developer, etc." },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of extracted skills (e.g. React, TypeScript, Java, Express, Docker)"
            },
            experience: { type: Type.STRING, description: "A brief summary of experience years or background" },
            summary: { type: Type.STRING, description: "A highly professional, punchy candidate overview summary (1-2 sentences)" }
          },
          required: ["fullName", "title", "skills", "experience", "summary"]
        }
      }
    });

    const resultText = response.text?.trim() || "";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Parse Resume Error:", error);
    // Graceful fallback on API failure
    res.json(fallbackParseResume(resumeText));
  }
});

// 3. API: Skill-Based Matcher using AI
app.post("/api/match-skills", async (req, res) => {
  const { skills } = req.body; // array of strings
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "Skills array is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Mock / Rule-based skill matching fallback
    return res.json(fallbackMatchSkills(skills));
  }

  try {
    const prompt = `You are an AI-powered skill matching assistant for a modern job board.
We have a set of open job positions, and we need to evaluate how well a candidate fits each job based on their self-declared skills.

Candidate Skills: ${JSON.stringify(skills)}

Open Jobs:
${JSON.stringify(INITIAL_JOBS.map(j => ({ id: j.id, title: j.title, company: j.company, requiredSkills: j.skills })))}

Evaluate compatibility for EVERY job. For each job, return:
1. 'jobId': Must match the job id.
2. 'score': Integer from 0 to 100 based on the overlap and relevance of the candidate's skills to the requiredSkills.
3. 'matchingSkills': Array of skills the candidate has that are highly relevant to this job.
4. 'skillGaps': Array of required skills that the candidate is missing or could improve upon.
5. 'recommendation': A personalized, highly encouraging advice sentence on how the candidate can bridge any skill gaps or prepare for this job.
6. 'fitCategory': One of: 'Excellent Match' (score >= 80), 'Good Match' (score 50-79), 'Potential Match' (score 30-49), or 'Needs Upskilling' (score < 30).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobId: { type: Type.STRING },
              score: { type: Type.INTEGER },
              matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING },
              fitCategory: { type: Type.STRING }
            },
            required: ["jobId", "score", "matchingSkills", "skillGaps", "recommendation", "fitCategory"]
          }
        }
      }
    });

    const resultText = response.text?.trim() || "";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Skill Matcher Error:", error);
    res.json(fallbackMatchSkills(skills));
  }
});

// 4. API: AI Interview Coach
app.post("/api/interview-coach", async (req, res) => {
  const { skills, jobId } = req.body;
  const targetJob = INITIAL_JOBS.find(j => j.id === jobId) || INITIAL_JOBS[0];

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackInterviewCoach(skills, targetJob));
  }

  try {
    const prompt = `You are an expert technical interviewer conducting assessments for a software company.
Create a highly authentic, realistic technical interview question customized for a candidate applying to the job role below, targeting their skillset.

Job Details:
Title: ${targetJob.title}
Company: ${targetJob.company}
Required Skills: ${JSON.stringify(targetJob.skills)}
Description: ${targetJob.description}

Candidate Skills: ${JSON.stringify(skills)}

Provide your response in JSON format matching the schema exactly:
{
  "question": "The technical question",
  "context": "Why this is asked for this role",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "idealAnswer": "Key points the candidate should cover"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            context: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            idealAnswer: { type: Type.STRING }
          },
          required: ["question", "context", "tips", "idealAnswer"]
        }
      }
    });

    const resultText = response.text?.trim() || "";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Interview Coach Error:", error);
    res.json(fallbackInterviewCoach(skills, targetJob));
  }
});

// 5. API: AI Interview Answer Evaluator
app.post("/api/evaluate-answer", async (req, res) => {
  const { question, answer, idealAnswer } = req.body;
  if (!answer || !answer.trim()) {
    return res.status(400).json({ error: "Answer is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallbackEvaluateAnswer(answer, idealAnswer));
  }

  try {
    const prompt = `You are an expert technical interviewer. Evaluate the candidate's answer against the technical question and the ideal answer key.
Format your review into JSON matching this exact schema:
{
  "rating": "A short word like Excellent, Good, Fair, or Poor",
  "score": 85, // out of 100
  "strengths": "What they explained well",
  "improvements": "What technical concepts they missed or should emphasize more",
  "verdict": "A brief, encouraging concluding sentence summarizing their readiness"
}

Question asked: ${question}
Ideal Key Points: ${idealAnswer}
Candidate's Answer: ${answer}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rating: { type: Type.STRING },
            score: { type: Type.INTEGER },
            strengths: { type: Type.STRING },
            improvements: { type: Type.STRING },
            verdict: { type: Type.STRING }
          },
          required: ["rating", "score", "strengths", "improvements", "verdict"]
        }
      }
    });

    const resultText = response.text?.trim() || "";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Evaluate Answer Error:", error);
    res.json(fallbackEvaluateAnswer(answer, idealAnswer));
  }
});

// Fallback algorithm for AI interview coach
function fallbackInterviewCoach(skills: string[], job: any) {
  const isGcc = job.id === "global-hyd-swe-01";
  if (isGcc) {
    return {
      question: "GCC has a high-traffic microservice deployed onsite at Hyderabad Hitech City that syncs global operations. In a night-shift emergency, you observe a spike in 504 Gateway Timeouts. How do you isolate the error, and how would you configure an automated Express retry/fallback mechanism with state alerts?",
      context: "Tests your practical full-stack debugging, Node.js resiliency designs, and night-shift critical operational readiness required for GCC Ltd.",
      tips: [
        "Mention system log monitoring (e.g., PM2, Winston, or cloud log filters) to locate the bottleneck.",
        "Propose using circuit breaker patterns (like opossum) or Express middleware for graceful fallbacks.",
        "Demonstrate how you would log and track errors dynamically without exposing secrets in frontends."
      ],
      idealAnswer: "1. Isolate the issue by checking API response telemetry and database locks in the Hitech City private network.\n2. Add a custom middleware in Express that handles upstream timeouts and routes requests to a cached fallback state.\n3. Integrate automated health checks and use structured alert metrics for the night-shift coordination team."
    };
  }

  return {
    question: `When building a highly interactive dashboard with React for ${job.company}, how do you prevent unnecessary re-renders of list items during fast, real-time data updates (e.g. live tracking or search filtering)?`,
    context: "Evaluates your advanced understanding of React rendering life-cycles, memorization, and performant state propagation.",
    tips: [
      "Talk about the differences between React.memo, useMemo, and useCallback.",
      "Explain how primitive values vs reference types in dependency arrays affect re-renders.",
      "Discuss debouncing filter state updates to prevent blocking the main thread."
    ],
    idealAnswer: "1. Wrap expensive child components in React.memo and pass primitive dependencies if possible.\n2. Keep local inputs in internal state and only dispatch search queries to the parent state with a debounce wrapper.\n3. Use virtualized lists (e.g., react-window) for grids containing hundreds of items."
  };
}

// Fallback algorithm for AI interview evaluation
function fallbackEvaluateAnswer(answer: string, idealAnswer: string) {
  const lowercaseAnswer = answer.toLowerCase();
  
  // Basic heuristic keyword check
  let score = 55;
  let rating = "Fair";
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (lowercaseAnswer.length > 150) {
    score += 15;
    strengths.push("Provided a detailed explanation with decent background context.");
  } else {
    improvements.push("The response is brief; try expanding on your architectural choices and design patterns.");
  }

  // Check some typical keywords like "middleware", "log", "cache", "memo", "render", "state"
  const keywords = ["middleware", "log", "cache", "retry", "alert", "memo", "callback", "render", "state", "prevent"];
  let matches = 0;
  keywords.forEach(kw => {
    if (lowercaseAnswer.includes(kw)) {
      matches++;
    }
  });

  score += Math.min(matches * 5, 25);

  if (score >= 80) {
    rating = "Excellent";
    strengths.push("Demonstrated strong keyword alignment with standard full-stack resiliency principles.");
  } else if (score >= 65) {
    rating = "Good";
    strengths.push("Successfully touched upon key technical terms mentioned in the answer guide.");
  }

  if (improvements.length === 0) {
    improvements.push("Could provide a concrete code snippet or structural pseudo-code to make the explanation highly practical.");
  }

  return {
    rating,
    score: Math.min(score, 100),
    strengths: strengths.join(" ") || "Communicated your thoughts with correct professional terminology.",
    improvements: improvements.join(" "),
    verdict: "A solid attempt! Keep refining your practical design trade-offs to ace the live assessment panels."
  };
}

// Fallback algorithm for parsing resume text (Rule-based Regex)
function fallbackParseResume(text: string) {
  const lowercaseText = text.toLowerCase();
  
  // Basic Name extraction attempt
  let fullName = "Job Seeker";
  const nameLineMatch = text.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
  if (nameLineMatch) {
    fullName = nameLineMatch[0];
  }

  // Title extraction attempt
  let title = "Software Professional";
  if (lowercaseText.includes("frontend") || lowercaseText.includes("react")) {
    title = "Frontend Developer";
  } else if (lowercaseText.includes("backend") || lowercaseText.includes("express") || lowercaseText.includes("node")) {
    title = "Backend Developer";
  } else if (lowercaseText.includes("full stack") || lowercaseText.includes("fullstack")) {
    title = "Full Stack Engineer";
  } else if (lowercaseText.includes("devops") || lowercaseText.includes("ci/cd")) {
    title = "DevOps Specialist";
  } else if (lowercaseText.includes("ai") || lowercaseText.includes("machine learning") || lowercaseText.includes("gemini")) {
    title = "AI Integrations Engineer";
  }

  // Predefined skill dictionary for keyword extraction
  const possibleSkills = [
    "TypeScript", "React", "Node.js", "Express", "GitHub Actions", 
    "Vercel", "Tailwind CSS", "REST APIs", "Python", "Vite", 
    "State Management", "TDD", "Webpack", "Docker", "AWS", 
    "Bash", "CI/CD", "YAML", "PostgreSQL", "SQL", "MongoDB", 
    "React Native", "iOS", "Android", "Mobile UI", "Gemini API",
    "Prompt Engineering", "Function Calling", "JavaScript", "HTML", "CSS"
  ];

  const skills: string[] = [];
  possibleSkills.forEach(skill => {
    // Match skill bound by word limits or symbols like .js
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      skills.push(skill);
    }
  });

  if (skills.length === 0) {
    skills.push("TypeScript", "React", "Node.js"); // Default starter skills
  }

  // Experience extraction
  let experience = "Not specified";
  const expMatch = text.match(/(\d+)\+?\s*(year|yr)s?\s*(of\s*)?experience/i);
  if (expMatch) {
    experience = `${expMatch[1]}+ years of experience`;
  } else if (lowercaseText.includes("fresher")) {
    experience = "Fresher / Entry Level";
  } else {
    experience = "1-3 years of development background";
  }

  return {
    fullName,
    title,
    skills,
    experience,
    summary: `Motivated professional with expertise in ${skills.slice(0, 3).join(", ")}. Passionate about building high-quality, resilient software applications.`
  };
}

// Fallback algorithm for skill matching (Intersection-based)
function fallbackMatchSkills(userSkills: string[]) {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  
  return INITIAL_JOBS.map(job => {
    const jobSkills = job.skills;
    const matchingSkills: string[] = [];
    const skillGaps: string[] = [];

    jobSkills.forEach(skill => {
      const isMatched = normalizedUserSkills.some(us => us === skill.toLowerCase() || us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
      if (isMatched) {
        matchingSkills.push(skill);
      } else {
        skillGaps.push(skill);
      }
    });

    // Calculate score
    const totalRequired = jobSkills.length;
    const matchedCount = matchingSkills.length;
    let score = totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : 50;

    // Direct bonus for custom or relevant tags
    if (job.id === "global-hyd-swe-01" && normalizedUserSkills.includes("typescript")) {
      score = Math.min(score + 10, 100);
    }

    // Determine category
    let fitCategory = "Needs Upskilling";
    if (score >= 80) fitCategory = "Excellent Match";
    else if (score >= 50) fitCategory = "Good Match";
    else if (score >= 30) fitCategory = "Potential Match";

    // Build recommendation
    let recommendation = "";
    if (score >= 80) {
      recommendation = `Fantastic match! Your profile perfectly aligns with ${job.company}'s requirements. We highly recommend applying immediately.`;
    } else if (score >= 50) {
      recommendation = `Great potential! Strengthening your knowledge in ${skillGaps.slice(0, 2).join(" or ")} would make your application stand out significantly.`;
    } else {
      recommendation = `To qualify for this role, focus on acquiring skills like ${skillGaps.slice(0, 3).join(", ")}. Try building starter projects with these technologies first.`;
    }

    return {
      jobId: job.id,
      score,
      matchingSkills,
      skillGaps,
      recommendation,
      fitCategory
    };
  });
}

// Start full-stack app server (Express + Vite)
async function startServer() {
  // Setup Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static asset serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CareerConnect AI Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
