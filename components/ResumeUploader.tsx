import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeData } from '../types';

// Fix for pdfjs-dist import structure which can vary by environment/bundler (especially with esm.sh)
// We cast to any to avoid TS errors about .default possibly not existing on the namespace in strict typing,
// but at runtime with esm.sh it often wraps the library in default.
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set the worker source for pdfjs
// We use the CDNJS version (classic script) instead of esm.sh (module) for the worker 
// because standard Workers in browsers often struggle with Cross-Origin Module scripts via importScripts.
// Set the worker source for pdfjs to the local file in public folder
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
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Resume</h2>
      <p className="text-slate-500 mb-6">We support PDF and Text files.</p>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Resume Content
            {isParsing && <span className="ml-2 text-blue-600 text-xs font-semibold animate-pulse">Extracting text...</span>}
          </label>
          <textarea
            className="w-full h-64 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-xs"
            placeholder="Paste your resume content here or upload a file..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs text-slate-400">OR UPLOAD PDF/TXT</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <input
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
        />
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200">
        <button
          onClick={() => onNext(text)}
          disabled={!isValid || isParsing}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${isValid && !isParsing
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
        >
          {isValid ? "Save & Next" : "Enter Content to Continue"}
        </button>
      </div>
    </div>
  );
};

export default ResumeUploader;