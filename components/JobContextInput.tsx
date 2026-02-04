import React, { useState, useEffect } from 'react';

interface JobContextInputProps {
  onAnalyze: (jd: string, title?: string) => void;
  onBack: () => void;
}

const JobContextInput: React.FC<JobContextInputProps> = ({ onAnalyze, onBack }) => {
  const [jd, setJd] = useState('');
  const [jobTitle, setJobTitle] = useState('');
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
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">Job Context</h2>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 flex flex-col space-y-4">

        {/* Extension Detection Status Banner */}
        <div className={`transition-all duration-500 overflow-hidden ${scanning || detected ? 'opacity-100' : 'opacity-0'}`}>
          {scanning ? (
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
              <div>
                <h3 className="font-semibold text-slate-700 text-sm">Scanning active tab...</h3>
                <p className="text-xs text-slate-500">Looking for job descriptions</p>
              </div>
            </div>
          ) : detected ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3 animate-slide-up">
              <div className="mt-0.5 bg-green-500 p-1 rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 text-sm">Job Description Detected!</h3>
                <p className="text-xs text-green-700 mt-1">
                  We found a job posting on the active tab. You can edit it below if needed.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
          <textarea
            className={`w-full h-64 p-3 border rounded-lg outline-none resize-none text-sm transition-all duration-300 ${detected ? 'border-green-300 ring-1 ring-green-100' : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
              }`}
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            disabled={scanning}
          />
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200">
        <button
          onClick={() => onAnalyze(jd, jobTitle)}
          disabled={!isValid || scanning}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isValid && !scanning
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {scanning ? 'Scanning...' : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Tailor Resume with Gemini
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default JobContextInput;