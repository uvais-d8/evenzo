import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IVendor } from '../../../core/types/vendor.types';
import { IService } from '../../../core/types/service.types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getImageUrl = (path: string | undefined, fallback = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80') => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const VendorDetailsUser: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { vendorRepository, serviceRepository } = useRepositories();

    const [vendor, setVendor] = useState<IVendor | null>(null);
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVendorData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const vendorData = await vendorRepository.getPublicVendorById(id);
            setVendor(vendorData);

            try {
                const servicesData = await serviceRepository.getPublicVendorServices(id);
                setServices(servicesData || []);
            } catch (err) {
                console.error("Failed to load services", err);
            }
        } catch (error) {
            console.error("Vendor details fetch error:", error);
            toast.error("Failed to load vendor details");
            navigate('/vendors');
        } finally {
            setLoading(false);
        }
    }, [id, vendorRepository, serviceRepository, navigate]);

    useEffect(() => {
        fetchVendorData();
    }, [fetchVendorData]);

    if (loading) {
        return <div style={{ padding: '100px 0', textAlign: 'center' }}><LoadingSpinner message="Loading Vendor Profile..." /></div>;
    }

    if (!vendor) {
        return <div style={{ padding: '100px 0', textAlign: 'center' }}>Vendor not found.</div>;
    }

    return (
        <div style={styles.page}>
            {/* Banner Section */}
            <div style={styles.bannerContainer}>
                <div style={styles.bannerImage}></div>
                
                <div style={styles.profileSection}>
                    <div style={styles.avatarWrap}>
                        <img 
                            src={getImageUrl(vendor.idProof)} 
                            alt={vendor.name} 
                            style={styles.avatarImg} 
                        />
                    </div>
                    <div style={styles.profileInfo}>
                        <h1 style={styles.name}>{vendor.name}</h1>
                        <p style={styles.profession}>{vendor.profession || 'Professional'}</p>
                    </div>
                    <div style={styles.actionButtons}>
                        <button style={styles.connectBtn}>connect me</button>
                        <button style={styles.bookBtn}>book</button>
                    </div>
                </div>
            </div>

            {/* My Works / Services Section */}
            <div style={styles.sectionContainer}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>My Works</h2>
                    <p style={styles.sectionSubtitle}>View my recent services and offerings</p>
                </div>
                
                {services.length === 0 ? (
                    <div style={styles.emptyServices}>No works available currently.</div>
                ) : (
                    <div style={styles.servicesGrid}>
                        {services.map(service => (
                            <div key={service._id} style={styles.serviceCard} onClick={() => navigate(`/services/${service._id}`)}>
                                <div style={styles.serviceImageContainer}>
                                    <img src={getImageUrl(service.image, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80')} alt={service.name} style={styles.serviceImg} />
                                </div>
                                <div style={styles.serviceContent}>
                                    <div style={styles.serviceTopInfo}>
                                        <h4 style={styles.serviceName}>{service.name}</h4>
                                        <p style={styles.servicePrice}>₹{service.price}</p>
                                    </div>
                                    <p style={styles.serviceDescriptionSmall}>{service.description}</p>
                                    <div style={styles.serviceFooter}>
                                        <span style={styles.viewDetailsLink}>View Details</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Details Section */}
            <div style={styles.sectionContainer}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>My Details</h2>
                    <p style={styles.sectionSubtitle}>More about me and my experience</p>
                </div>
                
                <div style={styles.detailsContent}>
                    <div style={styles.detailBlock}>
                        <h4 style={styles.detailLabel}>About</h4>
                        <p style={styles.detailText}>{vendor.description || 'No description provided.'}</p>
                    </div>
                    
                    <div style={styles.detailBlock}>
                        <h4 style={styles.detailLabel}>Event History / Experience</h4>
                        <p style={styles.detailText}>{vendor.eventHistory || 'No history provided.'}</p>
                    </div>

                    <div style={styles.infoRow}>
                        <div style={styles.infoCol}>
                            <h4 style={styles.detailLabel}>Email</h4>
                            <p style={styles.detailText}>{vendor.email}</p>
                        </div>
                        <div style={styles.infoCol}>
                            <h4 style={styles.detailLabel}>Phone</h4>
                            <p style={styles.detailText}>{vendor.phone || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style={styles.detailBlock}>
                        <h4 style={styles.detailLabel}>Address</h4>
                        <p style={styles.detailText}>{vendor.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px 60px',
        fontFamily: "'Inter', sans-serif",
    },
    bannerContainer: {
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        marginTop: '20px',
        marginBottom: '40px'
    },
    bannerImage: {
        width: '100%',
        height: '250px',
        backgroundColor: '#e2e8f0',
        backgroundImage: 'url("https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    profileSection: {
        padding: '0 40px 40px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: '-50px',
        position: 'relative',
        zIndex: 1
    },
    avatarWrap: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '4px solid #fff',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    profileInfo: {
        flex: 1,
        paddingLeft: '24px',
        paddingBottom: '10px'
    },
    name: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 4px 0'
    },
    profession: {
        fontSize: '15px',
        color: '#64748b',
        margin: 0
    },
    actionButtons: {
        display: 'flex',
        gap: '12px',
        paddingBottom: '15px'
    },
    connectBtn: {
        padding: '10px 24px',
        backgroundColor: '#f1f5f9',
        color: '#334155',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    bookBtn: {
        padding: '10px 32px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
    },
    
    sectionContainer: {
        marginBottom: '50px'
    },
    sectionHeader: {
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '22px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 6px 0'
    },
    sectionSubtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: 0
    },
    
    emptyServices: {
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        color: '#94a3b8'
    },
    servicesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },
    serviceCard: {
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    },
    serviceImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s'
    },
    serviceImageContainer: {
        position: 'relative',
        height: '200px',
        width: '100%',
        overflow: 'hidden'
    },
    serviceCategoryBadge: {
        display: 'none'
    },
    serviceContent: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    serviceTopInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px'
    },
    serviceDescriptionSmall: {
        fontSize: '12px',
        color: '#64748b',
        lineHeight: 1.5,
        margin: 0,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    serviceFooter: {
        marginTop: '10px',
        paddingTop: '15px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    viewDetailsLink: {
        fontSize: '12px',
        fontWeight: 700,
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: '0.02em'
    },
    serviceName: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#1e293b',
        margin: 0
    },
    servicePrice: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#3b82f6',
        margin: 0
    },

    detailsContent: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    },
    detailBlock: {
        marginBottom: '24px'
    },
    detailLabel: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#1e293b',
        margin: '0 0 8px 0'
    },
    detailText: {
        fontSize: '14px',
        color: '#475569',
        lineHeight: 1.6,
        margin: 0
    },
    infoRow: {
        display: 'flex',
        gap: '40px',
        marginBottom: '24px'
    },
    infoCol: {
        flex: 1
    }
};

export default VendorDetailsUser;
