import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IVendor } from '../../../core/types/vendor.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import { VendorStatus } from '../../../core/enums/Status.enum';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../core/constants/Messages';

const ProviderManagement: React.FC = () => {
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
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [blockConfirm, setBlockConfirm] = useState<{ id: string; status: boolean } | null>(null);

    const fetchVendors = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await adminRepository.getVendors(VendorStatus.APPROVED, { page: p, limit: 10 });
            setResult(res);
        } catch {
            toast.error(ERROR_MESSAGES.FETCH_VENDORS_FAILED);
        } finally {
            setLoading(false);
        }
    }, [adminRepository]);

    useEffect(() => {
        fetchVendors(page);
    }, [fetchVendors, page]);

    const handleToggleBlock = async () => {
        if (!blockConfirm) return;
        const { id, status } = blockConfirm;
        setIsProcessing(id);
        setBlockConfirm(null);
        try {
            await adminRepository.toggleBlockVendor(id);
            toast.success(status ? SUCCESS_MESSAGES.VENDOR_UNBLOCKED : SUCCESS_MESSAGES.VENDOR_BLOCKED);
            fetchVendors(page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || ERROR_MESSAGES.DEFAULT);
        } finally {
            setIsProcessing(null);
        }
    };

    if (loading && !result) return <LoadingSpinner message="Loading vendors..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Provider Management</h2>
                    <p style={styles.subtitle}>Manage all registered service providers</p>
                </div>
                <button
                    style={styles.pendingBtn}
                    onClick={() => navigate('/admin/providers/pending')}
                >
                    Pending Approvals
                </button>
            </div>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Vendor Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Profession</th>
                            <th style={styles.th}>Verification</th>
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
                                    <td style={styles.td}>{vendor.profession || 'N/A'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: vendor.vendorStatus === VendorStatus.APPROVED ? 'rgba(16, 185, 129, 0.05)' : (vendor.vendorStatus === VendorStatus.REJECTED ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'),
                                            color: vendor.vendorStatus === VendorStatus.APPROVED ? 'rgba(16, 185, 129, 0.6)' : (vendor.vendorStatus === VendorStatus.REJECTED ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.6)'),
                                            border: `1px solid ${vendor.vendorStatus === VendorStatus.APPROVED ? 'rgba(16, 185, 129, 0.1)' : (vendor.vendorStatus === VendorStatus.REJECTED ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)')}`
                                        }}>
                                            {vendor.vendorStatus.toUpperCase()}
                                        </span>
                                    </td>

                                    <td style={styles.td}>
                                        <div style={styles.actionGroup}>

                                            <button
                                                style={{
                                                    ...styles.blockBtn,
                                                    backgroundColor: vendor.isBlocked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                    color: vendor.isBlocked ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                                                    border: `1px solid ${vendor.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                                                }}
                                                onClick={() => setBlockConfirm({ id: vendor._id, status: vendor.isBlocked })}
                                                disabled={isProcessing === vendor._id}
                                            >
                                                {isProcessing === vendor._id ? '...' : (vendor.isBlocked ? 'Unblock' : 'Block')}
                                            </button>
                                            <button
                                                style={styles.viewBtn}
                                                onClick={() => {
                                                    setSelectedVendor(vendor);
                                                    setShowDetailsModal(true);
                                                }}
                                            >
                                                View More
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={styles.emptyTd}>No vendors found.</td>
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
                            {selectedVendor.rejectionReason && (
                                <div style={styles.detailRow}>
                                    <span style={{ ...styles.detailLabel, color: '#ef4444' }}>Rejection Reason:</span>
                                    <p style={{ ...styles.detailText, color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>{selectedVendor.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.closeModalBtn} onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!blockConfirm}
                title={blockConfirm?.status ? 'Unblock Vendor' : 'Block Vendor'}
                message={`Are you sure you want to ${blockConfirm?.status ? 'unblock' : 'block'} this vendor?`}
                onConfirm={handleToggleBlock}
                onCancel={() => setBlockConfirm(null)}
                variant={blockConfirm?.status ? 'info' : 'danger'}
                confirmLabel={blockConfirm?.status ? 'Unblock' : 'Block'}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '20px' },
    header: { marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '20px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '12px', fontWeight: 300, color: '#64748b', margin: 0 },
    pendingBtn: { padding: '8px 20px', backgroundColor: 'rgba(37, 99, 235, 0.05)', color: 'rgba(37, 99, 235, 0.6)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '12px', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f5f9' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: { padding: '12px 20px', fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '14px 20px', fontSize: '13px', fontWeight: 300, color: '#334155' },
    vendorInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    vendorName: { fontWeight: 400, color: '#1e293b' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' },
    actionGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
    viewBtn: { padding: '6px 14px', backgroundColor: 'rgba(71, 85, 105, 0.05)', color: 'rgba(71, 85, 105, 0.6)', border: '1px solid rgba(71, 85, 105, 0.1)', borderRadius: '10px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.02em' },
    blockBtn: { padding: '6px 14px', border: 'none', borderRadius: '10px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', width: '90px', backdropFilter: 'blur(8px)', textTransform: 'uppercase', letterSpacing: '0.02em' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 300 },
    paginationWrapper: { marginTop: '20px' },

    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' },
    modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '18px', fontWeight: 500, color: '#1e293b', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' },
    modalContent: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' },
    detailRow: { marginBottom: '20px' },
    detailLabel: { display: 'block', fontSize: '11px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' },
    detailValue: { fontSize: '14px', color: '#1e293b', fontWeight: 400 },
    detailText: { fontSize: '13px', fontWeight: 300, color: '#475569', margin: '5px 0 0 0', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' },
    link: { color: '#2563eb', textDecoration: 'none', fontWeight: 400 },
    modalFooter: { padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' },
    closeModalBtn: { padding: '8px 18px', backgroundColor: 'rgba(71, 85, 105, 0.05)', color: 'rgba(71, 85, 105, 0.6)', border: '1px solid rgba(71, 85, 105, 0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px', backdropFilter: 'blur(8px)' },
};

export default ProviderManagement;
