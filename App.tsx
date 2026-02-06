import { AppStep, ResumeData, TailoredResume, HistoryItem } from './types';
import ResumeUploader from './components/ResumeUploader';
import JobContextInput from './components/JobContextInput';
import PreviewResult from './components/PreviewResult';
import HistoryView from './components/HistoryView';
import { tailorResume, validateApiKey, testModels } from './services/geminiService';
import React, { useState, useEffect } from 'react';

const RESUME_STORAGE_KEY = 'autoapply_resume_v1';
const HISTORY_STORAGE_KEY = 'autoapply_history_v1';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.API_KEY_SETUP);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [tailoredData, setTailoredData] = useState<TailoredResume | null>(null);
  const [targetJobTitle, setTargetJobTitle] = useState<string>('');
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isValidating, setIsValidating] = useState(false); // New state for validation
  const [modelCompatibility, setModelCompatibility] = useState<Record<string, boolean> | null>(null);

  // Initial Check for API Key and Resume
  useEffect(() => {
    const init = async () => {
      let hasKey = false;
      // Check storage for API Key
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const data = await chrome.storage.local.get(['geminiApiKey', HISTORY_STORAGE_KEY]);
        if (data.geminiApiKey) {
          hasKey = true;
          setApiKeyInput(data.geminiApiKey); // Set apiKeyInput if key exists
        }
        if (data[HISTORY_STORAGE_KEY]) {
          setHistory(data[HISTORY_STORAGE_KEY]);
        }
      } else {
        const localKey = localStorage.getItem('geminiApiKey');
        if (localKey) {
          hasKey = true;
          setApiKeyInput(localKey); // Set apiKeyInput if key exists
        }
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedHistory) {
          try {
            setHistory(JSON.parse(savedHistory));
          } catch (e) {
            console.error("Failed to parse history", e);
          }
        }
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

    setIsValidating(true);
    setError(null);
    setModelCompatibility(null);

    try {
      const results = await testModels(apiKeyInput.trim());
      setModelCompatibility(results);

      const anyWorking = Object.values(results).some(v => v);
      if (!anyWorking) {
        setError("Invalid API Key or no accessible models. Please check your key.");
        return;
      }

      // If validation passes, save the key
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ geminiApiKey: apiKeyInput.trim() });
      } else {
        localStorage.setItem('geminiApiKey', apiKeyInput.trim());
      }
      setApiKey(apiKeyInput.trim());
    } catch (err: any) {
      console.error("Error validating API Key:", err);
      setError("Error validating API Key. Please check your network connection.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleProceed = () => {
    setStep(AppStep.UPLOAD_RESUME);
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

  const saveToHistory = async (item: HistoryItem) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: newHistory });
    } else {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: newHistory });
    } else {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    }
  };

  const handleAnalyze = async (jd: string, title?: string, company?: string, url?: string) => {
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

      // Use AI-detected details if user didn't provide them
      const finalTitle = title || result.detectedJobTitle || 'Unknown Role';
      const finalCompany = company || result.detectedCompany || 'Unknown Company';

      setTargetJobTitle(finalTitle);
      setTargetCompany(finalCompany);

      // Save to History
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        jobTitle: finalTitle,
        company: finalCompany,
        originalDescription: jd,
        tailoredData: result,
        url: url
      };
      saveToHistory(historyItem);

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

  const handleHistorySelect = (item: HistoryItem) => {
    setTailoredData(item.tailoredData);
    setTargetJobTitle(item.jobTitle);
    setTargetCompany(item.company);
    setStep(AppStep.PREVIEW);
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
        <div className="header-title" onClick={() => step !== AppStep.API_KEY_SETUP && step !== AppStep.UPLOAD_RESUME && setStep(AppStep.JOB_CONTEXT)} style={{ cursor: 'pointer' }}>
          <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 3L4 9V21H20V9L12 3Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 3V21" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>TailorFit <span style={{ color: 'var(--primary)' }}>AI</span></h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Precision Matching</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {step !== AppStep.API_KEY_SETUP && step !== AppStep.UPLOAD_RESUME && (
            <button
              onClick={() => setStep(AppStep.HISTORY)}
              className="btn"
              style={{ width: 'auto', padding: '0.5rem', background: step === AppStep.HISTORY ? '#eefff0' : 'transparent', color: step === AppStep.HISTORY ? 'var(--primary)' : 'var(--text-muted)' }}
              title="History"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
          )}
          <button
            onClick={() => setStep(AppStep.API_KEY_SETUP)}
            className="btn"
            style={{ width: 'auto', padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}
            title="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {step === AppStep.API_KEY_SETUP && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to TailorFit!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>Align your resume perfectly with any job. To get started, please enter your Google Gemini API Key.</p>

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
              disabled={!apiKeyInput || isValidating}
              className="btn btn-primary"
            >
              {isValidating ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', marginRight: '0.5rem', borderTopColor: 'white' }}></div>
                  Validating...
                </>
              ) : modelCompatibility ? 'Test Again' : 'Save & Start'}
            </button>

            {modelCompatibility && (
              <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Model Compatibility</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(modelCompatibility).map(([model, works]) => (
                    <div key={model} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{model}</span>
                      <span style={{ color: works ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                        {works ? '✓ Works' : '✕ Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>

                {Object.values(modelCompatibility).some(v => v) && (
                  <button
                    onClick={handleProceed}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem', background: '#10b981' }}
                  >
                    Continue to App →
                  </button>
                )}
              </div>
            )}

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
            history={history}
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

        {step === AppStep.HISTORY && (
          <HistoryView
            history={history}
            onSelect={handleHistorySelect}
            onDelete={handleDeleteHistory}
            onBack={() => setStep(AppStep.JOB_CONTEXT)}
          />
        )}
      </main>
    </div>
  );
};

export default App;