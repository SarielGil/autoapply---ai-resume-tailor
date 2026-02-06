<div align="center">
<img width="1200" alt="AutoApply Banner" src="docs/images/banner.png" />
</div>

# TailorFit AI - Precision Resume Alignment

TailorFit AI is a powerful Chrome Extension that uses Google's latest Gemini AI models (3.0 Flash, 2.5, 1.5) to surgically align your resume with any job description instantly. Landing your dream job requires more than just applying; it requires the perfect fit. TailorFit AI makes it happen in seconds.

## 🚀 Features

- **Multi-Model Intelligence**: Automatically waterfall through Gemini 3.0, 2.5, and 1.5 for maximum reliability.
- **Smart Page Scanning**: Intelligent detection of job context on LinkedIn, Greenhouse, Workday, and more.

[![GitHub License](https://img.shields.io/github/license/SarielGil/autoapply---ai-resume-tailor)](https://github.com/SarielGil/autoapply---ai-resume-tailor/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/SarielGil/autoapply---ai-resume-tailor)](https://github.com/SarielGil/autoapply---ai-resume-tailor/stargazers)

---

## 🌟 Why TailorFit AI?

In today's job market, generic resumes are filtered out by ATS (Applicant Tracking Systems) and overlooked by recruiters. To stand out, you need to speak the language of the job description.

**TailorFit AI exists to:**
1.  **Eliminate the "Editing Fatigue"**: Re-writing bullet points for the 50th application is exhausting. Let AI do the heavy lifting with surgical precision.
2.  **Ensure Keyword Alignment**: Automatically highlight the skills and achievements that matter most to that specific role.
3.  **Maintain Privacy**: Your resume data and API keys are stored **locally** in your browser. We don't have a database; your data never leaves your control.

## ✨ Key Features

-   **🔍 Automatic Job Detection**: Our context engine scans LinkedIn, Indeed, Glassdoor, and more to find the job title and requirements automatically.
-   **🤖 Gemini Pro Integration**: Leverages the latest Google Gemini models for high-quality, professional career coaching and resume optimization.
-   **📄 Instant PDF Export**: Generates a clean, professional PDF with your tailored content in one click.
    - **History Tracking**: Keep track of all your applications and tailored resumes in one place.
-   **🛠️ Developer-First**: Clean TypeScript + React codebase, easy to extend and customize.

---

## 🛠️ Installation (Developer Beta)

Since this is currently in developer mode, you can load it into Chrome manually:

### 1. Build the Extension
```bash
# Clone the repository
git clone https://github.com/SarielGil/autoapply---ai-resume-tailor.git
cd autoapply---ai-resume-tailor

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Load into Chrome
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top right).
3.  Click **Load unpacked**.
4.  Select the `dist` folder directly inside the project directory.

---

## 🚀 How to Use

1.  **Setup**: Click the TailorFit AI icon in your toolbar and enter your [Gemini API Key](https://aistudio.google.com/app/apikey).
2.  **Upload**: Upload your base resume (once) or paste the text.
3.  **Tailor**: Navigate to any job post. Open the extension, and it should "see" the job description automatically. Click **Tailor Resume**.
4.  **Download**: Review the AI-generated bullet points and download your new, targeted PDF.

---

## 🏗️ Tech Stack

-   **Frontend**: React + TypeScript + Vanilla CSS
-   **AI**: Google Gemini SDK (`@google/genai`)
-   **Build Tool**: Vite
-   **PDF Generation**: `jspdf`
-   **PDF Processing**: `pdfjs-dist`

---

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for new job boards, improving the prompt engineering, or fixing bugs, feel free to open a PR.

---

<p align="center">Made with ❤️ for job seekers everywhere.</p>
