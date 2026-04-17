import React, { useState } from 'react';

const VendorPassword: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Change password logic will go here
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Account Security</h2>
                <p style={styles.subtitle}>Update your password to keep your account secure.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>Update Password</button>
                </form>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', maxWidth: '600px' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' },
    title: { fontSize: '18px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '13px', color: '#64748b', marginBottom: '30px', fontWeight: 300 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '11px', fontWeight: 400, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 300, outline: 'none', backgroundColor: '#fafafa' },
    submitBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 6px 15px rgba(37, 99, 235, 0.2)' },
};

export default VendorPassword;
