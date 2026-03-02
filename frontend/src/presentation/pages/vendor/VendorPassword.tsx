import React, { useState } from 'react';
import toast from 'react-hot-toast';

const VendorPassword: React.FC = () => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwords.current) {
            toast.error("Current password is required");
            return;
        }

        if (passwords.new.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match!");
            return;
        }

        if (passwords.new === passwords.current) {
            toast.error("New password cannot be the same as current password");
            return;
        }

        toast.success("Password validation passed! (Update logic pending)");
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Change Password</h2>
                <p style={styles.subtitle}>Secure your account by updating your password regularly.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Current Password</label>
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Enter current password"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Enter new password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            style={styles.input}
                            placeholder="Confirm new password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>Update Password</button>
                </form>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', maxWidth: '600px', margin: '0 auto' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minHeight: '500px' },
    title: { fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0' },
    subtitle: { fontSize: '15px', color: '#64748b', marginBottom: '40px' },
    form: { display: 'flex', flexDirection: 'column', gap: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    label: { fontSize: '14px', fontWeight: 600, color: '#475569' },
    input: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb', fontSize: '14px' },
    submitBtn: { padding: '15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginTop: '20px' },
};

export default VendorPassword;
