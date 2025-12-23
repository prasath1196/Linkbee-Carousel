import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../services/db';

export default function ProjectList({ isOpen, onClose, onLoadProject }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch projects when modal opens
    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const list = await getAllProjects();
            // Sort by newest first
            const sorted = list.sort((a, b) => b.updatedAt - a.updatedAt);
            setProjects(sorted);
        } catch (e) {
            console.error("Failed to load projects", e);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (ts) => new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isOpen) return null;

    return (
        <div className="settings-overlay">
            <div className="settings-modal" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>📂 My Projects</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading projects...</p>
                    ) : projects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', border: '1px dashed #334155', borderRadius: '8px' }}>
                            No saved projects found.
                        </div>
                    ) : (
                        projects.map(p => (
                            <div key={p.id} style={itemStyle}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>
                                        {p.topic || "Untitled Project"}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '1rem' }}>
                                        <span>📅 {formatDate(p.updatedAt)}</span>
                                        <span style={{
                                            background: p.step === 'preview' ? '#10b981' : '#3b82f6',
                                            color: 'black',
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {p.step.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onLoadProject(p)}
                                    className="primary-btn"
                                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                >
                                    Load &rarr;
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#0f172a',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #334155'
};
