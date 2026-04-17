import React, { useState, useEffect } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IVendor } from '../../../core/types/vendor.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../core/constants/Messages';

const VendorProfile: React.FC = () => {
    const { vendorRepository } = useRepositories();
    const [formData, setFormData] = useState<{
        name: string;
        phone: string;
        address: string;
        profession: string;
        description: string;
        eventHistory: string;
        idProof: File | string | null;
    }>({
        name: '',
        phone: '',
        address: '',
        profession: '',
        description: '',
        eventHistory: '',
        idProof: ''
    });
    const [status, setStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const v = await vendorRepository.getProfile();
                setFormData({
                    name: v.name || '',
                    phone: v.phone || '',
                    address: v.address || '',
                    profession: v.profession || '',
                    description: v.description || '',
                    eventHistory: v.eventHistory || '',
                    idProof: v.idProof || ''
                });
                setStatus(v.vendorStatus);
                setRejectionReason(v.rejectionReason || '');

                if (v.idProof) {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:7000';
                    const staticBase = apiBase.replace('/api', '');
                    setPreviewUrl(v.idProof.startsWith('http') ? v.idProof : `${staticBase}${v.idProof}`);
                }
            } catch {
                toast.error(ERROR_MESSAGES.DEFAULT);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [vendorRepository]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, idProof: file });
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    data.append(key, value as any);
                }
            });

            await vendorRepository.updateProfile(data);
            toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);

            // Sync session storage
            const userDataString = sessionStorage.getItem("userData");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                userData.vendorStatus = 'pending';
                userData.name = formData.name;
                sessionStorage.setItem("userData", JSON.stringify(userData));
            }

            // Reload to sync layout & header
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.DEFAULT);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading your profile..." />;

    const isRejected = status === 'rejected';
    const isApproved = status === 'approved';
    const isPending = status === 'pending';

    return (
        <div style={styles.container}>
            <div style={styles.profileGrid}>
                {/* Left Side: Status & Info */}
                <div style={styles.sideCol}>
                    <div style={styles.card}>
                        <div style={styles.statusSection}>
                            <h3 style={styles.cardTitle}>Account Status</h3>
                            <div style={{
                                ...styles.statusCard,
                                backgroundColor: isApproved ? 'rgba(16, 185, 129, 0.03)' : (isRejected ? 'rgba(239, 68, 68, 0.03)' : 'rgba(245, 158, 11, 0.03)'),
                                border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.1)' : (isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)')}`,
                            }}>
                                {isApproved && <FiCheckCircle style={{ color: '#10b981' }} />}
                                {isRejected && <FiAlertCircle style={{ color: '#ef4444' }} />}
                                {isPending && <FiClock style={{ color: '#f59e0b' }} />}
                                <span style={{
                                    ...styles.statusText,
                                    color: isApproved ? '#10b981' : (isRejected ? '#ef4444' : '#f59e0b')
                                }}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            {isRejected && rejectionReason && (
                                <div style={styles.feedbackBox}>
                                    <p style={styles.feedbackTitle}>Feedback:</p>
                                    <p style={styles.feedbackText}>{rejectionReason}</p>
                                </div>
                            )}

                            {isPending && (
                                <p style={styles.hintText}>Your profile is under review by admin.</p>
                            )}
                            {isApproved && (
                                <p style={styles.hintText}>Your account is approved! Updating sensitive details may trigger a re-verification.</p>
                            )}
                        </div>
                    </div>

                    <div style={{ ...styles.card, marginTop: '20px' }}>
                        <h3 style={styles.cardTitle}>Identity Proof</h3>
                        <div style={styles.uploadContainer}>
                            <input type="file" id="id-proof-upload" hidden onChange={handleFileChange} accept="image/*" />
                            <label htmlFor="id-proof-upload" style={styles.uploadLabel}>
                                {previewUrl ? (
                                    <img src={previewUrl} style={styles.previewImage} alt="ID Proof" />
                                ) : (
                                    <div style={styles.uploadPlaceholder}>
                                        <FiUpload size={20} color="#94a3b8" />
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </label>
                        </div>
                        <p style={styles.uploadHint}>Upload your ID card or License for verification.</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={styles.mainCol}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Professional Profile</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formRow}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input name="name" value={formData.name} onChange={handleChange} style={styles.input} placeholder="Your name" required />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} style={styles.input} placeholder="e.g. +1234567890" required />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Business Address</label>
                                <input name="address" value={formData.address} onChange={handleChange} style={styles.input} placeholder="Where is your business based?" required />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Profession / Service Type</label>
                                <input name="profession" value={formData.profession} onChange={handleChange} style={styles.input} placeholder="e.g. Wedding Photography" required />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Bio / Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} placeholder="Tell us about your services..." required />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Experience & History</label>
                                <textarea name="eventHistory" value={formData.eventHistory} onChange={handleChange} style={styles.textarea} placeholder="Summary of past events..." required />
                            </div>

                            <div style={styles.footer}>
                                <button type="submit" style={styles.saveBtn} disabled={isSaving}>
                                    {isSaving ? 'Processing...' : (isRejected ? 'UPDATE & RE-APPLY' : 'SAVE CHANGES')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '0px' },
    profileGrid: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
    sideCol: { width: '280px', flexShrink: 0 },
    mainCol: { flex: 1 },
    card: { backgroundColor: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' },
    cardTitle: { fontSize: '12px', fontWeight: 500, color: '#64748b', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.05em' },
    statusSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
    statusCard: { padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
    statusText: { fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em' },
    feedbackBox: { backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fee2e2' },
    feedbackTitle: { fontSize: '10px', fontWeight: 500, color: '#ef4444', margin: '0 0 5px 0', textTransform: 'uppercase' },
    feedbackText: { fontSize: '12px', color: '#991b1b', margin: 0, fontWeight: 300, lineHeight: 1.5 },
    hintText: { fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 300, lineHeight: 1.6, textAlign: 'center' },
    uploadContainer: { width: '100%', borderRadius: '15px', border: '1px dashed #e2e8f0', overflow: 'hidden', backgroundColor: '#f8fafc', cursor: 'pointer' },
    uploadLabel: { cursor: 'pointer', width: '100%', display: 'block' },
    uploadPlaceholder: { height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8', fontWeight: 300 },
    previewImage: { width: '100%', height: '140px', objectFit: 'cover' },
    uploadHint: { fontSize: '10px', color: '#94a3b8', marginTop: '10px', textAlign: 'center', fontWeight: 300 },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    formRow: { display: 'flex', gap: '15px' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '11px', fontWeight: 400, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '5px' },
    input: { padding: '10px 15px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 300, color: '#1e293b', outline: 'none', backgroundColor: '#fafafa' },
    textarea: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 300, color: '#1e293b', outline: 'none', minHeight: '100px', resize: 'none', lineHeight: 1.5, backgroundColor: '#fafafa' },
    footer: { marginTop: '10px', display: 'flex', justifyContent: 'flex-end' },
    saveBtn: { padding: '10px 30px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 6px 15px rgba(37, 99, 235, 0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }
};

export default VendorProfile;
