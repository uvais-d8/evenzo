import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { ICategory } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { 
    FiFilter, FiSearch, FiCalendar, FiDollarSign, 
    FiChevronDown, FiChevronUp, FiX, FiMapPin,
    FiArrowRight, FiSliders
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const AllEvents: React.FC = () => {
    const { eventRepository, categoryRepository } = useRepositories();
    const navigate = useNavigate();

    const [events, setEvents] = useState<IEvent[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryRepository.getCategories({ page: 1, limit: 100 });
            setCategories(res.data || []);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    }, [categoryRepository]);

    const fetchEvents = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = { 
                page: isLoadMore ? page + 1 : 1, 
                limit: 12 
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (selectedCategory) params.category = selectedCategory;
            if (selectedLocation) params.locationName = selectedLocation;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await eventRepository.getEvents(params);
            
            const newData = Array.isArray(res) ? res : (res.data || []);
            const pagination = (res as any).pagination || {};
            const totalPages = pagination.totalPages || 1;
            const currentPage = pagination.page || (isLoadMore ? page + 1 : 1);

            if (isLoadMore) {
                setEvents(prev => [...prev, ...newData]);
                setPage(currentPage);
            } else {
                setEvents(newData);
                setPage(1);
            }
            
            setHasMore(currentPage < totalPages);
        } catch (error) {
            console.error("Event fetch error:", error);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [eventRepository, debouncedSearch, selectedCategory, minPrice, maxPrice, startDate, endDate, page]);

    

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchEvents(false);
    }, [debouncedSearch, selectedCategory, selectedLocation, minPrice, maxPrice, startDate, endDate]);

    const resetFilters = () => {
        setSelectedCategory('');
        setSelectedLocation('');
        setMinPrice('');
        setMaxPrice('');
        setStartDate('');
        setEndDate('');
        setSearch('');
    };

    return (
        <div style={styles.pageWrapper}>
            {/* Hero Header */}
            <div style={styles.heroSection}>
                <div style={styles.heroOverlay} />
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Discover Amazing Events</h1>
                    <p style={styles.heroSubtitle}>Find and book the best events in your city, from music festivals to business workshops.</p>
                </div>
            </div>

            <div style={styles.mainContainer}>
                {/* Search & Filter Bar */}
                <div style={styles.stickyBar}>
                    <div style={styles.searchContainer}>
                        <div style={styles.searchBox}>
                            <FiSearch style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search by event title, venue, or keyword..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={styles.searchInput}
                            />
                            {search && <FiX style={styles.clearIcon} onClick={() => setSearch('')} />}
                        </div>
                        <button 
                            style={{...styles.filterBtn, ...(showFilters ? styles.filterBtnActive : {})}} 
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FiSliders /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    {showFilters && (
                        <div style={styles.expandedFilters}>
                            <div style={styles.filterGrid}>
                                <div style={styles.filterItem}>
                                    <label style={styles.label}>Category</label>
                                    <select 
                                        value={selectedCategory} 
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div style={styles.filterItem}>
                                    <label style={styles.label}>Location</label>
                                    <input 
                                        type="text" 
                                        placeholder="City or Area..." 
                                        value={selectedLocation} 
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        style={styles.select}
                                    />
                                </div>
                                <div style={styles.filterItem}>
                                    <label style={styles.label}>Price Range</label>
                                    <div style={styles.rangeRow}>
                                        <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={styles.rangeInput} />
                                        <span style={styles.rangeDash}>-</span>
                                        <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={styles.rangeInput} />
                                    </div>
                                </div>
                                <div style={styles.filterItem}>
                                    <label style={styles.label}>Date Range</label>
                                    <div style={styles.rangeRow}>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.rangeInput} />
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.rangeInput} />
                                    </div>
                                </div>
                            </div>
                            <div style={styles.filterFooter}>
                                <button style={styles.resetTextBtn} onClick={resetFilters}>Clear all filters</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {loading && events.length === 0 ? (
                    <div style={styles.centerPad}>
                        <LoadingSpinner />
                    </div>
                ) : events.length > 0 ? (
                    <>
                        <div style={styles.resultsHeader}>
                            <p style={styles.resultsCount}>{events.length} events found</p>
                        </div>
                        <div style={styles.eventGrid}>
                            {events.map((event) => (
                                <div key={event._id} style={styles.eventCard} onClick={() => navigate(`/event/${event._id}`)}>
                                    <div style={styles.imageContainer}>
                                        <img src={getImageUrl(event.image)} alt={event.title} style={styles.eventImage} />
                                        <div style={styles.priceTag}>
                                            {event.isTicketed ? `₹${event.price}` : 'FREE'}
                                        </div>
                                    </div>
                                    <div style={styles.eventInfo}>
                                        <div style={styles.eventMeta}>
                                            <span style={styles.categoryBadge}>{typeof event.category === 'object' ? (event.category as any).name : 'Event'}</span>
                                            <span style={styles.dateInfo}><FiCalendar size={12} /> {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <h3 style={styles.eventTitle}>{event.title}</h3>
                                        <div style={styles.locationInfo}>
                                            <FiMapPin size={14} color="#64748b" />
                                            <span style={styles.addressText}>{event.locationName || event.address}</span>
                                        </div>
                                        <div style={styles.cardAction}>
                                            <span style={styles.learnMore}>View Details <FiArrowRight /></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div style={styles.loadMoreWrapper}>
                                <button 
                                    style={styles.loadMoreButton} 
                                    onClick={() => fetchEvents(true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Results'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}><FiSearch size={64} /></div>
                        <h2 style={styles.emptyTitle}>No events found</h2>
                        <p style={styles.emptyDesc}>We couldn't find any events matching your current filters. Try adjusting your search or clearing filters.</p>
                        <button style={styles.clearResultsBtn} onClick={resetFilters}>Clear All Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    pageWrapper: { 
        minHeight: '100vh', 
        backgroundColor: '#fff', 
        backgroundImage: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.93), rgba(248, 250, 252, 0.93)), url("https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&q=80")',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        paddingBottom: '80px', 
        fontFamily: "'Inter', sans-serif" 
    },
    heroSection: { 
        height: '450px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        marginBottom: '-80px'
    },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' },
    heroContent: { position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '0 20px', maxWidth: '800px' },
    heroTitle: { fontSize: '48px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' },
    heroSubtitle: { fontSize: '18px', opacity: 0.9, lineHeight: 1.6 },
    mainContainer: { maxWidth: '1280px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 },
    stickyBar: { 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        padding: '24px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        marginBottom: '40px',
        border: '1px solid rgba(255,255,255,0.8)'
    },
    searchContainer: { display: 'flex', gap: '16px', alignItems: 'center' },
    searchBox: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '18px', color: '#64748b', fontSize: '18px' },
    clearIcon: { position: 'absolute', right: '18px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' },
    searchInput: { 
        width: '100%', 
        padding: '16px 50px', 
        borderRadius: '14px', 
        border: '1.5px solid #e2e8f0', 
        fontSize: '16px', 
        outline: 'none', 
        transition: 'all 0.3s ease',
        backgroundColor: '#f8fafc'
    },
    filterBtn: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '16px 24px', 
        borderRadius: '14px', 
        border: '1.5px solid #e2e8f0', 
        backgroundColor: '#fff', 
        color: '#1e293b', 
        fontWeight: 600, 
        cursor: 'pointer', 
        transition: 'all 0.3s' 
    },
    filterBtnActive: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#1e293b' },
    expandedFilters: { marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
    filterItem: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' },
    select: { padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', backgroundColor: '#fff', outline: 'none' },
    rangeRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    rangeInput: { flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' },
    rangeDash: { color: '#94a3b8' },
    filterFooter: { marginTop: '20px', display: 'flex', justifyContent: 'flex-end' },
    resetTextBtn: { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
    resultsHeader: { marginBottom: '24px' },
    resultsCount: { fontSize: '14px', color: '#64748b', fontWeight: 500 },
    eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
    eventCard: { 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
        cursor: 'pointer', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column'
    },
    imageContainer: { width: '100%', height: '220px', position: 'relative', overflow: 'hidden' },
    eventImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' },
    priceTag: { 
        position: 'absolute', 
        top: '16px', 
        right: '16px', 
        backgroundColor: '#fff', 
        padding: '6px 14px', 
        borderRadius: '10px', 
        fontWeight: 800, 
        fontSize: '14px', 
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        color: '#1e293b'
    },
    eventInfo: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' },
    eventMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    categoryBadge: { fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' },
    dateInfo: { fontSize: '13px', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' },
    eventTitle: { fontSize: '19px', fontWeight: 700, color: '#1e293b', marginBottom: '12px', lineHeight: 1.3 },
    locationInfo: { display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '20px' },
    addressText: { fontSize: '13px', color: '#64748b', lineHeight: 1.4 },
    cardAction: { marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', alignItems: 'center' },
    learnMore: { fontSize: '14px', fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' },
    loadMoreWrapper: { display: 'flex', justifyContent: 'center', marginTop: '60px' },
    loadMoreButton: { 
        padding: '16px 40px', 
        borderRadius: '16px', 
        backgroundColor: '#1e293b', 
        color: '#fff', 
        border: 'none', 
        fontSize: '15px', 
        fontWeight: 600, 
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    },
    emptyState: { textAlign: 'center', padding: '100px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    emptyIcon: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '10px' },
    emptyTitle: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 },
    emptyDesc: { fontSize: '16px', color: '#64748b', maxWidth: '400px', lineHeight: 1.6 },
    clearResultsBtn: { marginTop: '10px', padding: '12px 24px', borderRadius: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' },
    centerPad: { padding: '100px 0', display: 'flex', justifyContent: 'center' }
};

export default AllEvents;
