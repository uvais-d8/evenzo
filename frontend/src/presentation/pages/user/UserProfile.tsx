import React, { useState, useEffect } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IUser } from '../../../core/types/user.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, 
    FiCalendar, FiClock, FiBriefcase, FiLock, FiLogOut,
    FiStar
} from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';

const UserProfile: React.FC = () => {
    const { userRepository, bookingRepository } = useRepositories();
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    
    // Sub-states
    const [isEditing, setIsEditing] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1);
    const [rating, setRating] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userRepository.getProfile();
                setUser(data);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    address: data.address || ''
                });
            } catch (error) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userRepository]);

    useEffect(() => {
        if (activeTab === 'bookings' || activeTab === 'events') {
            const fetchBookings = async () => {
                setLoadingBookings(true);
                try {
                    const res = await bookingRepository.getUserBookings({ page: 1, limit: 10 });
                    setBookings(res.data);
                } catch (error) {
                    console.error("Failed to fetch bookings", error);
                } finally {
                    setLoadingBookings(false);
                }
            };
            fetchBookings();
        }
    }, [activeTab, bookingRepository]);

    const handleSave = async () => {
        try {
            await userRepository.updateProfile(formData);
            const data = await userRepository.getProfile();
            setUser(data);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    if (loading) return <LoadingSpinner />;
    if (!user) return <div style={styles.error}>Could not load profile.</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return !isEditing ? (
                    <div style={styles.tabContent}>
                        <div style={styles.overviewCard}>
                            <div style={styles.avatarLarge}>
                                <FiUser size={60} color="#fff" />
                            </div>
                            <div style={styles.overviewDetails}>
                                <h2 style={styles.displayName}>{user.name}</h2>
                                <p style={styles.displayEmail}>{user.email}</p>
                                <button style={styles.editBtnBlue} onClick={() => setIsEditing(true)}>edit</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                            </div>
                            <div style={styles.editForm}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>name</label>
                                    <input style={styles.formInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="First Name" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>email</label>
                                    <input style={styles.formInput} value={user.email} placeholder="clientexample@example.com" disabled />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>contact number</label>
                                    <input style={styles.formInput} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(000) 000000" />
                                </div>
                                <div style={styles.formFooter}>
                                    <button style={styles.saveChangesBtn} onClick={handleSave}>save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'bookings':
                return (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                            </div>
                            <h3 style={styles.sectionTitleSmall}>My Bookings</h3>
                            {loadingBookings ? <p>Loading bookings...</p> : bookings.length > 0 ? bookings.map(b => (
                                <div key={b._id} style={styles.bookingListItem}>
                                    <div style={styles.bookingMain}>
                                        <div style={styles.bookingRow}><span style={styles.rowLabel}>Event</span> : <span style={styles.rowValue}>{b.eventId?.title || 'Unknown Event'}</span></div>
                                        <div style={styles.bookingRow}><span style={styles.rowLabel}>Tickets</span> : <span style={styles.rowValue}>{b.ticketCount}</span></div>
                                        <div style={styles.bookingRow}><span style={styles.rowLabel}>Amount</span> : <span style={styles.rowValue}>₹{b.amount}</span></div>
                                        <div style={styles.bookingRow}><span style={styles.rowLabel}>Status</span> : <span style={styles.rowValue}>{b.status}</span></div>
                                    </div>
                                </div>
                            )) : <p>No bookings found.</p>}
                        </div>
                    </div>
                );

            case 'wallet':
                /* Wallet (Matching Screenshot 1) */
                return (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                            </div>
                            <h3 style={styles.sectionTitleSmall}>My Wallet</h3>
                            <div style={styles.walletBalanceBar}>
                                <span style={styles.walletLabel}>Available wallet balance : <span style={styles.boldAmount}>₹14,500.00</span></span>
                                <button style={styles.editBtnBlueSmall}>Add fund</button>
                            </div>
                            
                            <h4 style={styles.subTabTitle}>Wallet Transaction History</h4>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th>Transaction ID</th>
                                            <th>Transaction Date</th>
                                            <th>Amount</th>
                                            <th>Debit/Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={styles.tableRow}>
                                            <td>#8374034804</td>
                                            <td>25 - 07 - 2024</td>
                                            <td>800</td>
                                            <td style={{color: '#ef4444', fontWeight: 600}}>Amount Debited</td>
                                        </tr>
                                        <tr style={styles.tableRow}>
                                            <td>#8374034804</td>
                                            <td>25 - 07 - 2024</td>
                                            <td>800</td>
                                            <td style={{color: '#10b981', fontWeight: 600}}>Amount Credited</td>
                                        </tr>
                                        <tr style={styles.tableRow}>
                                            <td>#18374034804</td>
                                            <td>25 - 07 - 2024</td>
                                            <td>800</td>
                                            <td style={{color: '#ef4444', fontWeight: 600}}>Amount Debited</td>
                                        </tr>
                                        <tr style={styles.tableRow}>
                                            <td>#18374034804</td>
                                            <td>25 - 07 - 2024</td>
                                            <td>800</td>
                                            <td style={{color: '#10b981', fontWeight: 600}}>Amount Credited</td>
                                        </tr>
                                        <tr style={styles.tableRow}>
                                            <td>#8374034804</td>
                                            <td>25 - 07 - 2024</td>
                                            <td>800</td>
                                            <td style={{color: '#ef4444', fontWeight: 600}}>Amount Debited</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'password':
                return (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                            </div>
                            
                            <div style={styles.passwordContainer}>
                                <h2 style={styles.passwordMainTitle}>
                                    {passwordStep === 1 ? 'Reset Password ?' : 'Enter new password'}
                                </h2>
                                
                                {passwordStep === 1 ? (
                                    <div style={styles.passwordFormBody}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.formLabel}>Current password</label>
                                            <input 
                                                type="password" 
                                                style={styles.passwordInput} 
                                                placeholder="Enter your current password here" 
                                            />
                                        </div>
                                        <div style={styles.passwordActions}>
                                            <button style={styles.blueContinueBtn} onClick={() => setPasswordStep(2)}>continue</button>
                                            <span style={styles.backLink} onClick={() => setActiveTab('profile')}>Back to Profile</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.passwordFormBody}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.formLabel}>Password</label>
                                            <input 
                                                type="password" 
                                                style={styles.passwordInput} 
                                                placeholder="Enter your new password here" 
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.formLabel}>Confirm password</label>
                                            <input 
                                                type="password" 
                                                style={styles.passwordInput} 
                                                placeholder="Confirm your password here" 
                                            />
                                        </div>
                                        <div style={styles.passwordVerifyActions}>
                                            <span style={styles.backLink} onClick={() => setPasswordStep(1)}>Back to Login</span>
                                            <button style={styles.blueVerifyBtn} onClick={() => {toast.success("Password verified!"); setPasswordStep(1);}}>Verify</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'events':
                return (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                                <button style={styles.editBtnBlueSmall}>edit</button>
                            </div>
                            <h3 style={styles.sectionTitleSmall}>Booked Events</h3>
                            <div style={styles.bookingListItem}>
                                <div style={styles.bookingMain}>
                                    <div style={styles.bookingRow}><span style={styles.rowLabel}>Vendor Name</span> : <span style={styles.rowValue}>All Bookings Services</span></div>
                                    <div style={styles.bookingRow}><span style={styles.rowLabel}>Title</span> : <span style={styles.rowValue}>Decoration</span></div>
                                    <div style={styles.bookingRow}><span style={styles.rowLabel}>Event Date</span> : <span style={styles.rowValue}>Oct 12, 2024</span></div>
                                    <div style={styles.bookingRow}><span style={styles.rowLabel}>Time</span> : <span style={styles.rowValue}>01:00 to 07:00</span></div>
                                    <div style={styles.bookingRow}><span style={styles.rowLabel}>Ticket Price</span> : <span style={styles.rowValue}>₹12,500</span></div>
                                </div>
                                <div style={styles.bookingStatusSide}>
                                    <span style={styles.statusTextPending}>Pending: Waiting vendor approval</span>
                                    <button style={styles.editBtnBlueSmall} onClick={() => setActiveTab('review')}>add review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'review':
                /* Add Review (Matching Screenshot 2) */
                return (
                    <div style={styles.tabContent}>
                        <div style={styles.editCard}>
                            <div style={styles.editHeader}>
                                <div style={styles.avatarSmall}>C</div>
                                <div style={styles.editUserInfo}>
                                    <h4 style={styles.editUserName}>{user.name}</h4>
                                    <p style={styles.editUserEmail}>{user.email}</p>
                                </div>
                                <button style={styles.editBtnBlueSmall}>Edit</button>
                            </div>
                            
                            <div style={styles.reviewFormSection}>
                                <div style={styles.reviewInputGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Name</label>
                                        <input style={styles.formInput} placeholder="Your Name" value={user.name} readOnly />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.formLabel}>Email</label>
                                        <input style={styles.formInput} placeholder="sample@gmail.com" value={user.email} readOnly />
                                    </div>
                                </div>
                                
                                <div style={styles.starsRowLarge}>
                                    {[1, 2, 3, 4, 5].map(s => <FiStar key={s} size={28} color={rating >= s ? '#f59e0b' : '#ddd'} fill={rating >= s ? '#f59e0b' : 'none'} onClick={() => setRating(s)} style={{cursor: 'pointer'}} />)}
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Review Content</label>
                                    <p style={styles.reviewHintText}>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
                                    <textarea style={styles.reviewAreaLarge} placeholder="Write your review here..."></textarea>
                                </div>
                                
                                <div style={styles.formFooter}>
                                    <button style={styles.saveChangesBtn} onClick={() => {toast.success("Review submitted!"); setActiveTab('events');}}>Submit Review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.layout}>
                <div style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <div style={styles.avatarCircle}>C</div>
                        <h4 style={styles.sidebarName}>{user.name}</h4>
                    </div>
                    <div style={styles.sidebarNav}>
                        <button style={{...styles.sidebarBtn, ...(activeTab === 'profile' ? styles.sidebarBtnActive : {})}} onClick={() => {setActiveTab('profile'); setIsEditing(false);}}>My Profile</button>
                        <button style={{...styles.sidebarBtn, ...(activeTab === 'bookings' ? styles.sidebarBtnActive : {})}} onClick={() => setActiveTab('bookings')}>Bookings services</button>
                        <button style={{...styles.sidebarBtn, ...(activeTab === 'wallet' ? styles.sidebarBtnActive : {})}} onClick={() => setActiveTab('wallet')}>Wallet</button>
                        <button style={{...styles.sidebarBtn, ...(activeTab === 'password' ? styles.sidebarBtnActive : {})}} onClick={() => setActiveTab('password')}>Change password</button>
                        <button style={{...styles.sidebarBtn, ...(activeTab === 'events' ? styles.sidebarBtnActive : {})}} onClick={() => setActiveTab('events')}>Booked events</button>
                    </div>
                    <button style={styles.sidebarLogoutBtn} onClick={handleLogout}>Logout</button>
                </div>

                <div style={styles.contentArea}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: "'Inter', sans-serif" },
    layout: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
    sidebar: { width: '280px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    sidebarHeader: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    avatarCircle: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1f2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 },
    sidebarName: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' },
    sidebarNav: { display: 'flex', flexDirection: 'column', gap: '10px' },
    sidebarBtn: { padding: '12px 15px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#4b5563', fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
    sidebarBtnActive: { backgroundColor: '#3b82f6', color: '#fff' },
    sidebarLogoutBtn: { padding: '12px 15px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' },
    contentArea: { flex: 1 },
    overviewCard: { backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '100px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', textAlign: 'center' },
    avatarLarge: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    overviewDetails: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    displayName: { fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 },
    displayEmail: { fontSize: '14px', color: '#6b7280', margin: 0 },
    editBtnBlue: { padding: '10px 40px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px', fontSize: '14px', fontWeight: 500 },
    editCard: { backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px', minHeight: '400px' },
    editHeader: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb', position: 'relative' },
    avatarSmall: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1f2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 },
    editUserInfo: { flex: 1 },
    editUserName: { margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' },
    editUserEmail: { margin: 0, fontSize: '12px', color: '#6b7280' },
    editBtnBlueSmall: { padding: '8px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 },
    editForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    formLabel: { fontSize: '12px', fontWeight: 600, color: '#374151' },
    formInput: { padding: '12px 15px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px', backgroundColor: '#fff', outline: 'none' },
    formFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px' },
    saveChangesBtn: { padding: '12px 30px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
    sectionTitleSmall: { fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 },
    bookingListItem: { backgroundColor: '#fff', borderRadius: '8px', padding: '25px', display: 'flex', justifyContent: 'space-between', border: '1px solid #e5e7eb' },
    bookingMain: { display: 'flex', flexDirection: 'column', gap: '10px' },
    bookingRow: { fontSize: '13px', color: '#4b5563' },
    rowLabel: { fontWeight: 500, color: '#374151' },
    rowValue: { color: '#6b7280' },
    bookingStatusSide: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' },
    statusTextPending: { fontSize: '12px', color: '#f59e0b', fontWeight: 500 },
    passwordContainer: { textAlign: 'center', padding: '40px 0', maxWidth: '500px', margin: '0 auto' },
    passwordMainTitle: { fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '40px' },
    passwordFormBody: { display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' },
    passwordInput: { width: '100%', padding: '15px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', backgroundColor: '#fff', outline: 'none' },
    passwordActions: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' },
    blueContinueBtn: { width: '150px', padding: '12px 0', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
    backLink: { fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: 500 },
    passwordVerifyActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
    blueVerifyBtn: { padding: '12px 40px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
    walletBalanceBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '10px' },
    walletLabel: { fontSize: '14px', color: '#4b5563' },
    boldAmount: { fontWeight: 700, color: '#111827' },
    subTabTitle: { fontSize: '15px', fontWeight: 700, color: '#111827', marginTop: '20px' },
    tableWrapper: { overflowX: 'auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
    tableHeader: { borderBottom: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb' },
    tableRow: { borderBottom: '1px solid #f3f4f6' },
    reviewFormSection: { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb' },
    reviewInputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    starsRowLarge: { display: 'flex', gap: '8px', margin: '10px 0' },
    reviewHintText: { fontSize: '12px', color: '#6b7280', margin: '0 0 10px 0', lineHeight: 1.5 },
    reviewAreaLarge: { width: '100%', height: '120px', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', resize: 'none', fontSize: '14px' },
    error: { textAlign: 'center', padding: '50px', color: '#ef4444' }
};

export default UserProfile;
