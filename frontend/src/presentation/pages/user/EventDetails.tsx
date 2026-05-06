import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { IEvent } from '../../../core/types/event.types';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiMail, FiSend, FiShare2, FiClock } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const getImageUrl = (path: string | undefined) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

function EventDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { eventRepository, bookingRepository } = useRepositories();

    const [event, setEvent] = useState<IEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [tickets, setTickets] = useState(1);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                if (id) {
                    const data = await eventRepository.getEventById(id);
                    setEvent(data);
                }
            } catch (error) {
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, eventRepository]);

    const handleBooking = async () => {
        if (!event) return;
        setBooking(true);
        try {
            await bookingRepository.createBooking({
                eventId: event._id,
                ticketCount: tickets
            });
            toast.success("Ticket Booked Successfully!");
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <div style={styles.center}>Loading Event...</div>;
    if (!event) return <div style={styles.center}>Event Not Found</div>;

    return (
        <main style={styles.container}>
            <div style={styles.breadcrumbTitle}>
                <h2 style={styles.mainTitle}>Event Details</h2>
                <div style={styles.titleLine}></div>
            </div>

                <div style={styles.topSection}>
                    <div style={styles.imageCol}>
                        <img src={getImageUrl(event.image)} alt={event.title} style={styles.mainImage} />
                        {event.images && event.images.length > 1 && (
                            <div style={styles.gallery}>
                                {event.images.map((img, idx) => (
                                    <img key={idx} src={getImageUrl(img)} alt="gallery" style={styles.galleryThumb} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={styles.infoColWrapper}>
                        <div style={styles.infoCol}>
                            <h1 style={styles.eventTitle}>{event.title}</h1>
                            <p style={styles.eventDescription}>
                                {event.description || "Experience this amazing event featuring top-notch organization and high-energy vibes. Join us for an unforgettable live session."}
                            </p>

                            <div style={styles.detailBox}>
                                <div style={styles.iconCircle}><FiCalendar /></div>
                                <div style={styles.boxContent}>
                                    <p style={styles.boxLabel}>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <p style={styles.boxSub}>{event.time || "2:00 PM - 4:00 PM"}</p>
                                </div>
                            </div>

                            <div style={styles.detailBox}>
                                <div style={styles.iconCircle}><FiMapPin /></div>
                                <div style={styles.boxContent}>
                                    <p style={styles.boxLabel}>{event.locationName ? `${event.venue} - ${event.locationName}` : (event.venue || "EVENT VENUE")}</p>
                                    <p style={styles.boxSub}>{event.address}</p>
                                </div>
                            </div>

                            <div style={styles.bookingRow}>
                                {event.isTicketed && (
                                    <div style={styles.countSelector}>
                                        <button style={styles.countBtn} onClick={() => setTickets(Math.max(1, tickets - 1))}>-</button>
                                        <span style={styles.countValue}>{tickets}</span>
                                        <button style={styles.countBtn} onClick={() => setTickets(tickets + 1)}>+</button>
                                    </div>
                                )}
                                <span style={styles.helperText}>{event.isTicketed ? "Select the ticket count you want" : "Exclusive Free Event"}</span>
                                <div style={styles.actionIcons}>
                                    <FiMail style={styles.smallIcon} />
                                    <FiSend style={styles.smallIcon} />
                                    <button style={styles.shareBtn}><FiShare2 /> share</button>
                                </div>
                            </div>

                            <button style={styles.bookNowBtn} onClick={handleBooking} disabled={booking}>
                                {booking ? "Processing..." : (event.isTicketed ? "book now" : "reserve spot")}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={styles.bottomSection}>
                    <div style={styles.aboutCard}>
                        <div style={styles.aboutContent}>
                            <h3 style={styles.aboutHeading}>About The Event</h3>
                            <p style={styles.aboutText}>{event.title}</p>
                            <p style={styles.aboutText}>Category - {typeof event.category === 'object' ? (event.category as any).name : 'Event'}</p>
                            <p style={styles.aboutText}>{event.isTicketed ? `Ticket Price - ₹${event.price}` : 'Entry - Free'}</p>
                            <p style={styles.aboutText}>Date - {new Date(event.date).toLocaleDateString()}</p>
                            <p style={styles.aboutText}>Venue - {event.venue || "Will update soon"}</p>
                            {event.locationName && <p style={styles.aboutText}>Location - {event.locationName}</p>}
                            {event.mainGuests && <p style={styles.aboutText}>Guests - {event.mainGuests}</p>}
                            <p style={styles.aboutText}>Contact - {event.contact || "+91 99957 10101"}</p>
                        </div>
                        <div style={styles.qrCode}>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=EvenzoEvent" alt="QR" />
                        </div>
                    </div>

                    <div style={styles.mapCard}>
                        <div style={styles.mapWrapper}>
                            <iframe 
                                title="Event Location"
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={
                                    event.location?.coordinates 
                                    ? `https://maps.google.com/maps?q=${event.location.coordinates[1]},${event.location.coordinates[0]}&z=15&output=embed`
                                    : `https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&z=15&output=embed`
                                }
                                style={{ border: 0, borderRadius: '24px 24px 0 0' }}
                            ></iframe>
                        </div>
                        <div style={styles.organiserInfo}>
                            <p style={styles.organiserText}>Organised by Xplore 24 ( xplore24.gcek@gmail.com )</p>
                            <p style={styles.organiserDesc}>
                                Xplore '24 stands as a beacon of innovation, creativity, and excellence, uniting the realms of technology, management, and culture under one dynamic platform. 
                            </p>
                            <a href="#" style={styles.exploreLink}>Explore more events by Xplore 24</a>
                        </div>
                    </div>
                </div>
            </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    pageWrapper: { backgroundColor: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    promoBar: { backgroundColor: '#3b82f6', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px', fontWeight: 500 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid #f1f5f9' },
    socialNav: { display: 'flex', gap: '20px' },
    socialIcon: { fontSize: '18px', color: '#1e293b', cursor: 'pointer' },
    logo: { fontSize: '24px', fontWeight: 800, color: '#1e293b', letterSpacing: '-1px' },
    menuBtn: { fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' },

    container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    breadcrumbTitle: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' },
    mainTitle: { fontSize: '22px', fontWeight: 600, color: '#1e293b', margin: 0, whiteSpace: 'nowrap' },
    titleLine: { height: '1px', backgroundColor: '#94a3b8', flex: 1 },

    topSection: { display: 'grid', gridTemplateColumns: '55% 45%', gap: '30px', marginBottom: '60px' },
    imageCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
    mainImage: { width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    gallery: { display: 'flex', gap: '15px' },
    galleryThumb: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', cursor: 'pointer' },

    infoColWrapper: { display: 'flex', flexDirection: 'column' },
    infoCol: { backgroundColor: '#f0f4ff', padding: '40px', borderRadius: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '25px' },
    eventTitle: { fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: 0 },
    eventDescription: { color: '#64748b', lineHeight: '1.6', fontSize: '14px' },
    
    detailBox: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
    iconCircle: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#1e293b' },
    boxContent: { display: 'flex', flexDirection: 'column' },
    boxLabel: { margin: 0, fontSize: '14px', fontWeight: 600, color: '#475569' },
    boxSub: { margin: 0, fontSize: '12px', color: '#94a3b8' },

    bookingRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: '#fff', padding: '15px 25px', borderRadius: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginTop: 'auto' },
    countSelector: { display: 'flex', alignItems: 'center', gap: '15px', borderRight: '1px solid #e2e8f0', paddingRight: '15px' },
    countBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' },
    countValue: { fontSize: '16px', fontWeight: 700, color: '#1e293b' },
    helperText: { fontSize: '12px', color: '#94a3b8', flex: 1 },
    actionIcons: { display: 'flex', alignItems: 'center', gap: '15px' },
    smallIcon: { fontSize: '16px', color: '#1e293b', cursor: 'pointer' },
    shareBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' },
    
    bookNowBtn: { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '18px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s', textTransform: 'lowercase' },

    bottomSection: { display: 'grid', gridTemplateColumns: '40% 60%', gap: '30px', alignItems: 'start' },
    aboutCard: { backgroundColor: '#f0f4ff', padding: '40px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    aboutHeading: { fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#475569' },
    aboutText: { margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: 500 },
    qrCode: { padding: '10px', backgroundColor: '#fff', borderRadius: '12px' },

    mapCard: { backgroundColor: '#f0f4ff', borderRadius: '24px', overflow: 'hidden' },
    mapWrapper: { height: '300px', position: 'relative' },
    organiserInfo: { padding: '30px', backgroundColor: '#3b82f6', color: 'white' },
    organiserText: { fontSize: '13px', fontWeight: 600, marginBottom: '15px' },
    organiserDesc: { fontSize: '12px', lineHeight: '1.6', opacity: 0.9, marginBottom: '20px' },
    exploreLink: { color: 'white', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' },

    footer: { backgroundColor: '#3b82f6', color: 'white', padding: '60px 20px', marginTop: '100px' },
    footerGrid: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px' },
    footerHead: { fontSize: '16px', fontWeight: 700, marginBottom: '20px' },
    footerLink: { fontSize: '14px', opacity: 0.8, marginBottom: '10px' },

    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '18px', color: '#64748b' }
};

export default EventDetails;
