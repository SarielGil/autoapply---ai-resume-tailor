import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types';

// Fix for pdfjs-dist import structure which can vary by environment/bundler (especially with esm.sh)
// We cast to any to avoid TS errors about .default possibly not existing on the namespace in strict typing,
// but at runtime with esm.sh it often wraps the library in default.
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set the worker source for pdfjs
if (pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');
}

interface ResumeUploaderProps {
  onNext: (resumeText: string) => void;
  initialData?: ResumeData | null;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onNext, initialData }) => {
  const [text, setText] = useState(initialData?.originalText || '');
  const [isParsing, setIsParsing] = useState(false);

  // Update local state if initialData changes
  useEffect(() => {
    if (initialData) {
      setText(initialData.originalText);
    }
  }, [initialData]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      return fullText;
    } catch (e) {
      console.error("PDF Parsing Error Details:", e);
      throw e;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      if (file.type === 'application/pdf') {
        const pdfText = await extractTextFromPDF(file);
        setText(pdfText);
        // Auto-save/next? Maybe just let user verify.
      } else if (file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target?.result as string || '');
        };
        reader.readAsText(file);
      } else {
        alert("Please upload a .pdf, .txt, or .md file.");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Failed to read the file. Please try converting it to text or pasting the content.");
    } finally {
      setIsParsing(false);
    }
  };

  const isValid = text.length > 50;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Upload Resume</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>We support PDF and Text files.</p>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="input-group">
          <label className="input-label">
            Resume Content
            {isParsing && <span style={{ marginLeft: '1rem', color: 'var(--primary)', fontSize: '0.8rem' }}>Extracting text...</span>}
          </label>
          <textarea
            className="input-field textarea-field"
            style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '12px' }}
            placeholder="Paste your resume content here or upload a file..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ height: '1px', background: 'var(--border)', flex: 1 }}></div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OR UPLOAD PDF/TXT</span>
          <div style={{ height: '1px', background: 'var(--border)', flex: 1 }}></div>
        </div>

        <div className="input-group">
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            className="input-field"
            style={{ padding: '0.5rem' }}
          />
        </div>
      </div>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onNext(text)}
          disabled={!isValid || isParsing}
          className="btn btn-primary"
        >
          {isValid ? "Save & Next" : "Enter Content to Continue"}
        </button>
      </div>
    </div>
  );
};

export default ResumeUploader;