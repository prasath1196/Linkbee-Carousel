import React from 'react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, User, Hexagon } from 'lucide-react';
import { logout } from '../firebase';

export default function Sidebar({ currentView, setView, userProfile }) {

    const NavItem = ({ view, icon: Icon, label }) => (
        <button
            onClick={() => setView(view)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                background: currentView === view ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: currentView === view ? '3px solid #3b82f6' : '3px solid transparent',
                color: currentView === view ? '#3b82f6' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: currentView === view ? '600' : '500',
                textAlign: 'left',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            background: '#0f172a',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0, top: 0,
            zIndex: 50
        }}>
            {/* BRANDING LOGO */}
            <div style={{ padding: '2rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                    <Hexagon size={24} color="white" fill="white" fillOpacity={0.2} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 style={{
                        fontSize: '1.1rem',
                        margin: 0,
                        fontWeight: '800',
                        color: 'white',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.1'
                    }}>
                        Linkbee
                    </h1>
                    <span style={{
                        fontSize: '0.75rem',
                        color: '#94a3b8',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Carousel
                    </span>
                </div>
            </div>

            {/* NAVIGATION */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <NavItem view="dashboard" icon={LayoutDashboard} label="Projects" />
                <NavItem view="settings" icon={Settings} label="Settings" />
            </div>

            {/* USER PROFILE */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                    {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #334155' }} />
                    ) : (
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} color="white" />
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userProfile?.displayName || 'Creator'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{userProfile?.role || 'Free Plan'}</div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                        fontSize: '0.85rem', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', width: '100%', justifyContent: 'center', fontWeight: '600'
                    }}
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    );
}
