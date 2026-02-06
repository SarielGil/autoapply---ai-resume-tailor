import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TailoredResume } from "../types";

const getClient = async () => {
  let apiKey = process.env.API_KEY;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const data = await chrome.storage.local.get('geminiApiKey');
    if (data.geminiApiKey) {
      apiKey = data.geminiApiKey;
    }
  } else {
    // Fallback for local dev without extension context if key is in localStorage
    const localKey = localStorage.getItem('geminiApiKey');
    if (localKey) apiKey = localKey;
  }

  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("API Key is missing. Please set it in the extension.");
  }
  return new GoogleGenAI({ apiKey });
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: "hi",
    });
    return true;
  } catch (error) {
    console.error("API Key Validation Error (Gemini 3):", error);
    // Fallback check against 1.5 if 3 isn't available for some reason
    try {
      const ai = new GoogleGenAI({ apiKey });
      await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "hi",
      });
      return true;
    } catch (e) {
      return false;
    }
  }
};

export const testModels = async (apiKey: string): Promise<Record<string, boolean>> => {
  const models = ["gemini-3-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  const results: Record<string, boolean> = {};
  const ai = new GoogleGenAI({ apiKey });

  for (const model of models) {
    try {
      await ai.models.generateContent({
        model: model,
        contents: "ping",
      });
      results[model] = true;
    } catch (e) {
      console.warn(`Model ${model} not available:`, e);
      results[model] = false;
    }
  }
  return results;
};

export const tailorResume = async (
  originalResume: string,
  jobDescription: string
): Promise<TailoredResume> => {
  const ai = await getClient();
  const models = ["gemini-3-flash", "gemini-2.5-flash", "gemini-1.5-flash"];

  // Define the schema for the structured output
  const resumeSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING, description: "The full name of the candidate found in the resume." },
      contactInfo: {
        type: Type.OBJECT,
        properties: {
          email: { type: Type.STRING, description: "Email address found in resume. Empty if not found." },
          phone: { type: Type.STRING, description: "Phone number found in resume. Empty if not found." },
          location: { type: Type.STRING, description: "City/State found in resume. Empty if not found." }
        },
        required: ["email", "phone", "location"]
      },
      summary: {
        type: Type.STRING,
        description: "A professional summary tailored to the job description.",
      },
      skills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "A list of relevant technical and soft skills found in the resume that match the job description.",
      },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING, description: "Job title" },
            company: { type: Type.STRING, description: "Company name" },
            duration: { type: Type.STRING, description: "Employment dates (e.g., 'Jan 2020 - Present'). Leave empty string if no date is found." },
            points: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bullet points describing achievements.",
            },
          },
          required: ["role", "company", "points"],
        },
        description: "Work experience entries.",
      },
      detectedJobTitle: { type: Type.STRING, description: "The specific job title for the position described in the Job Description." },
      detectedCompany: { type: Type.STRING, description: "The name of the company hiring for this position, extracted from the Job Description." },
    },
    required: ["fullName", "contactInfo", "summary", "skills", "experience", "detectedJobTitle", "detectedCompany"],
  };

  const prompt = `
    You are an expert career coach and resume writer. 
    
    Task: Rewrite the provided resume to specifically target the provided Job Description.

    1. **Personal Info**: 
       - Extract the **Full Name** of the candidate.
       - Extract Contact Info (email, phone, location).
    
    2. **Job Analysis**:
       - Analyze the **Job Description** and extract the target **Job Title** and **Company Name**.
    
    3. **Experience Section Style**:
       - Start every bullet point with a strong **Action Verb** (e.g., Engineered, Spearheaded, Optimized, Led, Developed).
       - **DO NOT** use a repetitive formula like "Achieved X by doing Y". Make it sound natural and professional.
       - Focus on quantitative results (metrics) where possible, but ensure they are grounded in the original text.
       - Tailor the phrasing to match the keywords and requirements in the Job Description.

    4. **Dates/Duration**: 
       - Preserve the start and end dates exactly as they appear in the original resume.
       - If a role has no dates, leave the duration field empty. Do not invent dates.

    5. **General Guidelines**:
       - Maintain the truthfulness of the original resume.
       - Highlight skills that appear in both the resume and the job description.
       - Keep the tone professional, active, and concise.

    Job Description:
    ${jobDescription}

    Original Resume Text:
    ${originalResume}
  `;

  let lastError: any = null;

  for (const modelName of models) {
    try {
      console.log(`Attempting tailoring with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      } as any);

      const text = response.text;
      if (!text) {
        console.warn(`Model ${modelName} returned no text. Trying next model.`);
        continue;
      }

      console.log(`Successfully tailored resume using ${modelName}`);
      return JSON.parse(text) as TailoredResume;
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models fail
  console.error("All Gemini models failed tailoring.", lastError);
  throw new Error(`Failed to tailor resume. Last error: ${lastError?.message || 'Unknown error'}`);
};