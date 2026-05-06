import { useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FiUser, FiLogOut, FiMenu, FiArrowLeft } from 'react-icons/fi';
import React from 'react';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = sessionStorage.getItem("token");

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("userData");
        navigate("/login");
    };

    const isAdminPage = location.pathname.startsWith("/admin");
    const isVendorPage = location.pathname.startsWith("/vendor");
    const isHomePage = location.pathname === "/";

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
                        {!isHomePage && (
                            <div style={styles.backButton} onClick={() => navigate(-1)} title="Go Back">
                                <FiArrowLeft style={styles.actionIcon} />
                                <span style={styles.backText}>Back</span>
                            </div>
                        )}
                        {isHomePage && (
                            <>
                                <FaInstagram style={styles.socialIcon} />
                                <FaFacebookF style={styles.socialIcon} />
                                <FaLinkedinIn style={styles.socialIcon} />
                            </>
                        )}
                    </div>

                    <h1 style={styles.logo} onClick={() => navigate("/")}>evenzo</h1>

                    <div style={styles.navActions}>
                        <div style={styles.authIcons}>
                            {token && (
                                <>
                                    <FiUser 
                                        style={styles.actionIcon} 
                                        onClick={() => navigate("/profile")} 
                                        title="Profile"
                                    />
                                    <FiLogOut 
                                        style={styles.actionIcon} 
                                        onClick={handleLogout} 
                                        title="Logout"
                                    />
                                </>
                            )}
                            <FiMenu 
                                style={styles.actionIcon} 
                                onClick={() => {/* Toggle menu */}} 
                                title="Menu"
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

const styles: Record<string, React.CSSProperties> = {
    announcementBar: { backgroundColor: '#2563eb', color: '#fff', textAlign: 'center', fontSize: '12px', width: '100%' },
    announcementContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0', gap: '20px' },
    shopNow: { color: '#fff', marginLeft: '20px', fontSize: '12px', textDecoration: 'none', fontWeight: 500 },
    navbar: { borderBottom: '1px solid #eee', padding: '10px 0', backgroundColor: '#fff', width: '100%' },
    navContent: { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' },
    socials: { display: 'flex', gap: '20px', flex: 1, alignItems: 'center' },
    socialIcon: { cursor: 'pointer', fontSize: '18px', color: '#333' },
    backButton: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'opacity 0.2s' },
    backText: { fontSize: '14px', fontWeight: 600, color: '#333' },
    logo: { fontSize: '32px', fontWeight: 800, margin: 0, textAlign: 'center', cursor: 'pointer', flex: 1, color: '#000', letterSpacing: '-1.5px', fontFamily: "'Inter', sans-serif" },
    navActions: { display: 'flex', alignItems: 'center', gap: '30px', flex: 1, justifyContent: 'flex-end' },
    authIcons: { display: 'flex', gap: '20px', alignItems: 'center' },
    actionIcon: { fontSize: '22px', color: '#333', cursor: 'pointer', transition: 'color 0.2s' },
    menuIcon: { cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '10px' },
    menuLine: { width: '24px', height: '2px', backgroundColor: '#333' }
};

export default Header;
