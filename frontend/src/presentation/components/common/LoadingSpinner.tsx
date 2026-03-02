import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
    message?: string;
    fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 40,
    color = '#2563eb',
    message,
    fullPage = false,
}) => {
    const spinnerEl = (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
                style={{
                    width: size, height: size,
                    border: `3px solid #e2e8f0`,
                    borderTopColor: color,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }}
            />
            {message && <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{message}</p>}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (fullPage) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', backgroundColor: '#fff',
            }}>
                {spinnerEl}
            </div>
        );
    }

    return <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>{spinnerEl}</div>;
};

export default LoadingSpinner;
