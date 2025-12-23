import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// 1. Mock Browser APIs
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock LocalStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// 2. Mock PDF and Canvas libraries (they crash in JSDOM)
vi.mock('html2canvas', () => ({ default: vi.fn(() => Promise.resolve({ toDataURL: () => 'data:image/png;base64,fake' })) }));
vi.mock('jspdf', () => ({ default: vi.fn(() => ({ addPage: vi.fn(), addImage: vi.fn(), save: vi.fn() })) }));

// 3. Mock React Moveable (Draggable library causes issues in tests)
vi.mock('react-moveable', () => ({ default: () => <div data-testid="mock-moveable"></div> }));
vi.mock('react-selecto', () => ({ default: () => <div data-testid="mock-selecto"></div> }));
