import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IService } from '../../../core/types/service.types';
import toast from 'react-hot-toast';
import { 
    FiDollarSign, FiPackage, FiMessageCircle, FiArrowLeft, 
    FiUser, FiCheck, FiInfo, FiClock, FiStar, FiShield
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const ServiceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { serviceRepository } = useRepositories();

    const [service, setService] = useState<IService | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                if (id) {
                    const data = await serviceRepository.getServiceById(id);
                    setService(data);
                }
            } catch (error) {
                toast.error("Failed to load service details");
                navigate('/services');
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id, serviceRepository, navigate]);

    if (loading) return <LoadingSpinner message="Curating service details..." />;
    if (!service) return <div style={styles.center}>Service Not Found</div>;

    const vendor = typeof service.vendorId === 'object' ? (service.vendorId as any) : null;
    const category = typeof service.category === 'object' ? (service.category as any) : null;

    return (
        <main style={styles.pageWrapper}>
            <div style={styles.container}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <FiArrowLeft /> Return to listings
                </button>
                
                <div style={styles.contentLayout}>
                    {/* Visual Section */}
                    <div style={styles.visualColumn}>
                        <div style={styles.imageContainer}>
                            <img src={getImageUrl(service.image)} alt={service.name} style={styles.heroImg} />
                        </div>
                        <div style={styles.trustBanner}>
                            <div style={styles.trustItem}>
                                <FiShield color="#10b981" /> <span>Verified Provider</span>
                            </div>
                            <div style={styles.trustItem}>
                                <FiStar color="#f59e0b" /> <span>Highly Rated</span>
                            </div>
                            <div style={styles.trustItem}>
                                <FiClock color="#3b82f6" /> <span>Quick Response</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div style={styles.detailsColumn}>
                        <div style={styles.categoryBadge}>{category?.name || 'Exclusive Service'}</div>
                        <h1 style={styles.mainTitle}>{service.name}</h1>
                        
                        <div style={styles.priceCard}>
                            <div style={styles.priceLabel}>Professional Service Fee</div>
                            <div style={styles.priceValue}>
                                <span style={styles.currencySymbol}>₹</span>
                                {service.price.toLocaleString('en-IN')}
                            </div>
                            <div style={styles.priceSub}>Base price excluding additional customizations</div>
                        </div>

                        <div style={styles.sectionHeader}>
                            <FiInfo /> <span>Service Overview</span>
                        </div>
                        <p style={styles.descriptionText}>{service.description}</p>

                        <div style={styles.highlightGrid}>
                            <div style={styles.highlightItem}>
                                <FiCheck style={styles.checkIcon} />
                                <span>Premium Equipment</span>
                            </div>
                            <div style={styles.highlightItem}>
                                <FiCheck style={styles.checkIcon} />
                                <span>Expert Execution</span>
                            </div>
                            <div style={styles.highlightItem}>
                                <FiCheck style={styles.checkIcon} />
                                <span>On-time Delivery</span>
                            </div>
                            <div style={styles.highlightItem}>
                                <FiCheck style={styles.checkIcon} />
                                <span>24/7 Support</span>
                            </div>
                        </div>

                        <div style={styles.vendorBrief}>
                            <div style={styles.vendorAvatar}>
                                <FiUser size={24} color="#64748b" />
                            </div>
                            <div style={styles.vendorMeta}>
                                <div style={styles.providedBy}>Curated by</div>
                                <div style={styles.vendorLink}>{vendor?.name || 'Evenzo Verified Partner'}</div>
                                <div style={styles.vendorStats}>50+ Events Completed • Since 2023</div>
                            </div>
                        </div>

                        <div style={styles.interactionRow}>
                            <button style={styles.inquiryBtn} onClick={() => toast.success("Message sent to vendor!")}>
                                <FiMessageCircle /> Send Inquiry
                            </button>
                            <button style={styles.bookingBtn} onClick={() => toast.success("Booking portal opening shortly!")}>
                                Reserve Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

const styles: Record<string, React.CSSProperties> = {
    pageWrapper: { minHeight: '100vh', backgroundColor: '#fcfcfc', fontFamily: "'Inter', sans-serif" },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '40px', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' },
    contentLayout: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'start' },
    
    visualColumn: { position: 'sticky', top: '40px' },
    imageContainer: { width: '100%', height: '540px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9' },
    heroImg: { width: '100%', height: '100%', objectFit: 'cover' },
    trustBanner: { display: 'flex', justifyContent: 'space-around', marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' },
    trustItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#475569' },
    
    detailsColumn: { display: 'flex', flexDirection: 'column' },
    categoryBadge: { alignSelf: 'flex-start', padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' },
    mainTitle: { fontSize: '42px', fontWeight: 800, color: '#1e293b', margin: '0 0 32px 0', letterSpacing: '-0.03em', lineHeight: 1.1 },
    
    priceCard: { padding: '30px', backgroundColor: '#fff', borderRadius: '24px', border: '1.5px solid #f1f5f9', marginBottom: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' },
    priceLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' },
    priceValue: { fontSize: '36px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'baseline', gap: '4px' },
    currencySymbol: { fontSize: '24px', fontWeight: 700, color: '#2563eb' },
    priceSub: { fontSize: '13px', color: '#64748b', marginTop: '10px' },
    
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.02em' },
    descriptionText: { fontSize: '17px', color: '#64748b', lineHeight: '1.8', margin: '0 0 32px 0', fontWeight: 300 },
    
    highlightGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' },
    highlightItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569', fontWeight: 500 },
    checkIcon: { color: '#10b981', fontSize: '18px' },
    
    vendorBrief: { display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9', marginBottom: '40px' },
    vendorAvatar: { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' },
    vendorMeta: { display: 'flex', flexDirection: 'column' },
    providedBy: { fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' },
    vendorLink: { fontSize: '16px', fontWeight: 700, color: '#1e293b', cursor: 'pointer' },
    vendorStats: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
    
    interactionRow: { display: 'flex', gap: '20px' },
    inquiryBtn: { flex: 1, padding: '18px', borderRadius: '18px', border: '1.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1e293b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' },
    bookingBtn: { flex: 1.2, padding: '18px', borderRadius: '18px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.25)', transition: 'transform 0.2s' },
    
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontSize: '18px', color: '#94a3b8', fontWeight: 300 }
};

export default ServiceDetails;
