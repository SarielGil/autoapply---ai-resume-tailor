export enum AppStep {
  API_KEY_SETUP = 'API_KEY_SETUP',
  UPLOAD_RESUME = 'UPLOAD_RESUME',
  JOB_CONTEXT = 'JOB_CONTEXT',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW',
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
}

// Global declaration for jsPDF loaded via CDN
declare global {
  interface Window {
    jspdf: {
      jsPDF: any;
    };
  }
}