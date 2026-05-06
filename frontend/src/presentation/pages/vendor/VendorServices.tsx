import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IService } from '../../../core/types/service.types';
import { ICategory } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { 
    FiPlus, FiTrash2, FiEdit, FiPackage, 
    FiDollarSign, FiCheckCircle, FiXCircle,
    FiInfo, FiImage, FiSettings
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=60';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const VendorServices: React.FC = () => {
    const { serviceRepository, categoryRepository, eventRepository } = useRepositories();
    const [services, setServices] = useState<IService[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [eventsList, setEventsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        events: [] as string[],
        isAvailable: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [servicesRes, categoriesRes, eventsRes] = await Promise.all([
                serviceRepository.getVendorServices(),
                categoryRepository.getCategories({ page: 1, limit: 100 }),
                eventRepository.getEvents({ page: 1, limit: 100 })
            ]);
            setServices(servicesRes || []);
            setCategories(categoriesRes.data || []);
            setEventsList(eventsRes.data || []);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load your services");
        } finally {
            setLoading(false);
        }
    }, [serviceRepository, categoryRepository, eventRepository]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleEditClick = (service: IService) => {
        setFormData({
            name: service.name,
            description: service.description,
            price: String(service.price),
            categoryId: typeof service.categoryId === 'object' ? (service.categoryId as any)._id : (service.categoryId || (service.category?._id || '')),
            events: service.events ? service.events.map((e: any) => e._id || e) : [],
            isAvailable: service.isAvailable
        });
        setEditingId(service._id);
        setImagePreview(getImageUrl(service.image));
        setShowModal(true);
    };

    const handleEventChange = (eventId: string) => {
        setFormData(prev => {
            const isSelected = prev.events.includes(eventId);
            if (isSelected) {
                return { ...prev, events: prev.events.filter(id => id !== eventId) };
            } else {
                return { ...prev, events: [...prev.events, eventId] };
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        if (!formData.name || formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters.";
        if (!formData.description || formData.description.trim().length < 10) newErrors.description = "Please provide a more detailed description.";
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Enter a valid service price.";
        if (!formData.categoryId) newErrors.categoryId = "Please select a category.";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('categoryId', formData.categoryId);
            data.append('events', JSON.stringify(formData.events));
            data.append('isAvailable', String(formData.isAvailable));
            if (imageFile) data.append('image', imageFile);

            if (editingId) {
                await serviceRepository.updateService(editingId, data);
                toast.success("Service updated successfully");
            } else {
                await serviceRepository.createService(data);
                toast.success("Service added successfully");
            }

            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save service");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await serviceRepository.deleteService(deleteTarget);
            toast.success("Service removed successfully");
            setDeleteTarget(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete service");
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', price: '', categoryId: '', events: [], isAvailable: true });
        setImageFile(null);
        setImagePreview(null);
        setErrors({});
        setEditingId(null);
    };

    if (loading && services.length === 0) return <LoadingSpinner message="Optimizing your service dashboard..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Service Management</h2>
                    <p style={styles.subtitle}>List your professional offerings and keep them updated for potential clients.</p>
                </div>
                <button style={styles.addBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FiPlus /> New Service
                </button>
            </div>

            {services.length === 0 ? (
                <div style={styles.emptyContainer}>
                    <div style={styles.emptyIcon}><FiPackage size={48} /></div>
                    <h3 style={styles.emptyTitle}>No services listed</h3>
                    <p style={styles.emptyText}>You haven't added any services yet. Start by creating your first offering to attract clients.</p>
                    <button style={styles.emptyAddBtn} onClick={() => setShowModal(true)}>
                        <FiPlus /> Add Your First Service
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {services.map(service => (
                        <div key={service._id} style={styles.card}>
                            <div style={styles.cardImageWrapper}>
                                <img src={getImageUrl(service.image)} alt={service.name} style={styles.cardImg} />
                                <div style={{
                                    ...styles.statusTag,
                                    backgroundColor: service.isAvailable ? 'rgba(22, 163, 74, 0.9)' : 'rgba(239, 68, 68, 0.9)'
                                }}>
                                    {service.isAvailable ? 'Active' : 'Paused'}
                                </div>
                            </div>
                            <div style={styles.cardContent}>
                                <div style={styles.cardTop}>
                                    <h3 style={styles.serviceName}>{service.name}</h3>
                                    <span style={styles.priceText}>₹{service.price}</span>
                                </div>
                                <p style={styles.serviceDesc}>{service.description}</p>
                                <div style={styles.cardFooter}>
                                    <div style={styles.categoryInfo}>
                                        <FiPackage size={12} />
                                        <span>{typeof service.categoryId === 'object' ? (service.categoryId as any).name : (service.category?.name || 'Professional Service')}</span>
                                    </div>
                                    <div style={{...styles.categoryInfo, marginLeft: '10px'}}>
                                        <span>{service.events?.length || 0} Events</span>
                                    </div>
                                    <div style={styles.actions}>
                                        <button style={styles.editIconBtn} onClick={() => handleEditClick(service)} title="Edit"><FiEdit /></button>
                                        <button style={styles.deleteIconBtn} onClick={() => setDeleteTarget(service._id)} title="Delete"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>{editingId ? 'Edit Service Details' : 'Add Professional Service'}</h3>
                            <button style={styles.closeBtn} onClick={() => { setShowModal(false); resetForm(); }}>
                                <FiXCircle size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={styles.modalForm}>
                            <div style={styles.formGrid}>
                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Service Name <FiInfo size={10} title="Be specific and professional" /></label>
                                    <input 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        style={{ ...styles.textInput, borderColor: errors.name ? '#ef4444' : '#e2e8f0' }} 
                                        placeholder="e.g. Luxury Wedding Photography Package" 
                                    />
                                    {errors.name && <span style={styles.errorHint}>{errors.name}</span>}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.inputLabel}>Starting Price (₹)</label>
                                    <div style={styles.inputWithIcon}>
                                        <FiDollarSign style={styles.fieldIcon} />
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={formData.price} 
                                            onChange={handleInputChange} 
                                            style={{ ...styles.textInput, paddingLeft: '35px', borderColor: errors.price ? '#ef4444' : '#e2e8f0' }} 
                                            placeholder="0" 
                                        />
                                    </div>
                                    {errors.price && <span style={styles.errorHint}>{errors.price}</span>}
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Category</label>
                                    <select 
                                        name="categoryId" 
                                        value={formData.categoryId} 
                                        onChange={handleInputChange} 
                                        style={{ ...styles.selectInput, borderColor: errors.categoryId ? '#ef4444' : '#e2e8f0' }}
                                    >
                                        <option value="">Select a Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span style={styles.errorHint}>{errors.categoryId}</span>}
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Related Events</label>
                                    <div style={styles.eventsGrid}>
                                        {eventsList.map(ev => (
                                            <label key={ev._id} style={{
                                                ...styles.eventPill,
                                                borderColor: formData.events.includes(ev._id) ? '#2563eb' : '#e2e8f0',
                                                backgroundColor: formData.events.includes(ev._id) ? '#eff6ff' : '#fff'
                                            }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.events.includes(ev._id)} 
                                                    onChange={() => handleEventChange(ev._id)} 
                                                    style={{display: 'none'}} 
                                                />
                                                <span style={{color: formData.events.includes(ev._id) ? '#2563eb' : '#64748b', fontSize: '13px', fontWeight: 500}}>
                                                    {ev.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Detailed Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleInputChange} 
                                        style={{ ...styles.textArea, borderColor: errors.description ? '#ef4444' : '#e2e8f0' }} 
                                        placeholder="Detail what is included in this service..." 
                                    />
                                    {errors.description && <span style={styles.errorHint}>{errors.description}</span>}
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Visibility Settings</label>
                                    <div style={styles.visibilityRow}>
                                        <label style={{...styles.visOption, borderColor: formData.isAvailable ? '#2563eb' : '#e2e8f0'}}>
                                            <input type="radio" checked={formData.isAvailable} onChange={() => setFormData(p => ({...p, isAvailable: true}))} style={{display: 'none'}} />
                                            <FiCheckCircle color={formData.isAvailable ? '#2563eb' : '#94a3b8'} /> 
                                            <div>
                                                <div style={styles.visTitle}>Live</div>
                                                <div style={styles.visDesc}>Visible to all users</div>
                                            </div>
                                        </label>
                                        <label style={{...styles.visOption, borderColor: !formData.isAvailable ? '#ef4444' : '#e2e8f0'}}>
                                            <input type="radio" checked={!formData.isAvailable} onChange={() => setFormData(p => ({...p, isAvailable: false}))} style={{display: 'none'}} />
                                            <FiXCircle color={!formData.isAvailable ? '#ef4444' : '#94a3b8'} />
                                            <div>
                                                <div style={styles.visTitle}>Paused</div>
                                                <div style={styles.visDesc}>Hidden from users</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div style={styles.formGroupFull}>
                                    <label style={styles.inputLabel}>Cover Image</label>
                                    <div style={styles.uploadBox}>
                                        {imagePreview ? (
                                            <div style={styles.previewWrap}>
                                                <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                                                <button type="button" style={styles.changeImageBtn} onClick={() => setImagePreview(null)}>Change Image</button>
                                            </div>
                                        ) : (
                                            <label style={styles.uploadPlaceholder}>
                                                <FiImage size={32} />
                                                <span>Click to upload service image</span>
                                                <input type="file" onChange={handleImageChange} accept="image/*" style={{display: 'none'}} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" style={styles.cancelButton} onClick={() => { setShowModal(false); resetForm(); }}>Discard</button>
                                <button type="submit" style={styles.saveButton} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (editingId ? 'Update Service' : 'Publish Service')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Permanently Remove Service?"
                message="This will remove the service and all its details. Active bookings won't be affected."
                confirmLabel="Yes, Remove It"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { padding: '0 10px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
    addBtn: { backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    card: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'transform 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    cardImageWrapper: { position: 'relative', height: '180px', width: '100%' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    statusTag: { position: 'absolute', top: '15px', right: '15px', padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' },
    
    cardContent: { padding: '24px' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
    serviceName: { fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.3 },
    priceText: { fontSize: '16px', fontWeight: 800, color: '#2563eb' },
    serviceDesc: { fontSize: '13px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f8fafc' },
    categoryInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
    actions: { display: 'flex', gap: '8px' },
    editIconBtn: { background: '#eff6ff', color: '#2563eb', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    deleteIconBtn: { background: '#fef2f2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    emptyContainer: { padding: '80px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '30px', border: '2px dashed #e2e8f0' },
    emptyIcon: { marginBottom: '20px', color: '#cbd5e1' },
    emptyTitle: { fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' },
    emptyText: { fontSize: '14px', color: '#64748b', maxWidth: '350px', margin: '0 auto 30px' },
    emptyAddBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: '#fff', borderRadius: '32px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' },
    modalHeader: { padding: '30px 40px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 },
    closeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 },
    modalForm: { padding: '20px 40px 40px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    formGroupFull: { gridColumn: '1 / span 2', display: 'flex', flexDirection: 'column', gap: '8px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    inputLabel: { fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' },
    textInput: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'all 0.2s' },
    selectInput: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff' },
    textArea: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minHeight: '100px', resize: 'none' },
    inputWithIcon: { position: 'relative', display: 'flex', alignItems: 'center' },
    fieldIcon: { position: 'absolute', left: '15px', color: '#94a3b8' },
    
    visibilityRow: { display: 'flex', gap: '15px' },
    visOption: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '14px', border: '1.5px solid #e2e8f0', cursor: 'pointer' },
    visTitle: { fontSize: '13px', fontWeight: 700, color: '#1e293b' },
    visDesc: { fontSize: '11px', color: '#94a3b8' },
    
    eventsGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
    eventPill: { padding: '8px 16px', borderRadius: '20px', border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' },

    uploadBox: { width: '100%', border: '2px dashed #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s' },
    uploadPlaceholder: { padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' },
    previewWrap: { position: 'relative', height: '200px' },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
    changeImageBtn: { position: 'absolute', bottom: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' },
    
    modalFooter: { marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelButton: { padding: '14px 30px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
    saveButton: { padding: '14px 30px', borderRadius: '14px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)' },
    errorHint: { fontSize: '11px', color: '#ef4444', fontWeight: 500 }
};

export default VendorServices;
