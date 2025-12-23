import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('gemini_api_key');
        if (stored) setApiKey(stored);
    }, []);

    const handleSave = () => {
        if (!apiKey.trim()) return toast.error("Please enter a valid key");
        localStorage.setItem('gemini_api_key', apiKey.trim());
        toast.success("API Key saved successfully!");
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1e293b' }}>Settings</h2>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '1rem' }}>AI Configuration</h3>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' }}>Google Gemini API Key</label>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                    Your key is stored locally in your browser for privacy.
                </p>

                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}
                />

                <button className="primary-btn" onClick={handleSave}>Save Changes</button>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                <a href="#" style={{ color: '#64748b', marginRight: '1rem' }}>Terms of Service</a>
                <a href="#" style={{ color: '#64748b' }}>Privacy Policy</a>
            </div>
        </div>
    );
}
