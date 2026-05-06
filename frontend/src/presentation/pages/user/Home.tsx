import React, { useEffect, useState } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import { ICategory } from '../../../core/types/category.types';
import { IVendor } from '../../../core/types/vendor.types';
import { useNavigate } from 'react-router-dom';

const getImageUrl = (path: string | undefined, fallback = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80') => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

function Home() {
    const { eventRepository, categoryRepository, vendorRepository } = useRepositories();
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [vendors, setVendors] = useState<IVendor[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
    
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsResult, vendorsResult, eventsResult] = await Promise.allSettled([
                categoryRepository.getCategories({ page: 1, limit: 50 }),
                vendorRepository.getPublicVendors({ page: 1, limit: 50 }),
                eventRepository.getEvents({ page: 1, limit: 50 })
            ]);
            
            // Sort by latest (descending) - Keep as fallback
            const cats = catsResult.status === 'fulfilled' && catsResult.value?.data ? catsResult.value.data : [];
            const vends = vendorsResult.status === 'fulfilled' && vendorsResult.value?.data ? vendorsResult.value.data : [];
            const evts = eventsResult.status === 'fulfilled' && eventsResult.value?.data ? eventsResult.value.data : [];

            // 1. Categories: most used (simulated by counting occurrences in events)
            const catUsage: Record<string, number> = {};
            evts.forEach(e => {
                const catId = typeof e.category === 'string' ? e.category : e.category?._id;
                if (catId) catUsage[catId] = (catUsage[catId] || 0) + 1;
            });
            const sortedCats = [...cats].sort((a, b) => (catUsage[b._id] || 0) - (catUsage[a._id] || 0));

            // 2. Vendors: most event handled (simulated by eventHistory length as proxy for experience)
            const sortedVendors = [...vends].sort((a, b) => (b.eventHistory?.length || 0) - (a.eventHistory?.length || 0));

            // 3. Events: nearest upcoming first
            const now = new Date().getTime();
            const sortedEvents = [...evts]
                .filter(e => new Date(e.date).getTime() >= now)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setCategories(sortedCats.slice(0, 5));
            setVendors(sortedVendors.slice(0, 5));
            setUpcomingEvents(sortedEvents.slice(0, 5));
        } catch (error) {
            console.error("Error fetching home data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        // Navigate to events page with category filter
        navigate(`/events?category=${categoryId}`);
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroOverlay}>
                    <div style={styles.heroContent}>
                        <h1 style={styles.heroTitle}>Your Ultimate Party Planner</h1>
                        <p style={styles.heroSubtitle}>
                            Effortlessly plan, organize, and celebrate your events with style. Let the good times roll!
                        </p>
                        <div style={styles.heroButtons}>
                            <button style={styles.primaryBtn} onClick={() => navigate('/events')}>Plan Your Party Now</button>
                            <button style={styles.secondaryBtn} onClick={() => navigate('/events')}>Explore Events</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Categories */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.line}></div>
                    <h2 style={styles.sectionTitle}>Popular Categories</h2>
                    <div style={styles.line}></div>
                </div>
                {loading ? (
                    <p style={styles.loadingText}>Loading categories...</p>
                ) : (
                    <div style={styles.horizontalScroll}>
                        {categories.map((cat) => (
                            <div 
                                key={cat._id} 
                                style={styles.squareCard}
                                onClick={() => handleCategoryClick(cat._id)}
                            >
                                <img src={getImageUrl(cat.image)} alt={cat.name} style={styles.cardImage} />
                                <div style={styles.cardOverlay}>
                                    <p style={styles.cardTitle}>{cat.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div style={styles.seeAllContainer}>
                    <span style={styles.seeAllText} onClick={() => navigate('/events')}>See All Categories →</span>
                </div>
            </section>

            {/* Popular Vendors */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.line}></div>
                    <h2 style={styles.sectionTitle}>Popular Vendors</h2>
                    <div style={styles.line}></div>
                </div>
                {loading ? (
                    <p style={styles.loadingText}>Loading vendors...</p>
                ) : vendors.length > 0 ? (
                    <div style={styles.horizontalScroll}>
                        {vendors.map((vendor) => (
                            <div 
                                key={vendor._id} 
                                style={styles.squareCardVendor}
                                onClick={() => navigate(`/vendor/${vendor._id}`)}
                            >
                                <img src={getImageUrl(vendor.idProof, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80')} alt={vendor.name} style={styles.cardImage} />
                                <div style={styles.cardOverlayVendor}>
                                    <h3 style={styles.vendorName}>{vendor.name}</h3>
                                    <p style={styles.vendorProfession}>{vendor.profession || 'Professional'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={styles.loadingText}>No vendors available at the moment.</p>
                )}
                <div style={styles.seeAllContainer}>
                    <span style={styles.seeAllText} onClick={() => navigate('/vendors')}>See All Vendors →</span>
                </div>
            </section>

            {/* Upcoming Events */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.line}></div>
                    <h2 style={styles.sectionTitle}>Upcoming Events</h2>
                    <div style={styles.line}></div>
                </div>
                {loading ? (
                    <p style={styles.loadingText}>Loading events...</p>
                ) : upcomingEvents.length > 0 ? (
                    <div style={styles.horizontalScroll}>
                        {upcomingEvents.map((event) => (
                            <div 
                                key={event._id} 
                                style={styles.squareCardEvent}
                                onClick={() => navigate(`/event/${event._id}`)}
                            >
                                <img src={getImageUrl(event.image)} alt={event.title} style={styles.cardImage} />
                                <div style={styles.eventPriceBadge}>
                                    {event.isTicketed ? `₹${event.price}` : 'Free'}
                                </div>
                                <div style={styles.cardOverlayEvent}>
                                    <h3 style={styles.eventName}>{event.title}</h3>
                                    <p style={styles.eventDate}>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={styles.loadingText}>No upcoming events found.</p>
                )}
                <div style={styles.seeAllContainer}>
                    <span style={styles.seeAllText} onClick={() => navigate('/events')}>See All Events →</span>
                </div>
            </section>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', backgroundColor: '#fff', fontFamily: "'Inter', sans-serif" },
    hero: { height: '600px', backgroundImage: 'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
    heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px' },
    heroContent: { maxWidth: '800px', textAlign: 'center', color: '#fff' },
    heroTitle: { fontSize: '48px', fontWeight: 700, marginBottom: '20px' },
    heroSubtitle: { fontSize: '18px', lineHeight: '1.6', marginBottom: '30px', opacity: 0.9 },
    heroButtons: { display: 'flex', gap: '20px', justifyContent: 'center' },
    primaryBtn: { padding: '12px 24px', backgroundColor: 'rgba(255, 255, 255, 0.3)', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(5px)' },
    secondaryBtn: { padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer' },
    
    section: { padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' },
    sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' },
    line: { height: '1px', backgroundColor: '#e2e8f0', flex: 1, maxWidth: '100px' },
    sectionTitle: { fontSize: '26px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', margin: 0 },
    loadingText: { textAlign: 'center', color: '#64748b', margin: '40px 0' },
    
    horizontalScroll: {
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '16px',
        padding: '10px 0 30px',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    
    seeAllContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '-15px',
        paddingRight: '10px'
    },
    seeAllText: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#ff4d6d',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 77, 109, 0.05)',
    },
    
    // Category Square
    squareCard: {
        flex: '0 0 auto',
        width: '220px',
        height: '220px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '40px 20px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: 600,
        margin: 0,
        textAlign: 'center'
    },
    
    // Vendor Square
    squareCardVendor: {
        flex: '0 0 auto',
        width: '220px',
        height: '220px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
    },
    cardOverlayVendor: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '40px 20px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
        color: '#fff',
    },
    vendorName: {
        fontSize: '18px',
        fontWeight: 700,
        margin: '0 0 4px 0',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
    },
    vendorProfession: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#e2e8f0',
        margin: 0,
    },
    
    // Event Square
    squareCardEvent: {
        flex: '0 0 auto',
        width: '220px',
        height: '220px',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    },
    eventPriceBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: '#1e293b',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 700,
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        zIndex: 2
    },
    cardOverlayEvent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '50px 20px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)',
        color: '#fff',
    },
    eventName: {
        fontSize: '18px',
        fontWeight: 700,
        margin: '0 0 6px 0',
        lineHeight: 1.3,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
    },
    eventDate: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#cbd5e1',
        margin: 0,
    }
};

export default Home;
