import React from 'react';

const VendorSamples: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Work Samples</h2>
                <p style={styles.subtitle}>Upload photos and videos of your previous events to showcase your work.</p>

                <div style={styles.placeholder}>
                    <div style={styles.icon}>📁</div>
                    <p style={styles.text}>Your portfolio is currently empty.</p>
                    <button style={styles.addBtn}>+ Upload Samples</button>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minHeight: '500px' },
    title: { fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0' },
    subtitle: { fontSize: '15px', color: '#64748b', marginBottom: '40px' },
    placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', height: '300px', border: '2px dashed #e2e8f0', borderRadius: '20px' },
    icon: { fontSize: '50px' },
    text: { fontSize: '16px', color: '#94a3b8', fontWeight: 500 },
    addBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
};

export default VendorSamples;
