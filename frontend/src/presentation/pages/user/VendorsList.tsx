import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IVendor } from '../../../core/types/vendor.types';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getImageUrl = (path: string | undefined, fallback = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80') => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const VendorsList: React.FC = () => {
    const { vendorRepository } = useRepositories();
    const navigate = useNavigate();

    const [vendors, setVendors] = useState<IVendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVendors = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            const res = await vendorRepository.getPublicVendors({ page: currentPage, limit: 12 });
            
            const newData = res.data || [];
            if (isLoadMore) {
                setVendors(prev => [...prev, ...newData]);
                setPage(currentPage);
            } else {
                setVendors(newData);
                setPage(1);
            }
            
            const totalPages = res.pagination?.totalPages || Math.ceil((res as any).total / 12) || 1;
            setHasMore(currentPage < totalPages);
        } catch (error) {
            console.error("Vendor fetch error:", error);
            toast.error("Failed to load vendors");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [vendorRepository, page]);

    useEffect(() => {
        fetchVendors(false);
    }, []);

    return (
        <div style={styles.page}>
            <div style={styles.headerRow}>
                <h2 style={styles.title}>Vendors</h2>
                <div style={styles.line}></div>
                <button style={styles.backBtn} onClick={() => navigate(-1)}>back</button>
            </div>

            {loading && vendors.length === 0 ? (
                <div style={styles.loader}><LoadingSpinner /></div>
            ) : vendors.length > 0 ? (
                <>
                    <div style={styles.grid}>
                        {vendors.map(vendor => (
                            <div key={vendor._id} style={styles.card}>
                                <div style={styles.cardTop}></div>
                                <div style={styles.avatarWrap}>
                                    <img 
                                        src={getImageUrl(vendor.idProof)} 
                                        alt={vendor.name} 
                                        style={styles.avatarImg} 
                                    />
                                </div>
                                <div style={styles.cardContent}>
                                    <h3 style={styles.vendorName}>{vendor.name}</h3>
                                    <p style={styles.profession}>{vendor.profession || 'Professional'}</p>
                                    <button 
                                        style={styles.viewBtn}
                                        onClick={() => navigate(`/vendor/${vendor._id}`)}
                                    >
                                        view
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div style={styles.loadMoreWrap}>
                            <button 
                                style={styles.loadMoreBtn} 
                                onClick={() => fetchVendors(true)}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'loading...' : 'load more'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={styles.empty}>
                    <h3>No vendors found</h3>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '40px'
    },
    title: {
        fontSize: '24px',
        fontWeight: 400,
        color: '#1e293b',
        margin: 0
    },
    line: {
        flex: 1,
        height: '1px',
        backgroundColor: '#cbd5e1'
    },
    backBtn: {
        padding: '8px 24px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '30px'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '24px'
    },
    cardTop: {
        width: '100%',
        height: '80px',
        backgroundColor: '#f1f5f9',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
    },
    avatarWrap: {
        width: '100px',
        height: '100px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginTop: '30px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    cardContent: {
        marginTop: '20px',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },
    vendorName: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#1e293b',
        margin: '0 0 6px 0'
    },
    profession: {
        fontSize: '12px',
        color: '#64748b',
        margin: '0 0 20px 0'
    },
    viewBtn: {
        padding: '6px 30px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(59,130,246,0.3)'
    },
    loadMoreWrap: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '50px'
    },
    loadMoreBtn: {
        padding: '10px 30px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
    },
    loader: { padding: '100px 0', display: 'flex', justifyContent: 'center' },
    empty: { padding: '100px 0', textAlign: 'center', color: '#94a3b8' }
};

export default VendorsList;
