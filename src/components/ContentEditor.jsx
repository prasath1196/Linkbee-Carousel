import React, { useState } from 'react';
import { logTokenUsage } from '../services/db';

import { regenerateSingleSlide, expandBulletPoint } from '../services/ai';

function ContentEditor({ slides, setSlides, onBack, onNext }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    const activeSlide = slides[activeIndex] || { title: '', content: [], visual: '' };
    const topic = "this presentation";

    const handleUpdate = (field, value) => {
        const newSlides = [...slides];
        newSlides[activeIndex] = { ...newSlides[activeIndex], [field]: value };
        setSlides(newSlides);
    };

    const handleBulletUpdate = (bulletIndex, value) => {
        const newSlides = [...slides];
        const newContent = [...newSlides[activeIndex].content];
        newContent[bulletIndex] = value;
        newSlides[activeIndex].content = newContent;
        setSlides(newSlides);
    };

    const handleRegenerateSlide = async () => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) return alert("Please set API Key in settings");

        setIsGenerating(true);
        try {
            const { data, usage } = await regenerateSingleSlide(activeSlide, topic, apiKey);

            if (usage) {
                await logTokenUsage('regenerate_slide', usage.promptTokenCount, usage.candidatesTokenCount);
            }

            const newSlides = [...slides];
            newSlides[activeIndex] = { ...newSlides[activeIndex], ...data };
            setSlides(newSlides);
        } catch (e) {
            console.error(e);
            alert("Failed to regenerate slide");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMagicBullet = async (index) => {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) return alert("Please set API Key in settings");

        const currentText = activeSlide.content[index];
        if (!currentText) return;

        handleBulletUpdate(index, "✨ Improving...");

        try {
            const { data, usage } = await expandBulletPoint(currentText, activeSlide.title, topic, apiKey);

            if (usage) {
                await logTokenUsage('expand_bullet', usage.promptTokenCount, usage.candidatesTokenCount);
            }

            handleBulletUpdate(index, data);
        } catch (e) {
            console.error(e);
            handleBulletUpdate(index, currentText);
        }
    };

    const addBullet = () => {
        const newSlides = [...slides];
        newSlides[activeIndex].content.push("New point...");
        setSlides(newSlides);
    };

    const removeBullet = (bulletIndex) => {
        const newSlides = [...slides];
        newSlides[activeIndex].content = newSlides[activeIndex].content.filter((_, i) => i !== bulletIndex);
        setSlides(newSlides);
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', height: '600px' }}>
            {/* Sidebar List */}
            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {slides.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        style={{
                            padding: '1rem',
                            textAlign: 'left',
                            background: activeIndex === i ? '#334155' : '#1e293b',
                            border: activeIndex === i ? '1px solid #0284c7' : '1px solid #334155',
                            color: activeIndex === i ? '#fff' : '#94a3b8',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>SLIDE {i + 1}</div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.title}
                        </div>
                    </button>
                ))}
            </div>

            {/* Editor Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>

                {/* Title */}
                <div className="input-group" style={{ maxWidth: '100%', margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ margin: 0 }}>Slide Title</label>
                        <button
                            onClick={handleRegenerateSlide}
                            disabled={isGenerating}
                            style={{ fontSize: '0.8rem', padding: '4px 8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                        >
                            {isGenerating ? '🤖 Thinking...' : '✨ Regenerate Entire Slide'}
                        </button>
                    </div>
                    <input
                        type="text"
                        value={activeSlide.title}
                        onChange={(e) => handleUpdate('title', e.target.value)}
                        style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '100%', padding: '0.8rem' }}
                    />
                </div>

                {/* Bullets */}
                <div className="input-group" style={{ maxWidth: '100%', margin: 0 }}>
                    <label>Bullet Points</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {activeSlide.content.map((point, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <textarea
                                    value={point}
                                    onChange={(e) => handleBulletUpdate(i, e.target.value)}
                                    style={{ flex: 1, padding: '0.8rem', minHeight: '60px', resize: 'vertical', width: '100%' }}
                                    rows={2}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <button
                                        onClick={() => handleMagicBullet(i)}
                                        title="AI Improve"
                                        style={{ color: '#fff', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '4px', padding: '0 10px', height: '40px', cursor: 'pointer' }}
                                    >
                                        ✨
                                    </button>
                                    <button
                                        onClick={() => removeBullet(i)}
                                        style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent', borderRadius: '4px', padding: '0 10px', height: '40px', cursor: 'pointer' }}
                                        title="Remove point"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addBullet}
                            style={{
                                padding: '0.8rem',
                                border: '1px dashed #475569',
                                color: '#94a3b8',
                                borderRadius: '4px',
                                background: 'transparent'
                            }}
                        >
                            + Add Bullet Point
                        </button>
                    </div>
                </div>

                {/* Visual Note */}
                <div className="input-group" style={{ maxWidth: '100%', margin: 0 }}>
                    <label>
                        Visual Idea <span style={{ fontWeight: 'normal', color: '#64748b' }}>(Hidden from final PDF)</span>
                    </label>
                    <textarea
                        value={activeSlide.visual}
                        onChange={(e) => handleUpdate('visual', e.target.value)}
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            background: '#0f172a',
                            border: '1px solid #334155',
                            color: '#e2e8f0',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            {/* Actions Footer (Absolute or simply below) */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '1rem', background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
                <button className="secondary-btn" onClick={onBack}>&larr; Back to Structure</button>
                <button className="primary-btn" onClick={onNext}>Preview Design &rarr;</button>
            </div>
        </div>
    );
}

export default ContentEditor;
