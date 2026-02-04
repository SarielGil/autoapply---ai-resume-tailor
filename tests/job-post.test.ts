import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Duplicate of the logic in src/content/index.ts for testing purposes
// In a production setup, we would extract this to a shared module.
function analyzePage(document: Document) {
    const title = findJobTitle(document);
    const description = findJobDescription(document);

    return { title, description };
}

function findJobTitle(document: Document) {
    const selectors = [
        'h1.job-title',
        'h1',
        '.job-header h1',
        '[class*="job-title"]',
        '[class*="JobTitle"]'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
            return el.textContent.trim();
        }
    }
    return document.title;
}

function findJobDescription(document: Document) {
    const candidates = [
        '#job-description',
        '.job-description',
        '[class*="description"]',
        'article',
        'main'
    ];

    let bestText = "";
    let maxLen = 0;

    for (const selector of candidates) {
        const els = document.querySelectorAll(selector);
        for (const el of els as any) {
            if (el.tagName === 'NAV' || el.tagName === 'FOOTER') continue;
            const text = (el as HTMLElement).textContent || "";
            if (text.length > 200 && text.length > maxLen) {
                bestText = text;
                maxLen = text.length;
            }
        }
    }

    if (bestText) return bestText.trim();
    if (document.body) return document.body.textContent?.substring(0, 5000).trim() || "";
    return "";
}

describe('Job Parsing Logic', () => {
    // Rise Codes Structure Simulation
    const riseHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Rise Careers</title></head>
      <body>
        <div class="job-header">
            <h1>Data Scientist</h1>
            <p>Tel Aviv, Israel</p>
        </div>
        <main>
            <div class="description-container">
                <h2>About the Job</h2>
                <p>We are looking for a Data Scientist to join our team at Rise.</p>
                <p>Responsibilities include machine learning, AI, and python development.</p>
                <p>This checks if the generic logic catches this block.</p>
                <p>More text to ensure it passes the length threshold of 200 chars. 
                   The quick brown fox jumps over the lazy dog. 
                   The quick brown fox jumps over the lazy dog. 
                   The quick brown fox jumps over the lazy dog.</p>
            </div>
            <nav>Menu Items should be ignored</nav>
        </main>
      </body>
    </html>
    `;

    it('should detect the job title on a Rise Codes style page', () => {
        const dom = new JSDOM(riseHtml);
        const { title } = analyzePage(dom.window.document);
        expect(title).toBe('Data Scientist');
    });

    it('should detect the job description', () => {
        const dom = new JSDOM(riseHtml);
        const { description } = analyzePage(dom.window.document);
        expect(description).toContain('We are looking for a Data Scientist');
        expect(description).toContain('Responsibilities include machine learning');
    });

    it('should fallback to document title if no h1 found', () => {
        const html = '<html><head><title>Fallback Job</title></head><body><p>Content</p></body></html>';
        const dom = new JSDOM(html);
        const { title } = analyzePage(dom.window.document);
        expect(title).toBe('Fallback Job');
    });
});
