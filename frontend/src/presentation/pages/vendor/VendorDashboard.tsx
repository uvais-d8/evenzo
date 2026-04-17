import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { VendorStats, IVendor } from '../../../core/types/vendor.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';
import { ERROR_MESSAGES } from '../../../core/constants/Messages';

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { vendorRepository } = useRepositories();
    const [stats, setStats] = useState<VendorStats | null>(null);
    const [profile, setProfile] = useState<IVendor | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, profileRes] = await Promise.all([
                vendorRepository.getStats(),
                vendorRepository.getProfile()
            ]);
            setStats(statsRes);
            setProfile(profileRes);

            // Sync session storage status if it changed
            const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
            if (userData.vendorStatus !== profileRes.vendorStatus) {
                userData.vendorStatus = profileRes.vendorStatus;
                sessionStorage.setItem("userData", JSON.stringify(userData));
            }
        } catch {
            toast.error(ERROR_MESSAGES.DEFAULT);
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
        { label: 'Total Events', value: '100+' },
        { label: 'Total Clients', value: '500+' },
        { label: 'Total Bookings', value: stats?.totalBookings.toString() || '0' },
        { label: 'Total Revenue', value: `$${stats?.totalRevenue.toLocaleString() || '0'}` },
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
                    <FiAlertCircle size={18} />
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
                <button onClick={handleGoToProfile} style={isRejected ? styles.editBtnActive : styles.editBtn}>EDIT PROFILE</button>
            </div>

            {/* Stat Cards Grid */}
            <div style={styles.statsGrid}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={styles.statCard}>
                        <p style={styles.statLabel}>{card.label}</p>
                        <h3 style={styles.statValue}>{card.value}</h3>
                        <div style={styles.statSub}>+ 12% from last month</div>
                    </div>
                ))}
            </div>

            {/* Sales Details Chart Section */}
            <div style={styles.chartSection}>
                <div style={styles.chartHeader}>
                    <h3 style={styles.chartTitle}>Business Performance</h3>
                    <select style={styles.monthSelect}>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>
                </div>

                <div style={styles.chartContainer}>
                    <svg width="100%" height="280" viewBox="0 0 1000 280" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 0.1 }} />
                                <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[0, 20, 40, 60, 80, 100].map((val) => (
                            <line key={val} x1="0" y1={240 - (val * 2)} x2="1000" y2={240 - (val * 2)} stroke="#f1f5f9" strokeWidth="1" />
                        ))}

                        {/* Chart Area */}
                        <path
                            d="M0,220 C50,210 100,200 150,160 C200,140 250,190 300,170 C350,150 400,180 450,100 C500,80 550,200 600,160 C650,130 700,190 750,120 C800,80 850,170 900,140 C950,120 1000,140 L1000,280 L0,280 Z"
                            fill="url(#chartGrad)"
                        />

                        {/* Line */}
                        <path
                            d="M0,220 C50,210 100,200 150,160 C200,140 250,190 300,170 C350,150 400,180 450,100 C500,80 550,200 600,160 C650,130 700,190 750,120 C800,80 850,170 900,140 C950,120 1000,140"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />

                        {/* Highlight Point */}
                        <circle cx="450" cy="100" r="4" fill="#2563eb" stroke="white" strokeWidth="2" />
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
    dashboardContainer: { width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' },
    rejectionAlert: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '15px', borderRadius: '12px', color: '#991b1b' },
    alertHeader: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginBottom: '5px' },
    rejectionText: { fontSize: '12px', margin: '0 0 10px 0', opacity: 0.9, fontWeight: 300 },
    reapplyBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '8px', fontSize: '10px', fontWeight: 500, cursor: 'pointer' },
    pendingAlert: { backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 15px', borderRadius: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 300 },
    profileSummaryCard: { backgroundColor: '#eff6ff', padding: '15px 25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    profileLeft: { display: 'flex', alignItems: 'center', gap: '15px' },
    avatarMini: { width: '45px', height: '45px', borderRadius: '10px', backgroundColor: '#262626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 400, fontSize: '18px' },
    nameSection: { display: 'flex', flexDirection: 'column' },
    vendorNameTop: { margin: '0 0 2px 0', fontSize: '15px', fontWeight: 500, color: '#1e293b' },
    vendorEmailTop: { margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 300 },
    editBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em' },
    editBtnActive: { backgroundColor: '#ffffff', color: '#2563eb', border: '1.5px solid #2563eb', padding: '7px 18px', borderRadius: '10px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.05em' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
    statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    statLabel: { margin: '0 0 5px 0', fontSize: '11px', fontWeight: 300, color: '#64748b', letterSpacing: '0.02em' },
    statValue: { margin: '0 0 5px 0', fontSize: '18px', fontWeight: 500, color: '#1e293b' },
    statSub: { fontSize: '10px', color: '#10b981', fontWeight: 400 },
    chartSection: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', flex: 1, display: 'flex', flexDirection: 'column' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    chartTitle: { margin: 0, fontSize: '14px', fontWeight: 500, color: '#1e293b' },
    monthSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 400, cursor: 'pointer', outline: 'none' },
    chartContainer: { width: '100%', position: 'relative', marginTop: 'auto' },
    xAxis: { display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', color: '#94a3b8', fontSize: '10px', borderTop: '1px solid #f1f5f9', marginTop: '10px', fontWeight: 300 }
};

export default VendorDashboard;
