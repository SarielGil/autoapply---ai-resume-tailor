import React, { useState, useEffect } from 'react';

interface JobContextInputProps {
  onAnalyze: (jd: string, title?: string, company?: string) => void;
  onBack: () => void;
}

const JobContextInput: React.FC<JobContextInputProps> = ({ onAnalyze, onBack }) => {
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [scanning, setScanning] = useState(true);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const scanPage = async () => {
      // Check if we are in an extension context
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        setScanning(false);
        return;
      }

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          // Send message to content script
          chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_CONTEXT" }, (response) => {
            if (chrome.runtime.lastError) {
              console.log("Content script not ready or error:", chrome.runtime.lastError);
              setScanning(false);
              return;
            }

            if (response) {
              // We found something
              if (response.description) {
                setJd(response.description);
                if (response.title) setJobTitle(response.title);
                if (response.company) setCompanyName(response.company);
                setDetected(true);
              }
            }
            setScanning(false);
          });
        } else {
          setScanning(false);
        }
      } catch (err) {
        console.error(err);
        setScanning(false);
      }
    };

    scanPage();
  }, []);

  const isValid = jd.length > 20;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Job Context</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Extension Detection Status Banner */}
        <div style={{ transition: 'opacity 0.5s', opacity: scanning || detected ? 1 : 0, marginBottom: '1rem' }}>
          {scanning ? (
            <div className="status-badge" style={{ background: '#f1f5f9', color: '#475569', width: '100%', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Scanning tab...
            </div>
          ) : detected ? (
            <div className="status-badge status-success" style={{ width: '100%', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              Job detected!
            </div>
          ) : null}
        </div>

        <div className="input-group">
          <label className="input-label">Job Title</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Senior Product Designer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Company Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Job Description</label>
          <textarea
            className="input-field textarea-field"
            style={{ minHeight: '150px' }}
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={scanning}
          />
        </div>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onAnalyze(jd, jobTitle, companyName)}
          disabled={!isValid || scanning}
          className="btn btn-primary"
        >
          {scanning ? 'Scanning...' : (
            <>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Tailor Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default JobContextInput;