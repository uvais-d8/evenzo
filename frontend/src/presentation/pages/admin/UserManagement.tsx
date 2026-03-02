import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../infrastructure/api/admin.api';
import { IUser } from '../../../core/types/user.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
    const [result, setResult] = useState<PaginatedResponse<IUser> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const fetchUsers = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers({ page: p, limit: 10 });
            setResult(res.data);
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page);
    }, [fetchUsers, page]);

    const handleToggleBlock = async (id: string, currentStatus: boolean) => {
        setIsProcessing(id);
        try {
            await adminApi.toggleBlockUser(id);
            toast.success(`User ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
            fetchUsers(page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsProcessing(null);
        }
    };

    if (loading && !result) return <LoadingSpinner message="Loading users..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>User Management</h2>
                <p style={styles.subtitle}>View and manage registered customers</p>
            </div>

            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Phone</th>
                            <th style={styles.th}>Joined Date</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result && result.data.length > 0 ? (
                            result.data.map((user) => (
                                <tr key={user._id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.userInfo}>
                                            <span style={styles.userName}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.phone || 'N/A'}</td>
                                    <td style={styles.td}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: user.isBlocked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                            color: user.isBlocked ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)',
                                            border: `1px solid ${user.isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}`
                                        }}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            style={{
                                                ...styles.blockBtn,
                                                backgroundColor: user.isBlocked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                color: user.isBlocked ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)',
                                                border: `1px solid ${user.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                                            }}
                                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                                            disabled={isProcessing === user._id}
                                        >
                                            {isProcessing === user._id ? '...' : (user.isBlocked ? 'Unblock' : 'Block')}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={styles.emptyTd}>No users found.</td>
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
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '20px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
    tableCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #f1f5f9' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    th: { padding: '15px 20px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
    td: { padding: '16px 20px', fontSize: '14px', color: '#334155' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    userName: { fontWeight: 600, color: '#1e293b' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' },
    blockBtn: { padding: '8px 16px', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', width: '90px', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s', backdropFilter: 'blur(8px)' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' },
    paginationWrapper: { marginTop: '20px' },
};

export default UserManagement;
