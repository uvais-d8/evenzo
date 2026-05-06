import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { ICategory } from '../../../core/types/category.types';
import { PaginatedResponse } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { 
    FiPlus, FiTrash2, FiEdit, FiMapPin, FiCalendar, 
    FiDollarSign, FiClock, FiUsers, FiTag, FiInfo,
    FiImage, FiMap, FiPhone, FiTarget, FiX
} from 'react-icons/fi';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PAGE_LIMIT = 9;

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=60';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const VendorEvents: React.FC = () => {
    const { eventRepository, categoryRepository } = useRepositories();
    const [result, setResult] = useState<PaginatedResponse<IEvent> | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
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
        mainGuests: '',
        time: '',
        venue: '',
        contact: '',
        ticketDetails: '',
        isTicketed: true,
        locationName: '',
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const vendorId = userData.id || userData._id;

    const fetchData = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const [eventsRes, catsRes] = await Promise.all([
                eventRepository.getEvents({ vendorId, page: p, limit: PAGE_LIMIT }),
                categoryRepository.getCategories({ page: 1, limit: 100 })
            ]);
            setResult(eventsRes);
            setCategories(catsRes.data || []);
        } catch (error) {
            console.error("Failed to load events dashboard:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [eventRepository, categoryRepository, vendorId]);

    useEffect(() => {
        fetchData(page);
    }, [fetchData, page]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleEditClick = (event: IEvent) => {
        setFormData({
            title: event.title,
            description: event.description || '',
            price: String(event.price || ''),
            address: event.address,
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
            category: typeof event.category === 'object' ? (event.category as any)._id : event.category,
            lat: String(event.location?.coordinates[1] || ''),
            lng: String(event.location?.coordinates[0] || ''),
            mainGuests: event.mainGuests || '',
            time: event.time || '',
            venue: event.venue || '',
            contact: event.contact || '',
            ticketDetails: event.ticketDetails || '',
            isTicketed: event.isTicketed,
            locationName: event.locationName || '',
        });
        setEditingId(event._id);
        setShowModal(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5);
            setImageFiles(files);
            setImagePreviews(files.map(file => URL.createObjectURL(file)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        if (!formData.title || formData.title.trim().length < 5) newErrors.title = "Title must be at least 5 characters.";
        if (!formData.category) newErrors.category = "Please select a category.";
        if (formData.isTicketed && (!formData.price || parseFloat(formData.price) < 0)) newErrors.price = "Enter a valid ticket price.";
        if (!formData.date || new Date(formData.date) < new Date()) newErrors.date = "Event date must be in the future.";
        if (!formData.address || formData.address.trim().length < 5) newErrors.address = "Address is required.";
        if (!formData.time) newErrors.time = "Event time is required.";
        if (!formData.description || formData.description.trim().length < 10) newErrors.description = "Description must be at least 10 characters.";
        if (!editingId && imageFiles.length === 0) newErrors.images = "Please upload at least one image.";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the errors in the form.");
            return;
        }
        setErrors({});

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.isTicketed ? formData.price : '0');
            data.append('address', formData.address);
            data.append('date', formData.date);
            data.append('category', formData.category);
            data.append('time', formData.time);
            data.append('isTicketed', String(formData.isTicketed));
            if (formData.mainGuests) data.append('mainGuests', formData.mainGuests);
            if (formData.venue) data.append('venue', formData.venue);
            if (formData.contact) data.append('contact', formData.contact);
            if (formData.ticketDetails) data.append('ticketDetails', formData.ticketDetails);
            if (formData.locationName) data.append('locationName', formData.locationName);
            
            if (formData.lat && formData.lng) {
                data.append('lat', formData.lat);
                data.append('lng', formData.lng);
            }
            
            imageFiles.forEach(file => data.append('images', file));

            if (editingId) {
                 await eventRepository.updateEvent(editingId, data);
                 toast.success("Event updated successfully!");
            } else {
                 await eventRepository.createEvent(data);
                 toast.success("Event published successfully!");
            }

            setShowModal(false);
            resetForm();
            fetchData(page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save event");
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
            if (result && result.data.length === 1 && page > 1) setPage(p => p - 1);
            else fetchData(page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', price: '', address: '', date: '', category: '', lat: '', lng: '', mainGuests: '', time: '', venue: '', contact: '', ticketDetails: '', isTicketed: true, locationName: '' });
        setImageFiles([]);
        setImagePreviews([]);
        setErrors({});
        setEditingId(null);
    };

    if (loading && !result) return <LoadingSpinner message="Gathering your event data..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Event Dashboard</h2>
                    <p style={styles.subtitle}>
                        {result ? `${result.total} Active Events` : 'Manage your upcoming events and ticket sales'}
                    </p>
                </div>
                <button style={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FiPlus /> New Event
                </button>
            </div>

            {result && result.data.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><FiCalendar size={48} /></div>
                    <h3 style={styles.emptyTitle}>No events published</h3>
                    <p style={styles.emptyDesc}>Start creating excitement! Publish your first event to reach thousands of users.</p>
                    <button style={styles.emptyAddBtn} onClick={() => setShowModal(true)}>
                        <FiPlus /> Create Event
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {result?.data.map(event => (
                        <div key={event._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <img src={getImageUrl(event.image)} alt={event.title} style={styles.eventImage} />
                                <div style={styles.categoryBadge}>
                                    {typeof event.category === 'object' ? (event.category as any).name : 'Event'}
                                </div>
                            </div>
                            <div style={styles.cardBody}>
                                <h3 style={styles.eventTitle}>{event.title}</h3>
                                <div style={styles.metaRow}>
                                    <div style={styles.metaItem}><FiCalendar size={12} /> {new Date(event.date).toLocaleDateString()}</div>
                                    <div style={styles.metaItem}><FiClock size={12} /> {event.time}</div>
                                </div>
                                <div style={styles.locationRow}>
                                    <FiMapPin size={12} color="#2563eb" />
                                    <span style={styles.addressText}>{event.address}</span>
                                </div>
                                <div style={styles.cardFooter}>
                                    <div style={styles.priceTag}>
                                        <FiDollarSign size={14} />
                                        <span>{event.isTicketed ? `₹${event.price}` : 'Free'}</span>
                                    </div>
                                    <div style={styles.cardActions}>
                                        <button style={styles.editBtn} onClick={() => handleEditClick(event)} title="Edit"><FiEdit /></button>
                                        <button style={styles.deleteBtn} onClick={() => setDeleteTarget(event._id)} title="Delete"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {result && result.totalPages > 1 && (
                <div style={styles.paginationRow}>
                    <Pagination
                        currentPage={page}
                        totalPages={result.totalPages}
                        onPageChange={setPage}
                        isLoading={loading}
                    />
                </div>
            )}

            {/* Event Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>{editingId ? 'Refine Event' : 'Launch New Event'}</h3>
                            <button style={styles.closeBtn} onClick={() => { setShowModal(false); resetForm(); }}><FiX size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={styles.modalForm}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroupFull}>
                                    <label style={styles.fieldLabel}>Event Title *</label>
                                    <input 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        style={{...styles.textInput, borderColor: errors.title ? '#ef4444' : '#e2e8f0'}} 
                                        placeholder="Give your event a catchy title"
                                    />
                                    {errors.title && <span style={styles.errorHint}>{errors.title}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Event Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} style={styles.selectInput}>
                                        <option value="">Select a category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                    {errors.category && <span style={styles.errorHint}>{errors.category}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Ticket Type</label>
                                    <div style={styles.toggleRow}>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({...p, isTicketed: true}))} 
                                            style={{...styles.toggleBtn, ...(formData.isTicketed ? styles.toggleActive : {})}}
                                        >Paid</button>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({...p, isTicketed: false, price: '0'}))} 
                                            style={{...styles.toggleBtn, ...(!formData.isTicketed ? styles.toggleActive : {})}}
                                        >Free</button>
                                    </div>
                                </div>

                                {formData.isTicketed && (
                                    <div style={styles.formGroup}>
                                        <label style={styles.fieldLabel}>Price per Ticket (₹)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} style={styles.textInput} placeholder="0.00" />
                                        {errors.price && <span style={styles.errorHint}>{errors.price}</span>}
                                    </div>
                                )}

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Date & Time</label>
                                    <div style={styles.dateTimeRow}>
                                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.textInput} />
                                        <input type="time" name="time" value={formData.time} onChange={handleInputChange} style={styles.textInput} />
                                    </div>
                                    {(errors.date || errors.time) && <span style={styles.errorHint}>Provide both date and time</span>}
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.fieldLabel}>Location Details <FiMapPin size={10} /></label>
                                    <input name="address" value={formData.address} onChange={handleInputChange} style={styles.textInput} placeholder="Full address or street name" />
                                    {errors.address && <span style={styles.errorHint}>{errors.address}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Venue Name</label>
                                    <input name="venue" value={formData.venue} onChange={handleInputChange} style={styles.textInput} placeholder="e.g. Grand Plaza Hall" />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Event Location (City/Area)</label>
                                    <input name="locationName" value={formData.locationName} onChange={handleInputChange} style={styles.textInput} placeholder="e.g. Kochi, Ernakulam" />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Contact Point</label>
                                    <div style={styles.inputIconGroup}>
                                        <FiPhone size={14} style={styles.fieldIcon} />
                                        <input name="contact" value={formData.contact} onChange={handleInputChange} style={{...styles.textInput, paddingLeft: '38px'}} placeholder="Phone or email" />
                                    </div>
                                </div>

                                {/* Location Picker Section */}
                                <div style={styles.formGroupFull}>
                                    <div style={styles.locationHeader}>
                                        <label style={styles.fieldLabel}>Precise Coordinates (Map Location)</label>
                                        <button 
                                            type="button" 
                                            style={styles.geoBtn}
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition((pos) => {
                                                        setFormData(p => ({ ...p, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }));
                                                        toast.success("Location pinpointed!");
                                                    }, () => toast.error("Could not access GPS"));
                                                }
                                            }}
                                        >
                                            <FiTarget /> Pin Current Location
                                        </button>
                                    </div>
                                    <div style={styles.coordRow}>
                                        <div style={styles.coordInput}>
                                            <span style={styles.coordLabel}>LAT</span>
                                            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} style={styles.coordField} />
                                        </div>
                                        <div style={styles.coordInput}>
                                            <span style={styles.coordLabel}>LNG</span>
                                            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} style={styles.coordField} />
                                        </div>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${formData.lat},${formData.lng}`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            style={{...styles.mapViewBtn, opacity: (formData.lat && formData.lng) ? 1 : 0.5}}
                                        >
                                            <FiMap /> Preview
                                        </a>
                                    </div>
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.fieldLabel}>About the Event</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} style={styles.textArea} placeholder="Describe the highlights of your event..." />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Featured Guests</label>
                                    <div style={styles.inputIconGroup}>
                                        <FiUsers size={14} style={styles.fieldIcon} />
                                        <input name="mainGuests" value={formData.mainGuests} onChange={handleInputChange} style={{...styles.textInput, paddingLeft: '38px'}} placeholder="Artists, speakers, etc." />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.fieldLabel}>Ticket Inclusions</label>
                                    <input name="ticketDetails" value={formData.ticketDetails} onChange={handleInputChange} style={styles.textInput} placeholder="e.g. Includes dinner & drinks" />
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.fieldLabel}>Media Uploads (Max 5)</label>
                                    <div style={styles.uploadArea}>
                                        {imagePreviews.length > 0 ? (
                                            <div style={styles.previewScroll}>
                                                {imagePreviews.map((src, i) => (
                                                    <div key={i} style={styles.thumbWrap}>
                                                        <img src={src} alt="Preview" style={styles.thumbImg} />
                                                        <button type="button" onClick={() => {
                                                            const newFiles = imageFiles.filter((_, idx) => idx !== i);
                                                            const newPreviews = imagePreviews.filter((_, idx) => idx !== i);
                                                            setImageFiles(newFiles);
                                                            setImagePreviews(newPreviews);
                                                        }} style={styles.removeThumb}><FiX size={10} /></button>
                                                    </div>
                                                ))}
                                                <label style={styles.addThumb}>
                                                    <FiPlus />
                                                    <input type="file" multiple onChange={handleImageChange} style={{display: 'none'}} />
                                                </label>
                                            </div>
                                        ) : (
                                            <label style={styles.uploadTrigger}>
                                                <FiImage size={24} />
                                                <span>Click to upload event images</span>
                                                <input type="file" multiple onChange={handleImageChange} style={{display: 'none'}} />
                                            </label>
                                        )}
                                    </div>
                                    {errors.images && <span style={styles.errorHint}>{errors.images}</span>}
                                </div>
                            </div>

                            <div style={styles.formActions}>
                                <button type="button" style={styles.discardBtn} onClick={() => { setShowModal(false); resetForm(); }}>Discard Changes</button>
                                <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                                    {isSubmitting ? 'Publishing...' : (editingId ? 'Save Changes' : 'Publish Event')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Cancel Event Publication?"
                message="Deleting this event will remove it from all users' discovery feeds. This cannot be reversed."
                confirmLabel="Yes, Delete Event"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
    addBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', transition: 'transform 0.3s' },
    cardHeader: { position: 'relative', height: '200px' },
    eventImage: { width: '100%', height: '100%', objectFit: 'cover' },
    categoryBadge: { position: 'absolute', top: '15px', left: '15px', backgroundColor: 'rgba(255,255,255,0.95)', padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    
    cardBody: { padding: '24px' },
    eventTitle: { fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px 0', lineHeight: 1.3 },
    metaRow: { display: 'flex', gap: '15px', marginBottom: '12px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' },
    locationRow: { display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '24px' },
    addressText: { fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 },
    
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f8fafc' },
    priceTag: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '15px', fontWeight: 800, color: '#1e293b' },
    cardActions: { display: 'flex', gap: '10px' },
    editBtn: { background: '#f8fafc', color: '#64748b', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    deleteBtn: { background: '#fef2f2', color: '#ef4444', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    emptyState: { textAlign: 'center', padding: '100px 40px', backgroundColor: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' },
    emptyIcon: { marginBottom: '20px', color: '#cbd5e1' },
    emptyTitle: { fontSize: '22px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' },
    emptyDesc: { fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto 30px', lineHeight: 1.6 },
    emptyAddBtn: { margin: '0 auto', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 30px', borderRadius: '16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', borderRadius: '32px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' },
    modalHeader: { padding: '30px 40px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
    modalForm: { padding: '20px 40px 40px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    formGroupFull: { gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '8px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    fieldLabel: { fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '6px' },
    textInput: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fcfcfc' },
    selectInput: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff' },
    textArea: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'none' },
    
    toggleRow: { display: 'flex', gap: '10px', padding: '5px', backgroundColor: '#f1f5f9', borderRadius: '12px' },
    toggleBtn: { flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: 'transparent', cursor: 'pointer' },
    toggleActive: { backgroundColor: '#fff', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
    
    dateTimeRow: { display: 'flex', gap: '12px' },
    inputIconGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
    fieldIcon: { position: 'absolute', left: '15px', color: '#94a3b8' },
    
    locationHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
    geoBtn: { background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    coordRow: { display: 'flex', gap: '12px', alignItems: 'center' },
    coordInput: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
    coordLabel: { fontSize: '10px', fontWeight: 800, color: '#94a3b8' },
    coordField: { border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: '#1e293b', width: '100%' },
    mapViewBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', borderRadius: '12px', backgroundColor: '#1e293b', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 600 },
    
    uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '20px', padding: '20px' },
    uploadTrigger: { padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#94a3b8', cursor: 'pointer' },
    previewScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '5px' },
    thumbWrap: { position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 },
    thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
    removeThumb: { position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    addThumb: { width: '80px', height: '80px', borderRadius: '12px', border: '1.5px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', cursor: 'pointer' },
    
    formActions: { marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' },
    discardBtn: { padding: '14px 28px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
    submitBtn: { padding: '14px 35px', borderRadius: '14px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)' },
    errorHint: { fontSize: '11px', color: '#ef4444', fontWeight: 500 },
    paginationRow: { marginTop: '50px', display: 'flex', justifyContent: 'center' }
};

export default VendorEvents;
