import React from 'react';

const steps = [
    { id: 'ideation', label: 'Topic' },
    { id: 'structure', label: 'Outline' },
    { id: 'content', label: 'Edit' },
    { id: 'preview', label: 'Export' }
];

const Stepper = ({ currentStep }) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
            {steps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Circle */}
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#0284c7' : (isCompleted ? '#10b981' : '#334155'),
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            zIndex: 1
                        }}>
                            {isCompleted ? '✓' : index + 1}
                        </div>

                        {/* Label */}
                        <span style={{
                            marginLeft: '0.5rem',
                            color: isActive ? '#fff' : '#94a3b8',
                            fontWeight: isActive ? 'bold' : 'normal',
                            marginRight: index < steps.length - 1 ? '1rem' : '0'
                        }}>
                            {step.label}
                        </span>

                        {/* Line */}
                        {index < steps.length - 1 && (
                            <div style={{
                                width: '40px',
                                height: '2px',
                                backgroundColor: isCompleted ? '#10b981' : '#334155',
                                marginRight: '0.5rem'
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
