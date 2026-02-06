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
        '.job-details-jobs-unified-top-card__company-name a',
        '.topcard__org-name-link', // LinkedIn public
        '.company-header-name', // Greenhouse
        '.job-header__company', // Lever
        '[data-automation-id="workdayCompanyHeader"]', // Workday
        '.employer-name',
        '.company-name',
        '.org-name',
        '.job-company',
        '.company'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
            const company = el.textContent.trim().split('·')[0].split('\n')[0].trim();
            if (company) return company;
        }
    }

    // Check meta tags
    const ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite && (ogSite as HTMLMetaElement).content) {
        return (ogSite as HTMLMetaElement).content;
    }

    return "";
}

function findJobTitle() {
    const selectors = [
        'h1.job-title',
        'h1.topcard__title', // LinkedIn public
        'h1[class*="title"]',
        '.job-header h1',
        '.job-title',
        '[class*="jobTitle"]',
        '[class*="JobTitle"]',
        'h1'
    ];

    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
            const title = el.textContent.trim().split('\n')[0].trim();
            if (title && title.length > 3) return title;
        }
    }

    // Try meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && (ogTitle as HTMLMetaElement).content) {
        return (ogTitle as HTMLMetaElement).content;
    }

    return document.title.split('|')[0].split('-')[0].trim();
}

function findJobDescription() {
    // 1. Specific platform selectors
    const platformSelectors = [
        '.job-details-jobs-unified-top-card__description', // LinkedIn
        '#job-details', // LinkedIn
        '.description__text', // LinkedIn public
        '#content', // Greenhouse
        '.job-description', // General
        '#job-description',
        '.posting-description', // Lever
        '[data-automation-id="jobPostingDescription"]', // Workday
        '.jobs-description',
        '.job-body'
    ];

    for (const selector of platformSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent && el.textContent.length > 100) {
            return (el as HTMLElement).innerText.trim();
        }
    }

    // 2. Generic containers
    const candidates = [
        'article',
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.content',
        '#content',
        '.job-details',
        '#job-details'
    ];

    let bestText = "";
    let maxLen = 0;

    for (const selector of candidates) {
        const els = document.querySelectorAll(selector);
        for (const el of els as any) {
            // Initially avoid common noise, but we'll relax this if nothing is found
            if (['NAV', 'FOOTER', 'HEADER', 'SCRIPT', 'STYLE'].includes(el.tagName)) continue;

            const text = (el as HTMLElement).innerText;
            if (text.length > 200 && text.length > maxLen) {
                bestText = text;
                maxLen = text.length;
            }
        }
    }

    if (bestText) return bestText.trim();

    // Fallback search: look for any div with many paragraphs
    const divs = document.querySelectorAll('div');
    for (const div of divs as any) {
        const pCount = div.querySelectorAll('p').length;
        if (pCount >= 2) {
            const text = div.innerText;
            if (text.length > 200 && text.length > maxLen) {
                bestText = text;
                maxLen = text.length;
            }
        }
    }

    // Ultimate fallback: Capture ALL text if we haven't found a "best" container
    // We try to exclude scripts and styles at least.
    const bodyCopy = document.body.cloneNode(true) as HTMLElement;
    const toRemove = bodyCopy.querySelectorAll('nav, footer, script, style, header');
    toRemove.forEach(el => el.remove());

    const finalFallback = bodyCopy.innerText.trim();
    if (finalFallback.length > 100) return finalFallback;

    return document.body.innerText.substring(0, 10000).trim();
}
