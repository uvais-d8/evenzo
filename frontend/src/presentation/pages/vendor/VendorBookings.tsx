import React from 'react';

const VendorBookings: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Service Bookings</h2>
                <p style={styles.subtitle}>Keep track of all your upcoming and past service appointments.</p>

                <div style={styles.placeholder}>
                    <div style={styles.icon}>📅</div>
                    <p style={styles.text}>No bookings found at the moment.</p>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', minHeight: '400px', border: '1px solid #f1f5f9' },
    title: { fontSize: '18px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '30px', fontWeight: 300 },
    placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', height: '250px', border: '1px dashed #e2e8f0', borderRadius: '15px', backgroundColor: '#fafafa' },
    icon: { fontSize: '40px' },
    text: { fontSize: '14px', color: '#94a3b8', fontWeight: 300 },
};

export default VendorBookings;
