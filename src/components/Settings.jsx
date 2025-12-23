import React, { useState, useEffect } from 'react';

export default function Settings({ isOpen, onClose, onSave }) {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);
    }, [isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            alert("Please enter a valid API Key");
            return;
        }
        localStorage.setItem('gemini_api_key', apiKey.trim());
        onSave();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="settings-overlay">
            <div className="settings-modal" style={{ backgroundColor: '#1e293b', color: '#fff' }}>
                <div className="settings-header">
                    <h2>⚙️ Settings</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="settings-content">
                    <label>Google Gemini API Key</label>
                    <p className="description">
                        Your key is stored locally in your browser.
                        Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
                    </p>

                    <div className="input-with-icon">
                        <input
                            type={showKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API Key..."
                        />
                        <button onClick={() => setShowKey(!showKey)} className="eye-btn">
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="save-btn" onClick={handleSave}>Save Key</button>
                </div>
            </div>
        </div>
    );
}
