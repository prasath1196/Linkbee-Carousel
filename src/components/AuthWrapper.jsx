import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { saveUserProfile, getUserProfile } from '../services/db';

import LandingPage from '../views/LandingPage';

export default function AuthWrapper({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Onboarding Form State
    const [role, setRole] = useState('Software Engineer');
    const [company, setCompany] = useState('');
    const [isJobSeeker, setIsJobSeeker] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check local DB for existing profile
                const savedProfile = await getUserProfile(currentUser.uid);
                setProfile(savedProfile);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (e) {
            alert("Login failed. Check console.");
        }
    };

    const handleOnboardingSubmit = async () => {
        if (!user) return;

        const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role,
            company,
            isJobSeeker,
            onboardedAt: Date.now()
        };

        await saveUserProfile(newProfile);
        setProfile(newProfile);
    };

    if (loading) return <div style={centerStyle}>Loading...</div>;

    // SCENARIO 1: NOT LOGGED IN
    if (!user) {
        return <LandingPage onLogin={handleLogin} />;
    }

    // SCENARIO 2: LOGGED IN BUT NO PROFILE (ONBOARDING)
    if (!profile) {
        return (
            <div style={centerStyle}>
                <div style={cardStyle}>
                    <h2>🚀 One last thing...</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Help us personalize your workspace.
                    </p>

                    {/* ROLE INPUT */}
                    <div style={inputGroupStyle}>
                        <label>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={inputStyle}
                        >
                            <option>Software Engineer</option>
                            <option>Recruiter / HR</option>
                            <option>Content Creator</option>
                            <option>Product Manager</option>
                            <option>Founder</option>
                            <option>Student</option>
                        </select>
                    </div>

                    {/* COMPANY INPUT */}
                    <div style={inputGroupStyle}>
                        <label>Company <span style={{ fontWeight: 'normal', color: '#64748b' }}>(Optional)</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Google, Startup Inc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* JOB SEEKER TOGGLE */}
                    <div style={{ ...inputGroupStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ margin: 0 }}>Are you a job seeker?</label>
                        <input
                            type="checkbox"
                            checked={isJobSeeker}
                            onChange={(e) => setIsJobSeeker(e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                    </div>

                    <button
                        onClick={handleOnboardingSubmit}
                        className="primary-btn"
                        style={{ width: '100%', marginTop: '1rem', background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Complete Setup &rarr;
                    </button>
                </div>
            </div>
        );
    }

    // SCENARIO 3: LOGGED IN & ONBOARDED
    return (
        <>
            <>
                {children}
            </>
        </>
    );
}

// STYLES
const centerStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' };
const cardStyle = { background: '#1e293b', padding: '3rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'left' };
const inputGroupStyle = { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1rem', marginTop: '0.5rem' };
const googleBtnStyle = { width: '100%', padding: '12px', background: 'white', color: '#333', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' };
const userInfoStyle = { position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, display: 'flex', gap: '0.8rem', alignItems: 'center', background: 'rgba(30, 41, 59, 0.8)', padding: '8px 16px', borderRadius: '20px', border: '1px solid #334155' };
