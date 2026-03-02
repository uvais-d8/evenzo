import React from 'react';

const VendorBookings: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Your Bookings</h2>
                <p style={styles.subtitle}>Track and manage your upcoming and past service requests.</p>

                <div style={styles.placeholder}>
                    <div style={styles.icon}>📅</div>
                    <p style={styles.text}>No bookings found at this time.</p>
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
};

export default VendorBookings;
