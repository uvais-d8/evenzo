import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';

const PAGE_LIMIT = 10;

const AdminEvents: React.FC = () => {
    const { eventRepository } = useRepositories();
    const [result, setResult] = useState<PaginatedResponse<IEvent> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEvents = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await eventRepository.getEvents({ page: p, limit: PAGE_LIMIT });
            setResult(res);
        } catch {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    }, [eventRepository]);

    useEffect(() => {
        fetchEvents(page);
    }, [fetchEvents, page]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await eventRepository.deleteEvent(deleteTarget);
            toast.success("Event deleted successfully");
            setDeleteTarget(null);
            // If we deleted the last item on the page, go back one
            if (result && result.data.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                fetchEvents(page);
            }
        } catch {
            toast.error("Failed to delete event");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading && !result) return <LoadingSpinner message="Fetching events..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Event Management</h2>
                    <p style={styles.subtitle}>Moderate and manage all events on the platform</p>
                </div>
                {result && (
                    <span style={styles.countBadge}>
                        {result.total} Total Event{result.total !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>#</th>
                            <th style={styles.th}>Title</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Price</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result && result.data.length > 0 ? (
                            result.data.map((event, idx) => (
                                <tr key={event._id} style={styles.tr}>
                                    <td style={styles.tdMuted}>{(page - 1) * PAGE_LIMIT + idx + 1}</td>
                                    <td style={styles.td}>{event.title}</td>
                                    <td style={styles.td}>{event.category}</td>
                                    <td style={styles.td}>
                                        <span style={styles.price}>₹{event.price}</span>
                                    </td>
                                    <td style={styles.tdMuted}>{new Date(event.date).toLocaleDateString()}</td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.delBtn}
                                            onClick={() => setDeleteTarget(event._id)}
                                            disabled={isDeleting}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={styles.emptyTd}>No events found.</td>
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

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Event"
                message="Are you sure you want to remove this event from the platform? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '20px' },
    header: { marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '20px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '12px', color: '#64748b', fontWeight: 300, margin: 0 },
    countBadge: { fontSize: '11px', fontWeight: 500, color: 'rgba(37, 99, 235, 0.6)', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '5px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableWrapper: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { backgroundColor: '#f8fafc', padding: '12px 20px', fontSize: '10px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '14px 20px', fontSize: '13px', color: '#334155', fontWeight: 300, borderTop: '1px solid #f1f5f9' },
    tdMuted: { padding: '14px 20px', fontSize: '12px', color: '#94a3b8', fontWeight: 300, borderTop: '1px solid #f1f5f9' },
    tr: { transition: 'background-color 0.2s' },
    price: { fontWeight: 500, color: '#2563eb' },
    delBtn: { backgroundColor: 'transparent', color: 'rgba(239, 68, 68, 0.6)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '5px 14px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
    emptyTd: { padding: '50px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 300 },
    paginationWrapper: { marginTop: '20px' },
};

export default AdminEvents;
