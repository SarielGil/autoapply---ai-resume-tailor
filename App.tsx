import React, { useState, useEffect } from 'react';
import { AppStep, ResumeData, TailoredResume } from './types';
import ResumeUploader from './components/ResumeUploader';
import JobContextInput from './components/JobContextInput';
import PreviewResult from './components/PreviewResult';
import { tailorResume } from './services/geminiService';

const RESUME_STORAGE_KEY = 'autoapply_resume_v1';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.API_KEY_SETUP);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(null);
  const [targetJobTitle, setTargetJobTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Initial Check for API Key and Resume
  useEffect(() => {
    const init = async () => {
      let hasKey = false;
      // Check storage for API Key
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get('geminiApiKey');
        if (data.geminiApiKey) hasKey = true;
      } else {
        if (localStorage.getItem('geminiApiKey')) hasKey = true;
      }

      if (hasKey) {
        checkSavedResume();
      } else {
        setStep(AppStep.API_KEY_SETUP);
      }
    };
    init();
  }, []);

  const checkSavedResume = async () => {
    // Check chrome storage first
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = await chrome.storage.local.get(RESUME_STORAGE_KEY);
      if (data[RESUME_STORAGE_KEY]) {
        setResumeData(data[RESUME_STORAGE_KEY]);
        setStep(AppStep.JOB_CONTEXT);
        return;
      }
    }

    const saved = localStorage.getItem(RESUME_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.originalText) {
          setResumeData(parsed);
          setStep(AppStep.JOB_CONTEXT);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved resume", e);
        localStorage.removeItem(RESUME_STORAGE_KEY);
      }
    }
    setStep(AppStep.UPLOAD_RESUME);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ geminiApiKey: apiKeyInput.trim() });
    } else {
      localStorage.setItem('geminiApiKey', apiKeyInput.trim());
    }
    checkSavedResume();
  };

  const handleResumeNext = async (text: string) => {
    const newData = { fullName: "User", originalText: text }; // Default name, content matters
    setResumeData(newData);

    // Save to Chrome Storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [RESUME_STORAGE_KEY]: newData });
    }
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(newData));
    setStep(AppStep.JOB_CONTEXT);
  };

  const handleAnalyze = async (jd: string, title?: string) => {
    if (!resumeData) return;

    setStep(AppStep.PROCESSING);
    setError(null);
    if (title) setTargetJobTitle(title);

    try {
      const result = await tailorResume(resumeData.originalText, jd);
      setTailoredData(result);
      // Update full name if extracted by AI
      if (result.fullName) {
        setResumeData(prev => prev ? ({ ...prev, fullName: result.fullName! }) : null);
      }
      setStep(AppStep.PREVIEW);
    } catch (err) {
      console.error(err);
      setError("Failed to tailor resume. Please check your API key.");
      // Optional: Allow resetting key if it fails
      // setStep(AppStep.API_KEY_SETUP); 
      setStep(AppStep.JOB_CONTEXT);
    }
  };

  const handleReset = () => {
    setStep(AppStep.JOB_CONTEXT);
    setTailoredData(null);
    setError(null);
  };

  // Views
  if (step === AppStep.PROCESSING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tailoring your Resume...</h2>
          <p className="text-slate-500">Gemini is analyzing the job description...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-8">
      <div className="w-full max-w-md h-[100vh] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">AutoApply</h1>
            <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">Extension Beta</p>
          </div>
          {/* Small Settings Icon to Reset Key if needed */}
          <div className="ml-auto">
            <button
              onClick={() => setStep(AppStep.API_KEY_SETUP)}
              className="text-slate-400 hover:text-blue-600 p-1"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-hidden relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm z-50">
              {error}
            </div>
          )}

          {step === AppStep.API_KEY_SETUP && (
            <div className="p-6 h-full flex flex-col justify-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome!</h2>
              <p className="text-slate-600 mb-6 text-sm">To use AutoApply, please enter your Google Gemini API Key. It will be stored securely in your browser.</p>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gemini API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />

              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                Save & Continue
              </button>

              <p className="mt-6 text-xs text-center text-slate-400">
                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 underline">Get one here</a>
              </p>
            </div>
          )}

          {step === AppStep.UPLOAD_RESUME && (
            <ResumeUploader
              onNext={handleResumeNext}
              initialData={resumeData}
            />
          )}

          {step === AppStep.JOB_CONTEXT && (
            <JobContextInput
              onAnalyze={handleAnalyze}
              onBack={() => setStep(AppStep.UPLOAD_RESUME)}
            />
          )}

          {step === AppStep.PREVIEW && tailoredData && resumeData && (
            <PreviewResult
              data={tailoredData}
              fullName={resumeData.fullName}
              jobTitle={targetJobTitle}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;