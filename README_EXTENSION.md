# How to Install AutoApply Chrome Extension

1.  **Build the Project:**
    Open your terminal in the project directory and run:
    ```bash
    npm run build
    ```
    This will create a `dist` folder.

2.  **Load in Chrome:**
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable **Developer mode** (toggle in the top right).
    - Click **Load unpacked**.
    - Select the `dist` folder directly inside `autoapply---ai-resume-tailor`.

3.  **Use the Extension:**
    - Pin the "AutoApply" extension to your toolbar.
    - Go to a job post (e.g., on LinkedIn, Indeed, or any career page).
    - Click the extension icon.
    - **First Time Setup**: You will be asked to enter your **Gemini API Key**.
    - **Scan**: The extension will automatically scan the page for a Job Description.
    - **Tailor**: Upload your resume (if not already saved) and click "Tailor Resume".
    - **Download**: Preview the result and download the PDF. The filename will include the Company/Job Title.

## Notes
- If scanning fails, you can manually paste the Job Description.
- The API Key is stored locally in your browser storage.
