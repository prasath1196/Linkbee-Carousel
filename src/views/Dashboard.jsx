import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../services/db';
import { Loader, ShimmerCard } from '../components/ui/Loader';
import { Clock, ArrowRight, FileText } from 'lucide-react';

export default function Dashboard({ onLoadProject, onNewProject, userName }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const list = await getAllProjects();
            setProjects(list.sort((a, b) => b.updatedAt - a.updatedAt));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1e293b', fontWeight: '800', letterSpacing: '-0.03em' }}>
                        Hello, {userName?.split(' ')[0] || 'Creator'} 👋
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Ready to create your next viral carousel?</p>
                </div>
                <button className="primary-btn" onClick={onNewProject} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>+</span> Create New
                </button>
            </header>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {[1, 2, 3].map(i => <ShimmerCard key={i} />)}
                </div>
            ) : projects.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '6rem 2rem',
                    border: '2px dashed #e2e8f0',
                    borderRadius: '24px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: '#eff6ff', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <FileText size={40} color="#3b82f6" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>No projects yet</h3>
                    <p style={{ color: '#64748b', marginBottom: '2rem', maxWidth: '300px' }}>Create your first viral carousel in seconds using AI.</p>
                    <button className="primary-btn" onClick={onNewProject} style={{ padding: '12px 32px' }}>
                        + Create First Project
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                    {projects.map(p => (
                        <div
                            key={p.id}
                            onClick={() => onLoadProject(p)}
                            className="project-card"
                            style={{
                                background: 'white', padding: '1.5rem', borderRadius: '16px',
                                border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                                display: 'flex', flexDirection: 'column', height: '200px'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.title || p.topic || "Untitled Project"}
                                </h3>
                                <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontWeight: '600' }}>
                                    {p.step.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    <Clock size={14} /> {formatDate(p.updatedAt)}
                                </span>
                                <ArrowRight size={16} color="#cbd5e1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
