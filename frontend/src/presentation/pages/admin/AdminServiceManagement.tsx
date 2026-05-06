import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IService } from '../../../core/types/service.types';
import toast from 'react-hot-toast';
import { FiTrash2, FiPackage, FiInfo } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=60';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const AdminServiceManagement: React.FC = () => {
    const { serviceRepository } = useRepositories();
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await serviceRepository.getServices({ page: 1, limit: 100 });
            setServices(res.data || []);
        } catch (error) {
            console.error("Failed to load services:", error);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    }, [serviceRepository]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await serviceRepository.deleteService(deleteTarget);
            toast.success("Service removed successfully");
            setDeleteTarget(null);
            fetchServices();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete service");
        }
    };

    if (loading && services.length === 0) return <LoadingSpinner message="Loading services..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Service Management</h2>
                    <p style={styles.subtitle}>Monitor and manage services offered by vendors.</p>
                </div>
            </div>

            {services.length === 0 ? (
                <div style={styles.emptyContainer}>
                    <div style={styles.emptyIcon}><FiPackage size={48} /></div>
                    <h3 style={styles.emptyTitle}>No services found</h3>
                    <p style={styles.emptyText}>Vendors haven't added any services yet.</p>
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
                                        <button style={styles.deleteIconBtn} onClick={() => setDeleteTarget(service._id)} title="Delete"><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Remove Service?"
                message="Are you sure you want to delete this service? This action cannot be undone."
                confirmLabel="Yes, Delete"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 },
    subtitle: { fontSize: '14px', color: '#64748b', marginTop: '5px' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    cardImageWrapper: { position: 'relative', height: '160px', width: '100%' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    statusTag: { position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 700 },
    
    cardContent: { padding: '20px' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    serviceName: { fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.3 },
    priceText: { fontSize: '15px', fontWeight: 800, color: '#2563eb' },
    serviceDesc: { fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #f8fafc' },
    categoryInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
    actions: { display: 'flex', gap: '8px' },
    deleteIconBtn: { background: '#fef2f2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    emptyContainer: { padding: '80px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '20px', border: '1px dashed #e2e8f0' },
    emptyIcon: { marginBottom: '15px', color: '#cbd5e1' },
    emptyTitle: { fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' },
    emptyText: { fontSize: '14px', color: '#64748b' }
};

export default AdminServiceManagement;
