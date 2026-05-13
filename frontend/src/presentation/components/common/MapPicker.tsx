import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiX, FiCheck, FiNavigation, FiSearch } from 'react-icons/fi';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';

// Using CDN for marker images to ensure they load regardless of build setup
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
}

const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ initialLat, initialLng, onSelect, onClose }) => {
    const [position, setPosition] = useState<[number, number]>([
        initialLat || 10.8505, 
        initialLng || 76.2711
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPosition([parseFloat(lat), parseFloat(lon)]);
            } else {
                alert("Location not found");
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = () => {
        onSelect(position[0], position[1]);
        onClose();
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Select Location</h3>
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <div style={styles.searchBar}>
                            <FiSearch size={14} color="#94a3b8" />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for location..." 
                                style={styles.searchInput}
                            />
                            {isSearching && <div style={styles.searchLoading} />}
                        </div>
                    </form>
                    <button onClick={onClose} style={styles.closeBtn}><FiX size={20} /></button>
                </div>
                
                <div style={styles.mapWrapper}>
                    <MapContainer 
                        center={position} 
                        zoom={13} 
                        style={{ height: '450px', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapResizer />
                        <ChangeView center={position} />
                        <MapEvents onClick={(lat, lng) => setPosition([lat, lng])} />
                        <Marker position={position} />
                    </MapContainer>
                </div>

                <div style={styles.footer}>
                    <div style={styles.coordInfo}>
                        <FiNavigation size={14} color="#2563eb" />
                        <span>{position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
                    </div>
                    <div style={styles.actions}>
                        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button onClick={handleSelect} style={styles.confirmBtn}>
                            <FiCheck /> Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        overflow: 'hidden'
    },
    header: {
        padding: '20px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f1f5f9',
        gap: '20px'
    },
    title: { margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b', flexShrink: 0 },
    searchForm: { flex: 1, maxWidth: '400px' },
    searchBar: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        backgroundColor: '#f1f5f9', 
        padding: '8px 15px', 
        borderRadius: '12px',
        position: 'relative'
    },
    searchInput: { 
        border: 'none', 
        background: 'none', 
        outline: 'none', 
        fontSize: '13px', 
        color: '#1e293b', 
        width: '100%',
        fontWeight: 400
    },
    searchLoading: {
        width: '12px',
        height: '12px',
        border: '2px solid #2563eb',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    closeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', flexShrink: 0 },
    mapWrapper: { height: '470px', width: '100%', padding: '10px' },
    footer: {
        padding: '20px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    coordInfo: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500 },
    actions: { display: 'flex', gap: '12px' },
    cancelBtn: { padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' },
    confirmBtn: { padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }
};

export default MapPicker;
