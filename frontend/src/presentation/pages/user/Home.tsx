import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../../infrastructure/http/axiosClient';

function Home() {
    const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const categories = [
        { title: "Concerts", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" },
        { title: "Corporate Conferences", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop" },
        { title: "Food", image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop" },
        { title: "Weddings", image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" },
        { title: "Exhibitions & Trade Shows", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070&auto=format&fit=crop" },
    ];

    const fetchNearbyEvents = async () => {
        const lat = sessionStorage.getItem("userLat");
        const lng = sessionStorage.getItem("userLng");

        if (!lat || !lng) return;

        setLoadingEvents(true);
        try {
            const res = await axiosClient.get(`/events?lat=${lat}&lng=${lng}&radius=50`);
            setNearbyEvents(res.data);
        } catch (error) {
            console.error("Error fetching nearby events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        fetchNearbyEvents();
    }, []);

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
                            <button style={styles.primaryBtn}>Plan Your Party Now</button>
                            <button style={styles.secondaryBtn}>Explore Events</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nearby Events Section */}
            {nearbyEvents.length > 0 && (
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.line}></div>
                        <h2 style={styles.sectionTitle}>Events Near You</h2>
                        <div style={styles.line}></div>
                    </div>
                    <div style={styles.categoryGrid}>
                        {loadingEvents ? (
                            <p style={{ color: '#64748b' }}>Finding nearby events...</p>
                        ) : (
                            nearbyEvents.map((event, index) => (
                                <div key={index} style={styles.eventCard}>
                                    <div style={styles.eventImageContainer}>
                                        <img src={event.image} alt={event.title} style={styles.categoryImage} />
                                        <div style={styles.eventPrice}>${event.price}</div>
                                    </div>
                                    <h3 style={styles.eventName}>{event.title}</h3>
                                    <p style={styles.eventDetail}>{event.address}</p>
                                    <p style={styles.eventDetail}>{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            )}

            {/* Popular Categories */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.line}></div>
                    <h2 style={styles.sectionTitle}>Popular Categories</h2>
                    <div style={styles.line}></div>
                </div>
                <div style={styles.categoryGrid}>
                    {categories.map((cat, index) => (
                        <div key={index} style={styles.categoryCard}>
                            <div style={styles.imageContainer}>
                                <img src={cat.image} alt={cat.title} style={styles.categoryImage} />
                            </div>
                            <p style={styles.categoryName}>{cat.title}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.line}></div>
                    <h2 style={styles.sectionTitle}>Upcoming Events</h2>
                    <div style={styles.line}></div>
                </div>
                <div style={styles.upcomingBanner}>
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                        alt="Upcoming Events"
                        style={styles.bannerImage}
                    />
                </div>
            </section>
        </div>
    );
}


const styles: Record<string, React.CSSProperties> = {
    container: {
        width: '100%',
        backgroundColor: '#fff',
    },
    hero: {
        height: '600px',
        backgroundImage: 'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
    },
    heroContent: {
        maxWidth: '800px',
        textAlign: 'center',
        color: '#fff',
    },
    heroTitle: {
        fontSize: '48px',
        fontWeight: 700,
        marginBottom: '20px',
    },
    heroSubtitle: {
        fontSize: '18px',
        lineHeight: '1.6',
        marginBottom: '30px',
        opacity: 0.9,
    },
    heroButtons: {
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
    },
    primaryBtn: {
        padding: '12px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
        backdropFilter: 'blur(5px)',
    },
    secondaryBtn: {
        padding: '12px 24px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    heroArrows: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '100%',
        left: 0,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px',
        pointerEvents: 'none',
    },
    arrow: {
        fontSize: '32px',
        color: '#fff',
        cursor: 'pointer',
        pointerEvents: 'auto',
        opacity: 0.7,
    },
    section: {
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '40px',
    },
    line: {
        height: '1px',
        backgroundColor: '#ccc',
        flex: 1,
        maxWidth: '100px',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#333',
        whiteSpace: 'nowrap',
    },
    categoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    categoryCard: {
        textAlign: 'center',
    },
    imageContainer: {
        height: '150px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '15px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    categoryName: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#444',
    },
    upcomingBanner: {
        width: '100%',
        height: '400px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
};

export default Home;
