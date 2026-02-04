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
  const [targetCompany, setTargetCompany] = useState<string>('');
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

  const handleAnalyze = async (jd: string, title?: string, company?: string) => {
    if (!resumeData) return;

    setStep(AppStep.PROCESSING);
    setError(null);
    if (title) setTargetJobTitle(title);
    if (company) setTargetCompany(company);

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
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '1rem' }}></div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tailoring Resume...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Gemini is analyzing the job description...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>AutoApply</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Beta</p>
          </div>
        </div>
        <button
          onClick={() => setStep(AppStep.API_KEY_SETUP)}
          className="btn"
          style={{ width: 'auto', padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </header>

      <main className="main-content">
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {step === AppStep.API_KEY_SETUP && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>To use AutoApply, please enter your Google Gemini API Key. It is stored securely in your browser.</p>

            <div className="input-group">
              <label className="input-label">Gemini API Key</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="input-field"
              />
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput}
              className="btn btn-primary"
            >
              Save & Start
            </button>

            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Get one here</a>
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
            companyName={targetCompany}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default App;