/// <reference types="chrome"/>
import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

interface JobContextInputProps {
  onAnalyze: (jd: string, title?: string, company?: string, url?: string) => void;
  onBack: () => void;
  history?: HistoryItem[];
}

const JobContextInput: React.FC<JobContextInputProps> = ({ onAnalyze, onBack, history = [] }) => {
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [scanning, setScanning] = useState(true);
  const [detected, setDetected] = useState(false);
  const [pastApplications, setPastApplications] = useState<HistoryItem[]>([]);

  const scanPage = async (retries = 2) => {
    setScanning(true);
    setDetected(false);

    // Check if we are in an extension context
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      setScanning(false);
      return;
    }

    const performScan = async (attempt: number) => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          // 1. Inject the content script on the fly
          // We wrap this in a check to avoid injecting if already present, though scripting.executeScript is fast
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });

          // 2. Send message to content script
          chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_CONTEXT" }, (response) => {
            if (chrome.runtime.lastError) {
              console.log(`Attempt ${attempt} - Communication error:`, chrome.runtime.lastError);
              if (attempt < retries) {
                setTimeout(() => performScan(attempt + 1), 500);
              } else {
                setScanning(false);
              }
              return;
            }

            if (response && response.description) {
              setJd(response.description);
              if (response.title) setJobTitle(response.title);
              if (response.company) setCompanyName(response.company);
              if (response.url) setCurrentUrl(response.url);
              setDetected(true);
            } else {
              setDetected(false);
            }
            setScanning(false);
          });
        } else {
          setScanning(false);
        }
      } catch (err) {
        console.error("Scan error:", err);
        if (attempt < retries) {
          setTimeout(() => performScan(attempt + 1), 500);
        } else {
          setScanning(false);
        }
      }
    };

    performScan(1);
  };

  useEffect(() => {
    scanPage();
  }, []);

  // Check for past applications whenever company name changes
  useEffect(() => {
    if (!companyName || history.length === 0) {
      setPastApplications([]);
      return;
    }

    const matches = history.filter(h =>
      h.company.toLowerCase().includes(companyName.toLowerCase()) ||
      companyName.toLowerCase().includes(h.company.toLowerCase())
    );
    setPastApplications(matches);
  }, [companyName, history]);

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
        <div style={{ transition: 'opacity 0.5s', opacity: scanning || detected ? 1 : 1, marginBottom: '1rem' }}>
          {scanning ? (
            <div className="status-badge" style={{ background: '#f1f5f9', color: '#475569', width: '100%', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              Scanning tab...
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className={`status-badge ${detected ? 'status-success' : ''}`} style={{ flex: 1, justifyContent: 'center', background: detected ? '' : '#fef2f2', color: detected ? '' : '#991b1b' }}>
                {detected ? (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Job detected!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Detection failed
                  </>
                )}
              </div>
              <button
                onClick={() => scanPage()}
                className="btn"
                style={{ width: 'auto', padding: '0 0.75rem', fontSize: '0.8rem', background: 'white', border: '1px solid var(--border)' }}
              >
                Rescan
              </button>
            </div>
          )}
        </div>

        {/* Past Applications Warning */}
        {pastApplications.length > 0 && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#c2410c', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Previous Applications Found
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#9a3412', fontSize: '0.85rem' }}>
              {pastApplications.map(app => (
                <li key={app.id} style={{ marginBottom: '0.25rem' }}>
                  {app.jobTitle} ({new Date(app.timestamp).toLocaleDateString()})
                </li>
              ))}
            </ul>
          </div>
        )}

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
          onClick={() => onAnalyze(jd, jobTitle, companyName, currentUrl)}
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