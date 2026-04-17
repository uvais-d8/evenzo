import React from 'react';

const VendorWallet: React.FC = () => {
    return (
        <div style={styles.container}>
            <div style={styles.grid}>
                <div style={styles.balanceCard}>
                    <p style={styles.label}>Total Balance</p>
                    <h2 style={styles.amount}>$0.00</h2>
                    <button style={styles.withdrawBtn}>Withdraw Funds</button>
                </div>

                <div style={styles.historyCard}>
                    <h3 style={styles.title}>Recent Transactions</h3>
                    <div style={styles.placeholder}>
                        <p style={styles.text}>Your transaction history will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%' },
    grid: { display: 'flex', flexDirection: 'column', gap: '20px' },
    balanceCard: { backgroundColor: '#2563eb', padding: '30px', borderRadius: '20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.2)' },
    label: { fontSize: '12px', opacity: 0.8, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 400 },
    amount: { fontSize: '32px', fontWeight: 600, margin: '0 0 20px 0' },
    withdrawBtn: { backgroundColor: 'white', color: '#2563eb', border: 'none', padding: '10px 25px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' },
    historyCard: { backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', flex: 1 },
    title: { fontSize: '16px', fontWeight: 500, color: '#1e293b', margin: '0 0 20px 0' },
    placeholder: { height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '15px', border: '1px dashed #e2e8f0' },
    text: { fontSize: '13px', color: '#94a3b8', fontWeight: 300 },
};

export default VendorWallet;
