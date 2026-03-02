import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorApi } from '../../../infrastructure/api/vendor.api';
import { VendorStats, IVendor } from '../../../core/types/vendor.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<VendorStats | null>(null);
    const [profile, setProfile] = useState<IVendor | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, profileRes] = await Promise.all([
                vendorApi.getStats(),
                vendorApi.getProfile()
            ]);
            setStats(statsRes.data);
            setProfile(profileRes.data);

            // Sync session storage status if it changed
            const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
            if (userData.vendorStatus !== profileRes.data.vendorStatus) {
                userData.vendorStatus = profileRes.data.vendorStatus;
                sessionStorage.setItem("userData", JSON.stringify(userData));
            }
        } catch {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGoToProfile = () => {
        navigate('/vendor/profile');
    };

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    const statCards = [
        { label: 'Total Vendors', value: '100+' },
        { label: 'Total Clients', value: '500+' },
        { label: 'Total Bookings', value: '100+' },
        { label: 'Total Revenue', value: '100+' },
    ];

    const isRejected = profile?.vendorStatus === 'rejected';
    const isPending = profile?.vendorStatus === 'pending';

    return (
        <div style={styles.dashboardContainer}>
            {/* Rejection Alert */}
            {isRejected && (
                <div style={styles.rejectionAlert}>
                    <div style={styles.alertHeader}>
                        <FiAlertCircle size={20} />
                        <span>Account Rejected</span>
                    </div>
                    <p style={styles.rejectionText}>Reason: {profile?.rejectionReason || 'No reason provided.'}</p>
                    <button onClick={handleGoToProfile} style={styles.reapplyBtn}>
                        Fix Details & Re-apply
                    </button>
                </div>
            )}

            {/* Pending Alert */}
            {isPending && (
                <div style={styles.pendingAlert}>
                    <FiAlertCircle size={20} />
                    <span>Your account is currently under review by admin. Some features are restricted.</span>
                </div>
            )}

            {/* Vendor Summary Bar */}
            <div style={styles.profileSummaryCard}>
                <div style={styles.profileLeft}>
                    <div style={styles.avatarMini}>{profile?.name ? profile.name[0].toUpperCase() : 'V'}</div>
                    <div style={styles.nameSection}>
                        <h3 style={styles.vendorNameTop}>{profile?.name || "Vendor Name"}</h3>
                        <p style={styles.vendorEmailTop}>{profile?.email || "vendorsample@example.com"}</p>
                    </div>
                </div>
                <button onClick={handleGoToProfile} style={isRejected ? styles.editBtnActive : styles.editBtn}>edit</button>
            </div>

            {/* Stat Cards Grid */}
            <div style={styles.statsGrid}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={styles.statCard}>
                        <p style={styles.statLabel}>{card.label}</p>
                        <h3 style={styles.statValue}>{card.value}</h3>
                    </div>
                ))}
            </div>

            {/* Sales Details Chart Section */}
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
                    <svg width="100%" height="320" viewBox="0 0 1000 320" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.1 }} />
                                <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 20, 40, 60, 80, 100].map((val) => (
                            <line key={val} x1="0" y1={280 - (val * 2.5)} x2="1000" y2={280 - (val * 2.5)} stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        {/* Chart Area */}
                        <path
                            d="M0,250 C50,240 100,230 150,180 C200,160 250,220 300,190 C350,170 400,200 450,100 C500,80 550,220 600,180 C650,150 700,220 750,140 C800,100 850,200 900,160 C950,140 1000,160 L1000,320 L0,320 Z"
                            fill="url(#chartGrad)"
                        />

                        {/* Line */}
                        <path
                            d="M0,250 C50,240 100,230 150,180 C200,160 250,220 300,190 C350,170 400,200 450,100 C500,80 550,220 600,180 C650,150 700,220 750,140 C800,100 850,200 900,160 C950,140 1000,160"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />

                        {/* Highlight Point */}
                        <circle cx="450" cy="100" r="7" fill="#2563eb" stroke="white" strokeWidth="3" />
                        <rect x="420" y="55" width="60" height="26" rx="6" fill="#2563eb" />
                        <text x="450" y="72" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">64,364.77</text>
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
    dashboardContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' },

    rejectionAlert: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '15px', borderRadius: '12px', color: '#991b1b' },
    alertHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginBottom: '5px' },
    rejectionText: { fontSize: '13px', margin: '0 0 10px 0', opacity: 0.9, fontWeight: 300 },
    reapplyBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' },

    pendingAlert: { backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '12px 15px', borderRadius: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 400 },

    profileSummaryCard: { backgroundColor: '#eff6ff', padding: '20px 30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    profileLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatarMini: { width: '50px', height: '50px', borderRadius: '10px', backgroundColor: '#262626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: '20px' },
    nameSection: { display: 'flex', flexDirection: 'column' },
    vendorNameTop: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
    vendorEmailTop: { margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 300 },
    editBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 25px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' },
    editBtnActive: { backgroundColor: '#ffffff', color: '#2563eb', border: '1.5px solid #2563eb', padding: '7px 23px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
    statCard: {
        backgroundColor: '#fff',
        padding: '20px 15px',
        borderRadius: '15px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    statLabel: { margin: '0 0 8px 0', fontSize: '12px', fontWeight: 400, color: '#64748b', letterSpacing: '0.02em' },
    statValue: { margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' },

    chartSection: { backgroundColor: '#fff', padding: '25px', borderRadius: '25px', border: '1px solid #f1f5f9', boxShadow: '0 15px 50px rgba(0,0,0,0.03)' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    chartTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
    monthSelect: { padding: '8px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', fontWeight: 400, cursor: 'pointer', outline: 'none' },
    chartContainer: { width: '100%', position: 'relative' },
    xAxis: { display: 'flex', justifyContent: 'space-between', padding: '15px 10px 0', color: '#94a3b8', fontSize: '11px', borderTop: '1px solid #f1f5f9', marginTop: '10px', fontWeight: 300 }
};

export default VendorDashboard;
