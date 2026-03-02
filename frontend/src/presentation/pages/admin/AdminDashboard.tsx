import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../infrastructure/api/admin.api';
import { AdminStats } from '../../../core/types/category.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUsers, FiBriefcase, FiClock, FiCalendar, FiDollarSign } from 'react-icons/fi';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.getStats();
                setStats(res.data);
            } catch {
                toast.error('Failed to fetch dashboard statistics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard statistics..." />;

    const statCards = [
        { label: 'Total Vendors', value: '100+', color: '#1e293b' },
        { label: 'Total Clients', value: '500+', color: '#1e293b' },
        { label: 'Total Bookings', value: '100+', color: '#1e293b' },
        { label: 'Total Revenue', value: '100+', color: '#1e293b' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Dashboard</h2>
            </div>

            <div style={styles.statsGrid}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={styles.statCard}>
                        <p style={styles.statLabel}>{card.label}</p>
                        <h3 style={styles.statValue}>{card.value}</h3>
                    </div>
                ))}
            </div>

            <div style={styles.chartSection}>
                <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>Sales Details</h3>
                    <select style={styles.monthSelect}>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>
                </div>

                <div style={styles.chartContainer}>
                    <svg width="100%" height="300" viewBox="0 0 1000 300" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="adminChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.2 }} />
                                <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {[0, 20, 40, 60, 80, 100].map((val) => (
                            <line key={val} x1="0" y1={250 - (val * 2)} x2="1000" y2={250 - (val * 2)} stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        <path
                            d="M0,230 C50,225 100,220 150,185 C200,165 250,215 300,195 C350,175 400,205 450,125 C500,105 550,225 600,185 C650,155 700,205 750,145 C800,105 850,185 900,165 C950,145 1000,165 L1000,300 L0,300 Z"
                            fill="url(#adminChartGrad)"
                        />

                        <path
                            d="M0,230 C50,225 100,220 150,185 C200,165 250,215 300,195 C350,175 400,205 450,125 C500,105 550,225 600,185 C650,155 700,205 750,145 C800,105 850,185 900,165 C950,145 1000,165"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <circle cx="450" cy="125" r="5" fill="#2563eb" stroke="white" strokeWidth="2" />

                        <rect x="420" y="85" width="60" height="24" rx="4" fill="#2563eb" />
                        <text x="450" y="101" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">64,364.77</text>
                    </svg>

                    <div style={styles.xAxis}>
                        <span>5k</span><span>10k</span><span>15k</span><span>20k</span><span>25k</span><span>30k</span><span>35k</span><span>40k</span><span>45k</span><span>50k</span><span>55k</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px', // Reduced gap
        height: '100%',
        overflow: 'hidden'
    },
    header: { marginBottom: '0px' },
    title: { fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px' // Reduced gap
    },
    statCard: {
        backgroundColor: 'white',
        padding: '25px 20px',
        borderRadius: '20px', // Square-ish
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    },
    statLabel: { margin: '0 0 10px 0', fontSize: '13px', fontWeight: 400, color: '#64748b' },
    statValue: { margin: 0, fontSize: '22px', fontWeight: 600, color: '#1e293b' },
    chartSection: {
        backgroundColor: '#fff',
        padding: '25px', // Reduced padding
        borderRadius: '25px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 10px 50px rgba(0,0,0,0.02)',
        flex: 1, // Take remaining space
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0 // Allow shrinking
    },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    chartTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
    monthSelect: { padding: '8px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', cursor: 'pointer', outline: 'none' },
    chartContainer: {
        width: '100%',
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    xAxis: { display: 'flex', justifyContent: 'space-between', padding: '15px 10px 0', color: '#94a3b8', fontSize: '12px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' },
};

export default AdminDashboard;
