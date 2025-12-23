import React, { useRef, useEffect } from 'react';
import { simpleMarkdownToHtml } from '../utils/markdown';

const SlidePreview = ({ slide, index, theme, font, designSettings, onUpdate }) => {
    const titleRef = useRef(null);
    const contentRef = useRef(null);

    // Initial Render: Convert Markdown to HTML securely
    useEffect(() => {
        if (titleRef.current && slide.title) {
            // Only update if empty to prevent cursor jumping on every re-render
            // For a real production app, we'd need a better controlled contentEditable component
            if (titleRef.current.innerHTML === '') {
                titleRef.current.innerHTML = simpleMarkdownToHtml(slide.title);
            }
        }
    }, []); // Run once on mount

    useEffect(() => {
        if (contentRef.current && slide.content) {
            // Basic list rendering
            const listHtml = slide.content.map(point => `<li>${simpleMarkdownToHtml(point)}</li>`).join('');
            if (contentRef.current.innerHTML === '') {
                contentRef.current.innerHTML = `<ul style="list-style-position: inside; padding: 0 1rem; margin: 0;">${listHtml}</ul>`;
            }
        }
    }, []);

    // Sync contentEditable changes back to parent
    const handleBlur = () => {
        if (titleRef.current) {
            onUpdate(index, { ...slide, title: titleRef.current.innerText });
        }
        if (contentRef.current) {
            // Extract text from list items
            const listItems = contentRef.current.querySelectorAll('li');
            const lines = Array.from(listItems).map(li => li.innerText).filter(t => t.trim() !== '');
            // Fallback for direct text editing outside UL
            if (lines.length === 0) {
                const rawText = contentRef.current.innerText.split('\n').filter(l => l.trim() !== '');
                onUpdate(index, { ...slide, content: rawText });
            } else {
                onUpdate(index, { ...slide, content: lines });
            }
        }
    };

    // Rich Text Actions
    const execCmd = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* FLOATING TOOLBAR */}
            <div className="rich-toolbar" style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#1e293b',
                padding: '5px 10px',
                borderRadius: '8px',
                display: 'flex',
                gap: '5px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                zIndex: 10,
                opacity: 0,
                transition: 'opacity 0.2s'
            }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0} // Show on hover
            >
                <button onClick={() => execCmd('bold')} style={{ fontWeight: 'bold' }}>B</button>
                <button onClick={() => execCmd('italic')} style={{ fontStyle: 'italic' }}>I</button>
                <input
                    type="color"
                    onChange={(e) => execCmd('foreColor', e.target.value)}
                    style={{ width: '25px', height: '25px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    title="Text Color"
                />
            </div>

            {/* Show toolbar hint on hover of card */}
            <div
                className="slide-card"
                onMouseEnter={(e) => {
                    const toolbar = e.currentTarget.previousSibling;
                    if (toolbar) toolbar.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                    const toolbar = e.currentTarget.previousSibling;
                    if (toolbar) toolbar.style.opacity = 0;
                }}
                style={{
                    backgroundColor: theme.card,
                    border: `1px solid ${theme.border}`,
                    boxShadow: `0 4px 6px -1px ${theme.border}`,
                    fontFamily: font.family,
                    aspectRatio: '4 / 5',
                    width: '100%',
                    maxWidth: '540px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <div className="slide-number" style={{ color: theme.accent }}>{index + 1}</div>

                <h2
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleBlur}
                    style={{
                        borderBottom: `2px solid ${theme.accent}`,
                        fontSize: designSettings.titleSize,
                        textAlign: designSettings.textAlign,
                        marginBottom: '1rem',
                        outline: 'none',
                        cursor: 'text'
                    }}
                >
                    {/* Content injected via useEffect */}
                </h2>

                <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={handleBlur}
                    style={{
                        flex: 1,
                        outline: 'none',
                        cursor: 'text',
                        fontSize: designSettings.contentSize,
                        lineHeight: designSettings.lineHeight,
                        textAlign: designSettings.textAlign
                    }}
                >
                    {/* Content injected via useEffect */}
                </div>

                <div className="visual-cue" style={{
                    backgroundColor: theme.bg,
                    marginTop: 'auto',
                    fontSize: '0.8rem'
                }}>
                    <strong>🖼 Visual Idea:</strong> {slide.visual}
                </div>
            </div>
        </div>
    );
};

export default SlidePreview;
