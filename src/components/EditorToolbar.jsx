import React from 'react';

/**
 * EditorToolbar
 * 
 * Context-aware toolbar for the FreeForm Editor.
 * Shows different options based on the currently selected element type.
 */
import { THEMES } from '../constants/themes';

const FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Outfit', value: 'Outfit, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Playfair', value: 'Playfair Display, serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
];

export default function EditorToolbar({ selectedElement, onUpdateElement, activeSlide, onUpdateSlide, onApplyTheme, onUpdateGlobal }) {
    // If no element selected, show slide-level theme controls
    if (!selectedElement) {
        return (
            <div style={toolbarStyle}>
                <div style={groupStyle}>
                    <span style={headerStyle}>Theme Presets</span>
                </div>

                {/* THEME SELECTOR */}
                <div style={groupStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => onApplyTheme && onApplyTheme(t.id)}
                                title={t.name}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: t.backgroundColor,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: '12px', height: '12px',
                                    backgroundColor: t.accentColor,
                                    borderTopLeftRadius: '12px'
                                }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0', margin: '0 10px' }}></div>

                {/* NEW: GLOBAL FONT & BG */}
                <div style={groupStyle}>
                    <span style={headerStyle}>Global Styles</span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={labelStyle}>All Fonts</label>
                        <select
                            onChange={(e) => onUpdateGlobal && onUpdateGlobal('fontFamily', e.target.value)}
                            style={{ ...selectStyle, width: '120px' }}
                        >
                            <option value="">Select Font...</option>
                            {FONTS.map(f => (
                                <option key={f.name} value={f.value}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={labelStyle}>All BGs</label>
                        <input
                            type="color"
                            // Use active slide BG as indicator, but applying changes ALL
                            value={activeSlide?.backgroundColor || '#ffffff'}
                            onChange={(e) => onUpdateGlobal && onUpdateGlobal('backgroundColor', e.target.value)}
                            style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
                            title="Click to change ALL slides background"
                        />
                    </div>
                </div>

                {/* SLIDE SPECIFIC OVERRIDES (Optional, can keep if you want mix-and-match) */}
                <div style={{ marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid #eee', ...groupStyle }}>
                    <span style={{ ...headerStyle, color: '#94a3b8' }}>Current Slide Only</span>
                    <input
                        type="color"
                        value={activeSlide?.backgroundColor || '#ffffff'}
                        onChange={(e) => onUpdateSlide && onUpdateSlide({ ...activeSlide, backgroundColor: e.target.value })}
                        style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
                        title="Override background for THIS slide only"
                    />
                </div>

            </div>
        );
    }

    const { type } = selectedElement;

    const handleChange = (key, value) => {
        onUpdateElement({ [key]: value });
    };

    return (
        <div style={toolbarStyle}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={headerStyle}>
                    {type} Properties
                </span>

                {/* TEXT OPTIONS */}
                {type === 'text' && (
                    <>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Font</label>
                            <select
                                value={selectedElement.fontFamily}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                style={{ ...selectStyle, width: '120px' }}
                            >
                                {FONTS.map(f => (
                                    <option key={f.name} value={f.value}>{f.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}>Size</label>
                            <input
                                type="number"
                                value={selectedElement.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                style={inputStyle}
                            />
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}>Weight</label>
                            <select
                                value={selectedElement.fontWeight || '400'}
                                onChange={(e) => handleChange('fontWeight', e.target.value)}
                                style={selectStyle}
                            >
                                <option value="300">Light</option>
                                <option value="400">Regular</option>
                                <option value="600">Semibold</option>
                                <option value="800">Bold</option>
                            </select>
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}>Align</label>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {['left', 'center', 'right'].map(align => (
                                    <button
                                        key={align}
                                        onClick={() => handleChange('textAlign', align)}
                                        style={{
                                            ...btnStyle,
                                            backgroundColor: selectedElement.textAlign === align ? '#e2e8f0' : 'transparent'
                                        }}
                                    >
                                        {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}>Color</label>
                            <input
                                type="color"
                                value={selectedElement.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'none' }}
                            />
                        </div>

                        <div style={groupStyle}>
                            <label style={labelStyle}>Layer</label>
                            <input
                                type="number"
                                value={selectedElement.zIndex || 1}
                                onChange={(e) => handleChange('zIndex', parseInt(e.target.value))}
                                style={{ ...inputStyle, width: '40px' }}
                            />
                        </div>
                    </>
                )}

                {/* IMAGE OPTIONS */}
                {type === 'image' && (
                    <div style={groupStyle}>
                        <label style={labelStyle}>Layer</label>
                        <input
                            type="number"
                            value={selectedElement.zIndex || 1}
                            onChange={(e) => handleChange('zIndex', parseInt(e.target.value))}
                            style={{ ...inputStyle, width: '40px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Styles
const toolbarStyle = {
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    zIndex: 100,
    position: 'sticky',
    top: 0
};

const headerStyle = {
    fontWeight: '800',
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginRight: '1rem'
};

const groupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRight: '1px solid #f1f5f9',
    paddingRight: '1rem'
};

const labelStyle = {
    fontSize: '0.7rem',
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase'
};

const inputStyle = {
    padding: '4px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    width: '60px',
    fontSize: '0.9rem',
    color: '#334155'
};

const selectStyle = {
    padding: '4px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.9rem',
    background: 'white',
    color: '#334155',
    cursor: 'pointer'
};

const btnStyle = {
    padding: '4px 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#334155'
};
