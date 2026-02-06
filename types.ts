export enum AppStep {
  API_KEY_SETUP = 'API_KEY_SETUP',
  UPLOAD_RESUME = 'UPLOAD_RESUME',
  JOB_CONTEXT = 'JOB_CONTEXT',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW',
  HISTORY = 'HISTORY',
}

export interface ResumeData {
  fullName: string;
  originalText: string;
}

export interface JobContext {
  title?: string;
  company?: string;
  description: string;
  url: string;
}

export interface TailoredResume {
  fullName?: string; // Optional because legacy data might not have it
  contactInfo: {
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration?: string;
    points: string[];
  }[];
  detectedJobTitle?: string;
  detectedCompany?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  jobTitle: string;
  company: string;
  originalDescription: string;
  tailoredData: TailoredResume;
  url?: string;
}

// Global declaration for jsPDF loaded via CDN
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
  }
}