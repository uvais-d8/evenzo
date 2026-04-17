import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaMapMarkerAlt } from "react-icons/fa";
import React from 'react';
import toast from 'react-hot-toast';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = sessionStorage.getItem("token");

    const isAuthPage = [
        "/login",
        "/signup",
        "/vendor/login",
        "/vendor/signup",
        "/admin/login"
    ].includes(location.pathname);

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userData");
        navigate("/login");
    };

    const isAdminPage = location.pathname.startsWith("/admin");
    const isVendorPage = location.pathname.startsWith("/vendor");

    return (
        <>
            {/* Top Blue Bar */}
            {!(isAdminPage || isVendorPage) && (
                <div style={styles.announcementBar}>
                    <div style={styles.announcementContent}>
                        <span>25 %Offer for the first event booking</span>
                        <a href="#" style={styles.shopNow}>ShopNow</a>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <div style={styles.socials}>
                        <FaInstagram style={styles.socialIcon} />
                        <FaFacebookF style={styles.socialIcon} />
                        <FaLinkedinIn style={styles.socialIcon} />
                    </div>

                    <h1 style={styles.logo} onClick={() => navigate("/")}>evenzo</h1>

                    <div style={styles.navActions}>
                        {token && (
                            <button
                                onClick={handleLogout}
                                style={styles.logoutBtn}
                                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                            >
                                Logout
                            </button>
                        )}
                        <div style={styles.menuIcon}>
                            <div style={styles.menuLine}></div>
                            <div style={styles.menuLine}></div>
                            <div style={styles.menuLine}></div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
    announcementBar: {
        backgroundColor: '#2563eb',
        color: '#fff',
        textAlign: 'center',
        fontSize: '12px',
        width: '100%',
    },
    shopNow: {
        color: '#fff',
        marginLeft: '20px',
        fontSize: '12px',
        textDecoration: 'none',
        fontWeight: 500
    },
    navbar: {
        marginTop: '0px',
        borderBottom: '1px solid #eee',
        padding: '10px 0',
        backgroundColor: '#fff',
        width: '100%',
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px'
    },
    socials: {
        display: 'flex',
        gap: '20px',
        flex: 1
    },
    socialIcon: {
        cursor: 'pointer',
        fontSize: '18px',
        color: '#333'
    },
    logo: {
        fontSize: '32px',
        fontWeight: 800,
        margin: 0,
        textAlign: 'center',
        cursor: 'pointer',
        flex: 1,
        color: '#000',
        letterSpacing: '-1.5px',
        fontFamily: "'Inter', sans-serif"
    },
    announcementContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0',
        gap: '20px'
    },
    navActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '30px',
        flex: 1,
        justifyContent: 'flex-end'
    },
    logoutBtn: {
        padding: "8px 16px",
        backgroundColor: "#457de4ff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "12px",
        transition: "opacity 0.2s"
    },

    notification: {
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    },
    badge: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '10px',
        borderRadius: '50%',
        width: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    location: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        gap: '2px'
    },
    locationText: {
        fontSize: '9px',
        color: '#666',
        fontWeight: 500
    },
    locationIcon: {
        cursor: 'pointer',
        fontSize: '14px',
        color: '#000'
    },
    menuIcon: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginLeft: '10px'
    },
    menuLine: {
        width: '24px',
        height: '2px',
        backgroundColor: '#333'
    },
    iconBlack: {
        cursor: 'pointer',
        fontSize: '20px',
        color: '#000'
    }
};

export default Header;
