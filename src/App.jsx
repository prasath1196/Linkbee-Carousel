import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './App.css';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import SettingsPage from './views/SettingsPage';

import StructureEditor from './components/StructureEditor';
import ContentEditor from './components/ContentEditor';
import Stepper from './components/Stepper';
import { generateStructure, generateSlideContent } from './services/ai';
import { useAutoSave, loadAutoSave, clearAutoSave } from './hooks/useAutoSave';
import FreeFormSlide from './components/FreeFormSlide';
import EditorToolbar from './components/EditorToolbar';
import { aiToCanvasElements } from './utils/elementConverter';

import { logTokenUsage, saveProject, getUserProfile } from './services/db';
import { auth } from './firebase';

import { THEMES } from './constants/themes';

import ConfirmationModal from './components/ui/ConfirmationModal';

function App() {
    // Initial State
    const savedState = loadAutoSave();

    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'editor', 'settings'
    const [userProfile, setUserProfile] = useState(null);

    const [step, setStep] = useState(savedState?.step || 'ideation');
    const [topic, setTopic] = useState(savedState?.topic || '');
    const [structure, setStructure] = useState(savedState?.structure || []);
    const [slides, setSlides] = useState(savedState?.slides || []);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // CONFIRMATION MODAL STATE
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false
    });

    const askConfirmation = ({ title, message, onConfirm, isDanger = false }) => {
        setConfirmState({ isOpen: true, title, message, onConfirm, isDanger });
    };

    // Enable Auto-Save
    useAutoSave({ step, topic, structure, slides });

    // Editor State
    const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [currentLayoutTheme, setCurrentLayoutTheme] = useState(THEMES[1]); // Default to Modern Dark

    useEffect(() => {
        // Fetch User Profile for Sidebar
        if (auth.currentUser) {
            getUserProfile(auth.currentUser.uid).then(setUserProfile);
        }
    }, []);

    // Apply a global formatting theme to all slides
    const updateGlobalStyle = (field, value) => {
        const updatedSlides = slides.map(slide => {
            let newSlide = { ...slide };
            if (field === 'backgroundColor') {
                newSlide.backgroundColor = value;
            }
            if (field === 'fontFamily') {
                if (newSlide.elements) {
                    newSlide.elements = newSlide.elements.map(el => {
                        if (el.type === 'text') {
                            return { ...el, fontFamily: value };
                        }
                        return el;
                    });
                }
            }
            return newSlide;
        });
        setSlides(updatedSlides);
    };

    // Apply a global formatting theme to all slides
    const applyGlobalTheme = (themeId) => {
        const themeConfig = THEMES.find(t => t.id === themeId) || THEMES[1];
        setCurrentLayoutTheme(themeConfig);
        const updatedSlides = slides.map((slide, index) => {
            return aiToCanvasElements(slide, index, themeConfig);
        });
        setSlides(updatedSlides);
    };

    const [exporting, setExporting] = useState(false);

    const handleSaveProject = async () => {
        const toastId = toast.loading('Saving project...');
        try {
            const project = {
                id: savedState?.id, // Preserve ID if editing an existing project
                topic,
                structure,
                slides,
                step,
                layoutTheme: currentLayoutTheme,
                savedAt: Date.now()
            };
            await saveProject(project);
            toast.success('Project saved!', { id: toastId });
        } catch (e) {
            console.error("Save Error:", e);
            toast.error('Failed to save.', { id: toastId });
        }
    };

    const handleLoadProject = (project) => {
        setTopic(project.topic);
        setStructure(project.structure || []);
        setSlides(project.slides || []);
        if (project.layoutTheme) setCurrentLayoutTheme(project.layoutTheme);
        setStep(project.step);
        setCurrentView('editor'); // Switch view
    };

    const handleReset = () => {
        askConfirmation({
            title: "Start New Project?",
            message: "This will clear your current workspace. Make sure you have saved your work first.",
            isDanger: true,
            onConfirm: () => {
                clearAutoSave();
                setStep('ideation');
                setTopic('');
                setStructure([]);
                setSlides([]);
                setCurrentView('editor');
            }
        });
    };

    // --- STEP 1: IDEATION ---
    const handleIdeation = async () => {
        if (!topic) return;
        const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.GEMINI_KEY;

        if (!apiKey) {
            toast.error("API Key missing. Go to Settings.");
            setCurrentView('settings');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { data, usage } = await generateStructure(topic, apiKey);
            if (usage) {
                await logTokenUsage('generate_structure', usage.promptTokenCount, usage.candidatesTokenCount);
            }
            setStructure(data);
            setStep('structure');
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to generate structure.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: STRUCTURE ---
    const handleStructureConfirmed = async () => {
        let newSlides = [...slides];
        if (structure.length > newSlides.length) {
            const numToAdd = structure.length - newSlides.length;
            for (let i = 0; i < numToAdd; i++) {
                newSlides.push({
                    title: structure[newSlides.length].title,
                    content: ["Add your content here..."],
                    visual: "Placeholder Visual",
                });
            }
        } else if (structure.length < newSlides.length) {
            newSlides = newSlides.slice(0, structure.length);
        }

        newSlides = newSlides.map((slide, i) => ({
            ...slide,
            title: structure[i].title || slide.title
        }));

        setSlides(newSlides);

        if (slides.length === 0) {
            await generateContent();
        } else {
            setStep('content');
        }
    };

    const generateContent = async () => {
        const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.GEMINI_KEY;

        // Ensure key exists (redundant check but safe)
        if (!apiKey) {
            toast.error("API Key missing.");
            return;
        }

        setLoading(true);
        try {
            const { data, usage } = await generateSlideContent(structure, apiKey);
            if (usage) {
                await logTokenUsage('generate_content', usage.promptTokenCount, usage.candidatesTokenCount);
            }
            setSlides(data);
            setStep('content');
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to generate content.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 3: CONTENT ---
    const handleContentConfirmed = () => {
        const styledSlides = slides.map((slide, index) => {
            if (slide.elements) return slide;
            return aiToCanvasElements(slide, index, currentLayoutTheme);
        });
        setSlides(styledSlides);
        setStep('preview');
    };

    const downloadPDF = async () => {
        if (slides.length === 0) return;
        setExporting(true);
        const toastId = toast.loading('Generating PDF...');

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [1080, 1350]
            });

            for (let i = 0; i < slides.length; i++) {
                const element = document.getElementById(`export-slide-${i}`);
                if (!element) continue;

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: currentLayoutTheme.bg
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage([1080, 1350], 'portrait');
                pdf.addImage(imgData, 'PNG', 0, 0, 1080, 1350);
            }

            pdf.save(`${topic.replace(/\s+/g, '_')}_slides.pdf`);
            toast.success('PDF Downloaded!', { id: toastId });
        } catch (err) {
            console.error(err);
            setError(`Failed to generate slides. Error: ${err.message || err}`);
            toast.error('PDF Export Failed', { id: toastId });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Toaster position="top-center" />

            {/* LEFT SIDEBAR */}
            <Sidebar
                currentView={currentView}
                setView={setCurrentView}
                userProfile={userProfile}
            />

            {/* MAIN CONTENT AREA */}
            <main style={{
                marginLeft: '260px',
                flex: 1,
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* VIEW 1: DASHBOARD */}
                {currentView === 'dashboard' && (
                    <Dashboard
                        onLoadProject={handleLoadProject}
                        onNewProject={() => {
                            handleReset();
                            setCurrentView('editor');
                        }}
                        userName={userProfile?.displayName}
                    />
                )}

                {/* VIEW 2: SETTINGS */}
                {currentView === 'settings' && <SettingsPage />}

                {/* VIEW 3: EDITOR */}
                {currentView === 'editor' && (
                    <div className="editor-container" style={{ padding: '0', background: 'var(--background-gradient)', minHeight: '100vh' }}>
                        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                            {/* EDITOR HEADER ACTIONS */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => setCurrentView('dashboard')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '5px 10px',
                                        borderRadius: '6px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    &larr; Back to Dashboard
                                </button>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {step !== 'ideation' && (
                                        <button
                                            onClick={handleReset}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ef4444',
                                                color: '#ef4444',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️ Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* WIZARD CONTENT */}
                            {step !== 'preview' && <Stepper currentStep={step} />}

                            {/* STEP 1: IDEATION */}
                            {step === 'ideation' && (
                                <div className="wizard-step fade-in">
                                    <div className="input-group">
                                        <label style={{ fontSize: '1.2rem' }}>What do you want to create?</label>
                                        <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                            Enter a topic OR paste your blog post / article (max 10,000 chars).
                                        </p>
                                        <textarea
                                            placeholder="e.g. 'How to mitigate risk in Kubernetes clusters' OR paste your full article here..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value.slice(0, 10000))}
                                            rows={6}
                                            style={{ padding: '1rem', fontSize: '1rem', width: '100%', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical' }}
                                        />
                                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            {topic.length}/10000 characters
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                        {structure.length > 0 && (
                                            <button className="primary-btn" onClick={() => setStep('structure')} style={{ backgroundColor: currentLayoutTheme.accent, flex: 1 }}>
                                                Continue with Existing Draft &rarr;
                                            </button>
                                        )}
                                        <button className="generate-btn" onClick={handleIdeation} disabled={loading || !topic} style={{ backgroundColor: structure.length > 0 ? '#64748b' : currentLayoutTheme.accent, flex: 1 }}>
                                            {loading ? 'Thinking...' : (structure.length > 0 ? '↻ Regenerate New Draft' : 'Start Draft &rarr;')}
                                        </button>
                                    </div>
                                    {error && <p className="error">{error}</p>}
                                </div>
                            )}

                            {/* STEP 2: STRUCTURE */}
                            {step === 'structure' && (
                                <div className="wizard-step fade-in">
                                    <StructureEditor
                                        structure={structure}
                                        setStructure={setStructure}
                                        onBack={() => setStep('ideation')}
                                        onNext={handleStructureConfirmed}
                                    />
                                    {slides.length > 0 && !loading && (
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <button onClick={() => {
                                                askConfirmation({
                                                    title: "Regenerate Content?",
                                                    message: "This will overwrite your current slides. Are you sure?",
                                                    onConfirm: () => generateContent(),
                                                    isDanger: true
                                                });
                                            }} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                ↻ Regenerate Content from Scratch
                                            </button>
                                        </div>
                                    )}
                                    {loading && <p style={{ textAlign: 'center', marginTop: '1rem' }}>Generating initial content...</p>}
                                </div>
                            )}

                            {/* STEP 3: CONTENT */}
                            {step === 'content' && (
                                <div className="wizard-step fade-in">
                                    <ContentEditor
                                        slides={slides}
                                        setSlides={setSlides}
                                        onBack={() => setStep('structure')}
                                        onNext={handleContentConfirmed}
                                    />
                                </div>
                            )}

                            {/* STEP 4: PREVIEW (EDITOR 2.0) */}
                            {step === 'preview' && slides.length > 0 && (
                                <div className="editor-layout" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                                    <EditorToolbar
                                        selectedElement={selectedElementId ? slides[selectedSlideIndex].elements.find(e => e.id === selectedElementId) : null}
                                        activeSlide={slides[selectedSlideIndex]}
                                        onApplyTheme={applyGlobalTheme}
                                        onUpdateGlobal={updateGlobalStyle}
                                        onUpdateSlide={(updatedSlide) => {
                                            const newSlides = [...slides];
                                            newSlides[selectedSlideIndex] = updatedSlide;
                                            setSlides(newSlides);
                                        }}
                                        onUpdateElement={(changes) => {
                                            const newSlides = [...slides];
                                            const slide = newSlides[selectedSlideIndex];
                                            slide.elements = slide.elements.map(el => el.id === selectedElementId ? { ...el, ...changes } : el);
                                            setSlides(newSlides);
                                        }}
                                    />
                                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                                        {/* FILMSTRIP */}
                                        <div style={{ width: '220px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#64748b' }}>Slides</h3>
                                            {slides.map((s, i) => (
                                                <div key={i} onClick={() => { setSelectedSlideIndex(i); setSelectedElementId(null); }} style={{ cursor: 'pointer', outline: selectedSlideIndex === i ? '3px solid #3b82f6' : '1px solid #cbd5e1', borderRadius: '4px', position: 'relative', height: '270px', overflow: 'hidden', flexShrink: 0 }}>
                                                    <div style={{ transform: 'scale(0.18)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                                                        <FreeFormSlide slide={s} scale={1} isEditable={false} />
                                                    </div>
                                                    <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{i + 1}</div>
                                                </div>
                                            ))}
                                            <button style={{ padding: '0.5rem', border: '1px dashed #cbd5e1', color: '#64748b', borderRadius: '4px', cursor: 'not-allowed' }}> + Add Slide (Coming Soon) </button>
                                        </div>
                                        {/* STAGE */}
                                        <div style={{ flex: 1, backgroundColor: '#e2e8f0', display: 'grid', placeItems: 'center', overflow: 'auto', padding: '3rem' }} onClick={() => setSelectedElementId(null)}>
                                            <div onClick={(e) => e.stopPropagation()} style={{ width: `${1080 * 0.45}px`, height: `${1350 * 0.45}px`, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', backgroundColor: 'white', flexShrink: 0 }}>
                                                <div style={{ width: '1080px', height: '1350px', transform: 'scale(0.45)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                                                    <FreeFormSlide slide={slides[selectedSlideIndex]} scale={1} isEditable={true} selectedElementId={selectedElementId} onSelect={setSelectedElementId} onUpdate={(updatedSlide) => { const newSlides = [...slides]; newSlides[selectedSlideIndex] = updatedSlide; setSlides(newSlides); }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* FOOTER */}
                                    <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button className="secondary-btn" onClick={() => setStep('content')}>&larr; Back to Content</button>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Editing Slide {selectedSlideIndex + 1} of {slides.length}</div>
                                        <button className="generate-btn" onClick={downloadPDF} disabled={exporting} style={{ backgroundColor: currentLayoutTheme.accent, width: 'auto' }}>{exporting ? 'Exporting...' : 'Download PDF'}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HIDDEN EXPORT CONTAINER */}
                <div style={{ position: 'fixed', left: '-10000px', top: 0, width: '1080px', height: '1350px', overflow: 'hidden' }}>
                    {slides.map((slide, index) => (
                        <div key={index} id={`export-slide-${index}`} style={{ position: 'absolute', top: 0, left: 0, width: '1080px', height: '1350px', backgroundColor: slide.backgroundColor || currentLayoutTheme.bg, color: currentLayoutTheme.content?.color || '#333333', padding: '60px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: currentLayoutTheme.fontFamily || 'Inter, sans-serif' }}>
                            <div style={{ position: 'relative', width: '100%', height: '100%', transform: 'scale(1)', transformOrigin: 'top left' }}>
                                <FreeFormSlide slide={slide} scale={1} isEditable={false} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* GLOBAL CONFIRMATION MODAL */}
                <ConfirmationModal
                    isOpen={confirmState.isOpen}
                    onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                    title={confirmState.title}
                    message={confirmState.message}
                    onConfirm={confirmState.onConfirm}
                    isDanger={confirmState.isDanger}
                />
            </main>
        </div>
    );
}

export default App;