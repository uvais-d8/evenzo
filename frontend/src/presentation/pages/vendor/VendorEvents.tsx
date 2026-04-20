import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { ICategory } from '../../../core/types/category.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiEdit, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PAGE_LIMIT = 9; // 3-column grid looks best with multiples of 3

const VendorEvents: React.FC = () => {
    const { eventRepository, categoryRepository } = useRepositories();
    const [result, setResult] = useState<PaginatedResponse<IEvent> | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        address: '',
        date: '',
        category: '',
        lat: '',
        lng: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorId = JSON.parse(sessionStorage.getItem("userData") || "{}").id;

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const [eventsRes, catsRes] = await Promise.all([
                eventRepository.getEvents({ vendorId, page: p, limit: PAGE_LIMIT }),
                categoryRepository.getCategories({ page: 1, limit: 100 })
            ]);
            setResult(eventsRes);
            setCategories(catsRes.data);
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [eventRepository, categoryRepository, vendorId]);

    useEffect(() => {
        fetchData(page);
    }, [fetchData, page]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category) { toast.error("Please select a category"); return; }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('address', formData.address);
            data.append('date', formData.date);
            data.append('category', formData.category);
            if (formData.lat && formData.lng) {
                data.append('location[type]', 'Point');
                data.append('location[coordinates][0]', formData.lng);
                data.append('location[coordinates][1]', formData.lat);
            }
            if (imageFile) data.append('image', imageFile);

            await eventRepository.createEvent(data);
            toast.success("Event created successfully");
            setShowModal(false);
            resetForm();
            fetchData(page);
        } catch {
            toast.error("Failed to create event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await eventRepository.deleteEvent(deleteTarget);
            toast.success("Event deleted");
            setDeleteTarget(null);
            if (result && result.data.length === 1 && page > 1) {
                setPage(p => p - 1);
            } else {
                fetchData(page);
            }
        } catch {
            toast.error("Failed to delete event");
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', price: '', address: '', date: '', category: '', lat: '', lng: '' });
        setImageFile(null);
    };

    if (loading && !result) return <LoadingSpinner message="Loading events..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>My Events</h2>
                    <p style={styles.subtitle}>
                        {result ? `${result.total} event${result.total !== 1 ? 's' : ''} total` : 'Create and manage your hosted events'}
                    </p>
                </div>
                <button style={styles.addBtn} onClick={() => setShowModal(true)}>
                    <FiPlus /> Create New Event
                </button>
            </div>

            {loading ? (
                <div style={styles.loadingOverlay}>Refreshing...</div>
            ) : result && result.data.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>No events found. Start by creating one!</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {result!.data.map(event => (
                        <div key={event._id} style={styles.card}>
                            <img src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=60'} alt={event.title} style={styles.eventImage} />
                            <div style={styles.cardContent}>
                                <h3 style={styles.eventTitle}>{event.title}</h3>
                                <div style={styles.detailRow}>
                                    <FiCalendar style={styles.detailIcon} />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <FiMapPin style={styles.detailIcon} />
                                    <span style={styles.truncate}>{event.address}</span>
                                </div>
                                <div style={styles.detailRow}>
                                    <FiDollarSign style={styles.detailIcon} />
                                    <span style={styles.priceText}>₹{event.price}</span>
                                </div>
                                <div style={styles.cardActions}>
                                    <button style={styles.iconBtn}><FiEdit /></button>
                                    <button
                                        style={{ ...styles.iconBtn, color: '#ef4444' }}
                                        onClick={() => setDeleteTarget(event._id)}
                                        disabled={isDeleting}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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

            {/* Create Event Modal */}
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>Create New Event</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Event Title *</label>
                                <input name="title" value={formData.title} onChange={handleInputChange} style={styles.input} required />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Category *</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} style={styles.input} required>
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Price *</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} style={styles.input} required />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Date *</label>
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} required />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Address *</label>
                                <input name="address" value={formData.address} onChange={handleInputChange} style={styles.input} required />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Latitude (Optional)</label>
                                    <input type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Longitude (Optional)</label>
                                    <input type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} style={styles.input} />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} style={styles.textarea} />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Event Image</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" style={styles.input} />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                                <button type="submit" style={styles.saveBtn} disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Event"
                message="Are you sure you want to delete this event? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '0px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: 0 },
    subtitle: { fontSize: '13px', color: '#64748b', marginTop: '5px' },
    addBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
    loadingOverlay: { textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
    card: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
    eventImage: { width: '100%', height: '180px', objectFit: 'cover' },
    cardContent: { padding: '20px' },
    eventTitle: { fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 15px 0' },
    detailRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#64748b', marginBottom: '8px' },
    detailIcon: { color: '#94a3b8', flexShrink: 0 },
    truncate: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '180px' },
    priceText: { color: '#2563eb', fontWeight: 600 },
    cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
    iconBtn: { backgroundColor: 'transparent', border: 'none', fontSize: '16px', color: '#64748b', cursor: 'pointer', padding: '5px' },
    paginationWrapper: { marginTop: '30px' },
    emptyState: { textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0', color: '#94a3b8' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { backgroundColor: 'white', borderRadius: '25px', padding: '30px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '18px', fontWeight: 600, marginBottom: '25px', color: '#1e293b' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' },
    textarea: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', fontSize: '13px', outline: 'none', resize: 'none' as const },
    row: { display: 'flex', gap: '15px' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' },
    cancelBtn: { padding: '10px 25px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
    saveBtn: { padding: '10px 25px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
};

export default VendorEvents;
