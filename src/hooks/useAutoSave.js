import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'carousel_autosave_v1';

export const useAutoSave = (state) => {
    // Debounce save to avoid thrashing localStorage
    useEffect(() => {
        const handler = setTimeout(() => {
            const data = {
                version: 1,
                lastModified: Date.now(),
                state: state
            };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                // console.log("Autosaved state", new Date().toLocaleTimeString());
            } catch (e) {
                console.warn("Autosave failed (quota exceeded?)", e);
            }
        }, 1000); // 1-second debounce

        return () => clearTimeout(handler);
    }, [state]);
};

export const loadAutoSave = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved);
        if (parsed.version !== 1) return null; // Version mismatch safety
        return parsed.state;
    } catch (e) {
        console.warn("Failed to load autosave", e);
        return null;
    }
};

export const clearAutoSave = () => {
    localStorage.removeItem(STORAGE_KEY);
};
