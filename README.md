<div align="center">
<img width="1200" alt="AutoApply Banner" src="docs/images/banner.png" />
</div>

# 🚀 AutoApply: AI-Powered Resume Tailoring

**Stop spending hours manually editing your resume.** AutoApply is a Chrome Extension that uses Google's **Gemini AI** to instantly tailor your experience bullet points to match any job description.

[![GitHub License](https://img.shields.io/github/license/SarielGil/autoapply---ai-resume-tailor)](https://github.com/SarielGil/autoapply---ai-resume-tailor/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/SarielGil/autoapply---ai-resume-tailor)](https://github.com/SarielGil/autoapply---ai-resume-tailor/stargazers)

---

## 🌟 Why AutoApply?

In today's job market, generic resumes are filtered out by ATS (Applicant Tracking Systems) and overlooked by recruiters. To stand out, you need to speak the language of the job description.

**AutoApply exists to:**
1.  **Eliminate the "Editing Fatigue"**: Re-writing bullet points for the 50th application is exhausting. Let AI do the heavy lifting.
2.  **Ensure Keyword Alignment**: Automatically highlight the skills and achievements that matter most to that specific role.
3.  **Maintain Privacy**: Your resume data and API keys are stored **locally** in your browser. We don't have a database; your data never leaves your control.

## ✨ Key Features

-   **🔍 Automatic Job Detection**: Our context engine scans LinkedIn, Indeed, and more to find the job title and requirements automatically.
-   **🤖 Gemini Pro Integration**: Leverages the latest `gemini-1.5-flash` model for high-quality, professional career coaching.
-   **📄 Instant PDF Export**: Generates a clean, professional PDF with your tailored content in one click.
-   **🛠️ Developer-First**: Clean TypeScript codebase, easy to extend and customize.

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

1.  **Setup**: Click the AutoApply icon in your toolbar and enter your [Gemini API Key](https://aistudio.google.com/app/apikey).
2.  **Upload**: Upload your base resume (once) or paste the text.
3.  **Tailor**: Navigate to any job post. Open the extension, and it should "see" the job description. Click **Tailor Resume**.
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
