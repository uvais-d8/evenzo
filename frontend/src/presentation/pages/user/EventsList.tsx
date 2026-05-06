import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { ICategory } from '../../../core/types/category.types';
import toast from 'react-hot-toast';
import { FiSearch, FiCompass, FiSliders, FiX } from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollStack, { ScrollStackItem } from '../../components/common/ScrollStack';

const getImageUrl = (path: string | undefined, fallback = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80') => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

// Default category fallback images so every card has something visual
const CAT_FALLBACKS = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
];

const EventsList: React.FC = () => {
    const { eventRepository, categoryRepository } = useRepositories();
    const navigate = useNavigate();
    const sliderRef = useRef<HTMLDivElement>(null);

    const [events, setEvents] = useState<IEvent[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryRepository.getCategories({ page: 1, limit: 100 });
            setCategories(res.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    }, [categoryRepository]);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch the most recent 3 events regardless of date for the stacked view
            const params: any = { page: 1, limit: 3 };
            if (search) params.search = search;
            if (selectedCategory) params.category = selectedCategory;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const res = await eventRepository.getEvents(params);
            
            // The repository already sorts by createdAt: -1 (Recently Added)
            const fetchedEvents = res.data || [];
            setEvents(fetchedEvents);
        } catch {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [eventRepository, search, selectedCategory, minPrice, maxPrice, startDate, endDate]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);
    useEffect(() => { fetchEvents(); }, [selectedCategory, search, minPrice, maxPrice, startDate, endDate]);

    const resetFilters = () => {
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setStartDate('');
        setEndDate('');
        setSearch('');
    };

    // All-category item (prepended)
    const allItem = {
        _id: '',
        name: 'All Events',
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    };
    const categoryItems = [allItem, ...categories];

    return (
        <div style={styles.page}>
            {/* Global style to hide scrollbar */}
            <style>
                {`
                    .cat-slider::-webkit-scrollbar {
                        display: none;
                    }
                    .cat-slider {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            {/* ── Category Slider ── */}
            <section style={styles.sliderSection}>
                <div
                    ref={sliderRef}
                    style={styles.slider}
                    /* Hide native scrollbar via CSS class below */
                    className="cat-slider"
                >
                    {categoryItems.map((cat, idx) => {
                        const isActive = selectedCategory === cat._id;
                        const imgSrc = getImageUrl(
                            (cat as any).image,
                            CAT_FALLBACKS[idx % CAT_FALLBACKS.length]
                        );
                        return (
                            <div
                                key={cat._id || 'all'}
                                style={{
                                    ...styles.catCard,
                                    ...(isActive ? styles.catCardActive : {}),
                                }}
                                onClick={() => setSelectedCategory(cat._id)}
                            >
                                <img src={imgSrc} alt={cat.name} style={styles.catCardImg} />
                                {/* Gradient overlay */}
                                <div style={styles.catCardGradient} />
                                {/* Active ring */}
                                {isActive && <div style={styles.catCardRing} />}
                                {/* Name label */}
                                <span style={styles.catCardName}>{cat.name}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Search & Filter Bar ── */}
            <div style={styles.searchSection}>
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
                            style={{...styles.filterBtn, ...(showFilter ? styles.filterBtnActive : {})}} 
                            onClick={() => setShowFilter(!showFilter)}
                        >
                            <FiSliders /> {showFilter ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        <button
                            style={styles.exploreBtn}
                            onClick={() => navigate('/all-events')}
                        >
                            <FiCompass /> Explore More
                        </button>
                    </div>

                    {showFilter && (
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
            </div>

            {/* ── Stacking Cards ── */}
            <div style={styles.stackWrap}>
                {loading ? (
                    <div style={styles.loader}><LoadingSpinner /></div>
                ) : events.length > 0 ? (
                    <ScrollStack
                        useWindowScroll={true}
                        itemDistance={100}
                        itemScale={0.05}
                        baseScale={0.9}
                        stackPosition="10%"
                        scaleEndPosition="5%"
                    >
                        {events.map((event) => (
                            <ScrollStackItem
                                key={event._id}
                                onClick={() => navigate(`/event/${event._id}`)}
                            >
                                <div style={styles.card}>
                                    <img
                                        src={getImageUrl(event.image)}
                                        alt={event.title}
                                        style={styles.cardBg}
                                    />
                                    {/* Bottom info panel – matches screenshot's blue bar */}
                                    <div style={styles.cardInfo}>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardTitle}>{event.title}</span>
                                            <span style={styles.cardDate}>
                                                {new Date(event.date).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div style={styles.cardRow}>
                                            <span style={styles.cardLocation}>{event.locationName || event.address}</span>
                                            <span style={styles.cardTime}>{event.time || 'All Day'}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollStackItem>
                        ))}
                    </ScrollStack>
                ) : (
                    <div style={styles.empty}>
                        <h3>No events found</h3>
                        <p>Try a different category or clear the search.</p>
                    </div>
                )}
            </div>

            {/* ── See Full List CTA ── */}
            <div style={styles.ctaRow}>
                <button style={styles.ctaBtn} onClick={() => navigate('/all-events')}>
                    load more
                </button>
            </div>
        </div>
    );
};

/* ─── styles ─── */
const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#fff',
        fontFamily: "'Inter', sans-serif",
    },

    /* Category Slider */
    sliderSection: {
        padding: '24px 40px 0',
        overflow: 'hidden',
        maxWidth: '1400px',
        margin: '0 auto'
    },
    slider: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingBottom: '4px',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
    },
    catCard: {
        position: 'relative',
        flexShrink: 0,
        width: '185px',
        height: '130px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        scrollSnapAlign: 'start',
        transition: 'transform 0.25s, box-shadow 0.25s',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    },
    catCardActive: {
        transform: 'scale(1.04)',
        boxShadow: '0 6px 24px rgba(37,99,235,0.30)',
    },
    catCardImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    catCardGradient: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)',
    },
    catCardRing: {
        position: 'absolute',
        inset: 0,
        border: '3px solid #2563eb',
        borderRadius: '16px',
        pointerEvents: 'none',
    },
    catCardName: {
        position: 'absolute',
        bottom: '10px',
        left: '12px',
        right: '12px',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'capitalize',
        lineHeight: 1.2,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    /* Search & Filter Bar */
    searchSection: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 40px 0'
    },
    stickyBar: { 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        padding: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
        border: '1px solid rgba(0,0,0,0.05)'
    },
    searchContainer: { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '250px', position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '18px', color: '#64748b', fontSize: '18px' },
    clearIcon: { position: 'absolute', right: '18px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' },
    searchInput: { 
        width: '100%', 
        padding: '16px 50px', 
        borderRadius: '14px', 
        border: '1.5px solid #e2e8f0', 
        fontSize: '15px', 
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
    exploreBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 24px',
        borderRadius: '14px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
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

    /* Stack */
    stackWrap: {
        width: '100%',
        padding: '0 20px',
    },
    card: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    cardBg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    cardInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '18px 28px',
        background: 'rgba(30, 64, 175, 0.82)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    cardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: 700,
    },
    cardDate: {
        fontSize: '14px',
        opacity: 0.9,
    },
    cardLocation: {
        fontSize: '13px',
        opacity: 0.8,
    },
    cardTime: {
        fontSize: '13px',
        opacity: 0.8,
    },

    /* Misc */
    loader: { padding: '80px 0', display: 'flex', justifyContent: 'center' },
    empty: { padding: '80px 0', textAlign: 'center', color: '#94a3b8' },
    ctaRow: { display: 'flex', justifyContent: 'center', padding: '40px 0 60px' },
    ctaBtn: {
        padding: '11px 32px',
        borderRadius: '8px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        fontWeight: 700,
        fontSize: '13px',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(37,99,235,0.25)',
    },
};

export default EventsList;
