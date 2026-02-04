// Content Script for AutoApply

console.log("AutoApply Content Script Loaded");

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_JOB_CONTEXT") {
        const jobContext = analyzePage();
        sendResponse(jobContext);
    }
});

// Heuristics to analyze the page
function analyzePage() {
    const title = findJobTitle();
    const company = findCompanyName();
    const description = findJobDescription();

    return {
        title,
        company,
        description,
        url: window.location.href
    };
}

function findCompanyName() {
    const selectors = [
        '.job-details-jobs-unified-top-card__company-name', // LinkedIn
        '[data-company-name]',
        '.company-name',
        '[class*="companyName"]',
        '[class*="CompanyName"]',
        'a[href^="/company/"]'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
            return el.textContent.trim();
        }
    }
    // Fallback: Try to find common patterns in title "Role at Company"
    return "";
}

function findJobTitle() {
    // Common selectors for job titles
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

function findJobDescription() {
    // 1. Try to find common containers
    const candidates = [
        '#job-description',
        '.job-description',
        '[class*="description"]', // Broad class search
        'article',
        'main'
    ];

    let bestText = "";
    let maxLen = 0;

    // Strategy 1: Look for specific containers
    for (const selector of candidates) {
        const els = document.querySelectorAll(selector);
        for (const el of els as any) {
            // Basic filter to avoid navs/footers if caught by 'description' class
            if (el.tagName === 'NAV' || el.tagName === 'FOOTER') continue;

            const text = (el as HTMLElement).innerText;
            // Job descriptions are usually long
            if (text.length > 200 && text.length > maxLen) {
                bestText = text;
                maxLen = text.length;
            }
        }
    }

    if (bestText) return bestText.trim();

    // Strategy 2: If no specific container, fallback to body but try to exclude obvious non-content
    return document.body.innerText.substring(0, 5000); // Truncate to avoid massive payloads
}
