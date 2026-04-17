import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IVendor } from '../../../core/types/vendor.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import { VendorStatus } from '../../../core/enums/Status.enum';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../core/constants/Messages';

const VendorVerification: React.FC = () => {
    const navigate = useNavigate();
    const { adminRepository } = useRepositories();
    const [result, setResult] = useState<PaginatedResponse<IVendor> | null>(null);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE}${path}`;
    };
    const [page, setPage] = useState(1);
    const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPendingVendors = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await adminRepository.getVendors(VendorStatus.PENDING, { page: p, limit: 10 });
            setResult(res);
        } catch {
            toast.error(ERROR_MESSAGES.FETCH_VENDORS_FAILED);
        } finally {
            setLoading(false);
        }
    }, [adminRepository]);

    useEffect(() => {
        fetchPendingVendors(page);
    }, [fetchPendingVendors, page]);

    const handleVerify = async (vendorId: string, status: VendorStatus, reason?: string) => {
        setIsSubmitting(true);
        try {
            await adminRepository.verifyVendor(vendorId, status, reason);
            toast.success(status === VendorStatus.APPROVED ? SUCCESS_MESSAGES.status_updated('Approved') : SUCCESS_MESSAGES.status_updated('Rejected'));
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedVendor(null);
            fetchPendingVendors(page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.DEFAULT);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !result) return <LoadingSpinner message="Loading pending vendors..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Vendor Verification</h2>
                    <p style={styles.subtitle}>Review and manage vendor applications</p>
                </div>
                <button
                    style={styles.backBtn}
                    onClick={() => navigate('/admin/providers')}
                >
                    Back to All Providers
                </button>
            </div>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Vendor Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Profession</th>
                            <th style={styles.th}>Details</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result && result.data.length > 0 ? (
                            result.data.map((vendor) => (
                                <tr key={vendor._id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.vendorInfo}>
                                            <span style={styles.vendorName}>{vendor.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{vendor.email}</td>
                                    <td style={styles.td}>{vendor.phone || 'N/A'}</td>
                                    <td style={styles.td}>{vendor.profession || 'N/A'}</td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.viewBtn}
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.approveBtn}
                                                onClick={() => handleVerify(vendor._id, VendorStatus.APPROVED)}
                                                disabled={isSubmitting}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                style={styles.rejectBtn}
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setShowRejectModal(true);
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={styles.emptyTd}>No pending vendor applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {result && result.totalPages > 1 && (
                <div style={styles.paginationWrapper}>
                    <Pagination
                        currentPage={page}
                        totalPages={result.totalPages}
                        onPageChange={setPage}
                        isLoading={loading}
                    />
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedVendor && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Vendor Details</h3>
                            <button style={styles.closeBtn} onClick={() => setShowDetailsModal(false)}>×</button>
                        </div>

                        <div style={styles.modalContent}>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Vendor Name:</span>
                                <span style={styles.detailValue}>{selectedVendor.name}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Email:</span>
                                <span style={styles.detailValue}>{selectedVendor.email}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Phone:</span>
                                <span style={styles.detailValue}>{selectedVendor.phone || 'N/A'}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Address:</span>
                                <span style={styles.detailValue}>{selectedVendor.address || 'N/A'}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Profession:</span>
                                <span style={styles.detailValue}>{selectedVendor.profession || 'N/A'}</span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Description:</span>
                                <p style={styles.detailText}>{selectedVendor.description || 'No description provided.'}</p>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Experience/History:</span>
                                <p style={styles.detailText}>{selectedVendor.eventHistory || 'No history provided.'}</p>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>ID Proof:</span>
                                <span style={styles.detailValue}>
                                    {selectedVendor.idProof ? (
                                        <a href={getImageUrl(selectedVendor.idProof)} target="_blank" rel="noopener noreferrer" style={styles.link}>View Document</a>
                                    ) : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.closeModalBtn} onClick={() => setShowDetailsModal(false)}>Close</button>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    style={styles.modalRejectBtn}
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowRejectModal(true);
                                    }}
                                >
                                    Reject
                                </button>
                                <button
                                    style={styles.modalApproveBtn}
                                    onClick={() => {
                                        handleVerify(selectedVendor._id, VendorStatus.APPROVED);
                                        setShowDetailsModal(false);
                                    }}
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>Reject Application</h3>
                            <button style={styles.closeBtn} onClick={() => setShowRejectModal(false)}>×</button>
                        </div>

                        <div style={styles.modalContent}>
                            <p style={styles.modalSubtitle}>Please provide a reason for rejecting <strong>{selectedVendor?.name}</strong></p>
                            <textarea
                                style={styles.textarea}
                                placeholder="Reason for rejection (this will be shared with the vendor)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                style={styles.cancelBtn}
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.confirmRejectBtn, marginLeft: '10px' }}
                                onClick={() => handleVerify(selectedVendor!._id, VendorStatus.REJECTED, rejectionReason)}
                                disabled={!rejectionReason.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '20px' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '20px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 300 },
    backBtn: { padding: '8px 20px', backgroundColor: 'rgba(37, 99, 235, 0.05)', color: 'rgba(37, 99, 235, 0.6)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f5f9' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: { padding: '12px 20px', fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '14px 20px', fontSize: '13px', color: '#334155', fontWeight: 300 },
    vendorInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    vendorName: { fontWeight: 400, color: '#1e293b' },
    viewBtn: { padding: '6px 14px', backgroundColor: 'rgba(71, 85, 105, 0.05)', color: 'rgba(71, 85, 105, 0.6)', border: '1px solid rgba(71, 85, 105, 0.1)', borderRadius: '10px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    actions: { display: 'flex', gap: '8px' },
    approveBtn: { padding: '8px 16px', backgroundColor: 'rgba(16, 185, 129, 0.05)', color: 'rgba(16, 185, 129, 0.6)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '10px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    rejectBtn: { padding: '8px 16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'rgba(239, 68, 68, 0.6)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 300 },
    paginationWrapper: { marginTop: '20px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '24px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', overflow: 'hidden' },
    modalHeader: { padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '18px', fontWeight: 500, color: '#1e293b', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer', lineHeight: 1 },
    modalContent: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' },
    modalSubtitle: { fontSize: '13px', color: '#64748b', marginBottom: '15px', fontWeight: 300 },
    detailRow: { marginBottom: '20px' },
    detailLabel: { display: 'block', fontSize: '11px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
    detailValue: { fontSize: '14px', color: '#1e293b', fontWeight: 400 },
    detailText: { fontSize: '13px', color: '#334155', margin: '8px 0 0 0', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', fontWeight: 300 },
    link: { color: '#2563eb', textDecoration: 'none', fontWeight: 400, fontSize: '13px' },
    modalFooter: { padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeModalBtn: { padding: '8px 18px', backgroundColor: 'rgba(71, 85, 105, 0.05)', color: 'rgba(71, 85, 105, 0.6)', border: '1px solid rgba(71, 85, 105, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' },
    modalApproveBtn: { padding: '8px 18px', backgroundColor: 'rgba(16, 185, 129, 0.05)', color: 'rgba(16, 185, 129, 0.6)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    modalRejectBtn: { padding: '8px 18px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'rgba(239, 68, 68, 0.6)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    textarea: { width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '150px', fontSize: '13px', fontWeight: 300, outline: 'none', lineHeight: 1.6 },
    cancelBtn: { padding: '8px 18px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#64748b' },
    confirmRejectBtn: { padding: '8px 18px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'rgba(239, 68, 68, 0.6)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
};

export default VendorVerification;
