import React, { useState, useEffect } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { AdminStats } from '../../../core/types/category.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '../../../core/constants/Messages';

const AdminDashboard: React.FC = () => {
    const { adminRepository } = useRepositories();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminRepository.getStats();
                setStats(res);
            } catch {
                toast.error(ERROR_MESSAGES.FETCH_STATS_FAILED || 'Failed to fetch dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [adminRepository]);

    if (loading) return <LoadingSpinner message="Loading dashboard statistics..." />;

    const statCards = [
        { label: 'Total Vendors', value: stats?.totalVendors.toString() || '0' },
        { label: 'Total Clients', value: stats?.totalUsers.toString() || '0' },
        { label: 'Total Bookings', value: stats?.totalBookings.toString() || '0' },
        { label: 'Total Revenue', value: `$${stats?.totalRevenue.toLocaleString() || '0'}` },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Dashboard Overview</h2>
            </div>

            <div style={styles.statsGrid}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={styles.statCard}>
                        <p style={styles.statLabel}>{card.label}</p>
                        <h3 style={styles.statValue}>{card.value}</h3>
                        <div style={styles.statSub}>{idx === 3 ? 'This Month' : '100+'}</div>
                    </div>
                ))}
            </div>

            <div style={styles.chartSection}>
                <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>Revenue Analysis</h3>
                    <select style={styles.monthSelect}>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>
                </div>

                <div style={styles.chartContainer}>
                    <svg width="100%" height="250" viewBox="0 0 1000 250" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="adminChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.1 }} />
                                <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {[0, 20, 40, 60, 80, 100].map((val) => (
                            <line key={val} x1="0" y1={200 - (val * 2)} x2="1000" y2={200 - (val * 2)} stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        <path
                            d="M0,200 C50,195 100,190 150,155 C200,135 250,185 300,165 C350,145 400,175 450,95 C500,75 550,195 600,155 C650,125 700,175 750,115 C800,75 850,155 900,135 C950,115 1000,135 L1000,250 L0,250 Z"
                            fill="url(#adminChartGrad)"
                        />

                        <path
                            d="M0,200 C50,195 100,190 150,155 C200,135 250,185 300,165 C350,145 400,175 450,95 C500,75 550,195 600,155 C650,125 700,175 750,115 C800,75 850,155 900,135 C950,115 1000,135"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <circle cx="450" cy="95" r="4" fill="#2563eb" stroke="white" strokeWidth="2" />
                    </svg>

                    <div style={styles.xAxis}>
                        <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' },
    header: { marginBottom: '5px' },
    title: { fontSize: '18px', fontWeight: 500, color: '#1e293b', margin: 0 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
    statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', textAlign: 'left' },
    statLabel: { margin: '0 0 5px 0', fontSize: '12px', fontWeight: 300, color: '#64748b' },
    statValue: { margin: '0 0 5px 0', fontSize: '20px', fontWeight: 500, color: '#1e293b' },
    statSub: { fontSize: '10px', color: '#10b981', fontWeight: 400 },
    chartSection: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    chartTitle: { margin: 0, fontSize: '14px', fontWeight: 500, color: '#1e293b' },
    monthSelect: { padding: '6px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', cursor: 'pointer', outline: 'none' },
    chartContainer: { width: '100%', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' },
    xAxis: { display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', color: '#94a3b8', fontSize: '10px', marginTop: 'auto' },
};

export default AdminDashboard;
