import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDanger = false }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '450px',
                maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0', transform: 'translateY(0)', animation: 'slideUp 0.2s ease-out'
            }}>
                <h3 style={{ marginTop: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                    {title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'white', border: '1px solid #cbd5e1', color: '#64748b',
                            padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{
                            background: isDanger ? '#ef4444' : '#3b82f6',
                            border: 'none', color: 'white',
                            padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: isDanger ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
        </div>
    );
}
