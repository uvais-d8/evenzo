import React from 'react';

const VendorWallet: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Your Wallet</h2>
                <p style={styles.subtitle}>Manage your earnings and withdraw your funds.</p>

                <div style={styles.walletBox}>
                    <p style={styles.balanceLabel}>Available Balance</p>
                    <h1 style={styles.balanceValue}>₹0.00</h1>
                    <button style={styles.withdrawBtn}>Withdraw Funds</button>
                </div>

                <div style={styles.spacer}></div>

                <h3 style={styles.recentTitle}>Recent Transactions</h3>
                <div style={styles.placeholder}>
                    <p style={styles.text}>No transaction history found.</p>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minHeight: '500px' },
    title: { fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0' },
    subtitle: { fontSize: '15px', color: '#64748b', marginBottom: '30px' },
    walletBox: { backgroundColor: '#eff6ff', padding: '40px', borderRadius: '20px', textAlign: 'center' },
    balanceLabel: { margin: '0 0 10px 0', fontSize: '16px', color: '#111827', fontWeight: 600 },
    balanceValue: { margin: '0 0 25px 0', fontSize: '48px', color: '#3b82f6', fontWeight: 800 },
    withdrawBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'not-allowed', opacity: 0.6 },
    spacer: { height: '40px' },
    recentTitle: { fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' },
    placeholder: { height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '16px' },
    text: { fontSize: '15px', color: '#94a3b8' },
};

export default VendorWallet;
