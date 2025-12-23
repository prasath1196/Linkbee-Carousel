import React from 'react';

export default function StructureEditor({ structure, setStructure, onNext, onBack }) {

    const updateSlide = (index, field, value) => {
        const newStructure = [...structure];
        newStructure[index][field] = value;
        setStructure(newStructure);
    };

    const addSlide = () => {
        const newId = structure.length + 1;
        setStructure([...structure, { id: newId, title: "New Slide", purpose: "Enter purpose" }]);
    };

    const removeSlide = (index) => {
        const newStructure = structure.filter((_, i) => i !== index);
        setStructure(newStructure);
    };

    const moveSlide = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === structure.length - 1) return;

        const newStructure = [...structure];
        const temp = newStructure[index];
        newStructure[index] = newStructure[index + direction];
        newStructure[index + direction] = temp;
        setStructure(newStructure);
    };

    return (
        <div className="structure-editor">
            <h2>🧱 Edit Outline</h2>
            <p className="subtitle">Refine your story flow before generating content.</p>

            <div className="structure-list">
                {structure.map((slide, index) => (
                    <div key={index} className="structure-item">
                        <div className="slide-badge">{index + 1}</div>
                        <div className="slide-inputs" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="slide-title-input"
                                value={slide.title}
                                onChange={(e) => updateSlide(index, 'title', e.target.value)}
                                placeholder="Slide Title"
                                style={{ width: '100%', fontSize: '1.1rem', padding: '0.5rem' }}
                            />
                            <input
                                type="text"
                                className="slide-purpose-input"
                                value={slide.purpose}
                                onChange={(e) => updateSlide(index, 'purpose', e.target.value)}
                                placeholder="Purpose of this slide"
                                style={{ width: '100%', fontSize: '0.9rem', color: '#666', padding: '0.4rem' }}
                            />
                        </div>
                        <div className="slide-actions">
                            <button onClick={() => moveSlide(index, -1)} disabled={index === 0}>⬆️</button>
                            <button onClick={() => moveSlide(index, 1)} disabled={index === structure.length - 1}>⬇️</button>
                            <button onClick={() => removeSlide(index)} className="delete-btn">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="add-slide-btn" onClick={addSlide}>+ Add Slide</button>

            <div className="wizard-navigation">
                <button className="secondary-btn" onClick={onBack}>Back</button>
                <button className="primary-btn" onClick={onNext}>Continue to Content &rarr;</button>
            </div>
        </div>
    );
}
