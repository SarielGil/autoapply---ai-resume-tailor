import { vi } from 'vitest';

// Mock Chrome API
global.chrome = {
    runtime: {
        onMessage: {
            addListener: vi.fn(),
        },
        sendMessage: vi.fn(),
        lastError: null,
    },
    tabs: {
        query: vi.fn(),
        sendMessage: vi.fn(),
    },
    storage: {
        local: {
            get: vi.fn(),
            set: vi.fn(),
        },
    },
} as any;

// Mock window.jspdf
global.window.jspdf = {
    jsPDF: class {
        text = vi.fn();
        setFontSize = vi.fn();
        setFont = vi.fn();
        setTextColor = vi.fn();
        setDrawColor = vi.fn();
        line = vi.fn();
        splitTextToSize = vi.fn().mockReturnValue([]);
        addPage = vi.fn();
        save = vi.fn();
        getTextWidth = vi.fn().mockReturnValue(10);
    }
} as any;
