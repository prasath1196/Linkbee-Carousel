import React from 'react';
import { Hexagon, Zap, Layout, Download, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage({ onLogin }) {
    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif' }}>

            {/* --- NAVBAR --- */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Hexagon size={18} color="white" fill="white" fillOpacity={0.2} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>LinkBee</span>
                </div>

                <button
                    onClick={onLogin}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    Log In
                </button>
            </nav>

            {/* --- HERO SECTION --- */}
            <header style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    display: 'inline-block', padding: '6px 16px', borderRadius: '30px',
                    background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    ✨ AI-Powered LinkedIn Growth
                </div>

                <h1 style={{
                    fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem',
                    background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    Create Viral Carousels <br /> in <span style={{ color: '#3b82f6', WebkitTextFillColor: '#3b82f6' }}>Seconds, Not Hours.</span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
                    Stop wrestling with Canva. Let LinkBee's AI write, design, and format your carousel automatically.
                </p>

                <button
                    onClick={onLogin}
                    className="hero-btn"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white',
                        padding: '16px 40px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                        boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)', display: 'inline-flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    Start Creating for Free <ArrowRight size={20} />
                </button>

                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>No credit card required • Unlimited drafts</p>
            </header>

            {/* --- PREVIEW IMAGE (CSS Mockup) --- */}
            <div style={{
                maxWidth: '1000px', margin: '0 auto 6rem', padding: '20px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px'
            }}>
                <div style={{ width: '100%', height: '400px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {/* Fake UI Elements */}
                    <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 60, background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}></div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ width: 200, height: 250, background: '#334155', borderRadius: '8px', transform: 'rotate(-5deg)', opacity: 0.5 }}></div>
                        <div style={{ width: 200, height: 250, background: '#3b82f6', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            Your Viral Slide 🚀
                        </div>
                        <div style={{ width: 200, height: 250, background: '#334155', borderRadius: '8px', transform: 'rotate(5deg)', opacity: 0.5 }}></div>
                    </div>
                </div>
            </div>

            {/* --- FEATURES GRID --- */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 6rem', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <FeatureCard
                        icon={Zap} title="AI Writing"
                        desc="Just enter a topic. LinkBee generates the hook, bullets, and CTA for you."
                    />
                    <FeatureCard
                        icon={Layout} title="Auto-Design"
                        desc="Choose from viral templates. We handle fonts, colors, and layout instantly."
                    />
                    <FeatureCard
                        icon={Download} title="PDF Export"
                        desc="Download high-res PDFs ready to upload directly to LinkedIn."
                    />
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer style={{ borderTop: '1px solid #1e293b', padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                <p>&copy; {new Date().getFullYear()} LinkBee. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Helper Component for Features
const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}>
        <div style={{
            width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
        }}>
            <Icon size={24} color="#3b82f6" />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '700' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{desc}</p>
    </div>
);
