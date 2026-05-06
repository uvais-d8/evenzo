import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IService } from '../../../core/types/service.types';
import { ICategory } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { FiSearch, FiArrowRight, FiBriefcase, FiTag, FiChevronLeft, FiPlus } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=60';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const ServicesList: React.FC = () => {
    const { serviceRepository, categoryRepository } = useRepositories();
    const navigate = useNavigate();

    const [services, setServices] = useState<IService[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [hasMore, setHasMore] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryRepository.getCategories({ page: 1, limit: 100 });
            setCategories(res.data || []);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }, [categoryRepository]);

    const fetchServices = useCallback(async (isLoadMore = false) => {
        setLoading(true);
        try {
            const params: any = { page: isLoadMore ? page + 1 : 1, limit: 9 };
            if (search) params.search = search;
            if (selectedCategory) params.category = selectedCategory;

            const res = await serviceRepository.getServices(params);
            const newData = res.data || [];
            const pagination = res.pagination || {};
            const totalPages = pagination.totalPages || 1;
            const currentPage = pagination.page || (isLoadMore ? page + 1 : 1);

            if (isLoadMore) {
                setServices(prev => [...prev, ...newData]);
                setPage(currentPage);
            } else {
                setServices(newData);
                setPage(1);
            }
            setHasMore(currentPage < totalPages);
        } catch (error) {
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    }, [serviceRepository, page, search, selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchServices(false);
    }, [selectedCategory, search]);

    return (
        <div style={styles.pageContainer}>
            {/* Hero Header */}
            <div style={styles.heroSection}>
                <div style={styles.heroOverlay} />
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Professional Services</h1>
                    <p style={styles.heroSubtitle}>Connect with the best vendors to make your event unforgettable.</p>
                </div>
            </div>

            <div style={styles.mainContent}>
                {/* Search & Filter Bar */}
                <div style={styles.filterSection}>
                    <div style={styles.searchBox}>
                        <FiSearch style={styles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="What service are you looking for?" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    
                    <div style={styles.categoryScroll}>
                        <div 
                            style={{...styles.catChip, ...(selectedCategory === '' ? styles.catChipActive : {})}}
                            onClick={() => setSelectedCategory('')}
                        >
                            All Services
                        </div>
                        {categories.map(cat => (
                            <div 
                                key={cat._id}
                                style={{...styles.catChip, ...(selectedCategory === cat._id ? styles.catChipActive : {})}}
                                onClick={() => setSelectedCategory(cat._id)}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading && services.length === 0 ? (
                    <div style={styles.loaderWrap}><LoadingSpinner /></div>
                ) : services.length > 0 ? (
                    <div style={styles.serviceGrid}>
                        {services.map((service) => (
                            <div key={service._id} style={styles.serviceCard} onClick={() => navigate(`/services/${service._id}`)}>
                                <div style={styles.imageContainer}>
                                    <img src={getImageUrl(service.image)} alt={service.name} style={styles.serviceImg} />
                                    <div style={styles.categoryTag}>
                                        <FiTag size={12} /> {typeof service.category === 'object' ? (service.category as any).name : 'Service'}
                                    </div>
                                </div>
                                <div style={styles.cardInfo}>
                                    <h3 style={styles.serviceName}>{service.name}</h3>
                                    <p style={styles.serviceDesc}>{service.description}</p>
                                    <div style={styles.cardFooter}>
                                        <div style={styles.priceInfo}>
                                            <span style={styles.priceLabel}>Starting from</span>
                                            <span style={styles.priceValue}>₹{service.price}</span>
                                        </div>
                                        <button style={styles.detailsBtn}>View Details <FiArrowRight /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <FiBriefcase size={64} color="#e2e8f0" />
                        <h2 style={styles.emptyTitle}>No services found</h2>
                        <p style={styles.emptyDesc}>Try adjusting your search or category filters to find what you need.</p>
                        <button style={styles.resetBtn} onClick={() => {setSearch(''); setSelectedCategory('');}}>Clear all filters</button>
                    </div>
                )}

                {/* Load More */}
                {hasMore && (
                    <div style={styles.loadMoreRow}>
                        <button 
                            style={styles.loadMoreButton} 
                            onClick={() => fetchServices(true)}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Show More Services'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    pageContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
    heroSection: { 
        height: '300px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        marginBottom: '40px'
    },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(2px)' },
    heroContent: { position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '0 20px' },
    heroTitle: { fontSize: '42px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' },
    heroSubtitle: { fontSize: '18px', opacity: 0.9, fontWeight: 300 },
    mainContent: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px 80px' },
    filterSection: { marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '24px' },
    searchBox: { position: 'relative', maxWidth: '600px', margin: '0 auto', width: '100%' },
    searchIcon: { position: 'absolute', left: '20px', color: '#94a3b8', fontSize: '18px' },
    searchInput: { 
        width: '100%', 
        padding: '16px 20px 16px 54px', 
        borderRadius: '16px', 
        border: '1.5px solid #e2e8f0', 
        fontSize: '16px', 
        outline: 'none', 
        transition: 'all 0.3s',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
    },
    categoryScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', msOverflowStyle: 'none', scrollbarWidth: 'none', justifyContent: 'center' },
    catChip: { 
        padding: '10px 24px', 
        borderRadius: '50px', 
        backgroundColor: '#fff', 
        border: '1.5px solid #e2e8f0', 
        color: '#64748b', 
        fontSize: '14px', 
        fontWeight: 600, 
        cursor: 'pointer', 
        whiteSpace: 'nowrap', 
        transition: 'all 0.2s' 
    },
    catChipActive: { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' },
    serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    serviceCard: { 
        backgroundColor: '#fff', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
        cursor: 'pointer', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column'
    },
    imageContainer: { width: '100%', height: '200px', position: 'relative' },
    serviceImg: { width: '100%', height: '100%', objectFit: 'cover' },
    categoryTag: { 
        position: 'absolute', 
        bottom: '16px', 
        left: '16px', 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        padding: '4px 12px', 
        borderRadius: '8px', 
        fontSize: '11px', 
        fontWeight: 700, 
        color: '#1e293b', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    cardInfo: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' },
    serviceName: { fontSize: '19px', fontWeight: 700, color: '#1e293b', margin: '0 0 10px 0' },
    serviceDesc: { fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
    priceInfo: { display: 'flex', flexDirection: 'column' },
    priceLabel: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
    priceValue: { fontSize: '18px', fontWeight: 800, color: '#1e293b' },
    detailsBtn: { background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
    loaderWrap: { padding: '100px 0', display: 'flex', justifyContent: 'center' },
    emptyState: { textAlign: 'center', padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    emptyTitle: { fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: 0 },
    emptyDesc: { fontSize: '16px', color: '#64748b', maxWidth: '400px', lineHeight: 1.6 },
    resetBtn: { marginTop: '10px', padding: '12px 24px', borderRadius: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' },
    loadMoreRow: { display: 'flex', justifyContent: 'center', marginTop: '60px' },
    loadMoreButton: { 
        padding: '16px 40px', 
        borderRadius: '16px', 
        backgroundColor: '#1e293b', 
        color: '#fff', 
        border: 'none', 
        fontSize: '15px', 
        fontWeight: 600, 
        cursor: 'pointer' 
    }
};

export default ServicesList;
