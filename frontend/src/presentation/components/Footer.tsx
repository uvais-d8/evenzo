import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.section}>
                    <h3 style={styles.title}>Exclusive</h3>
                    <p style={styles.text}>Subscribe</p>
                    <p style={styles.subtext}>Get 10% off your first order</p>
                    <div style={styles.inputContainer}>
                        <input type="email" placeholder="Enter your email" style={styles.input} />
                        <button style={styles.arrowBtn}>→</button>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.title}>Support</h3>
                    <p style={styles.text}>111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.</p>
                    <p style={styles.text}>exclusive@gmail.com</p>
                    <p style={styles.text}>+88015-88888-9999</p>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.title}>Account</h3>
                    <p style={styles.link}>My Account</p>
                    <p style={styles.link}>Login / Register</p>
                    <p style={styles.link}>Cart</p>
                    <p style={styles.link}>Wishlist</p>
                    <p style={styles.link}>Shop</p>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.title}>Quick Link</h3>
                    <p style={styles.link}>Privacy Policy</p>
                    <p style={styles.link}>Terms Of Use</p>
                    <p style={styles.link}>FAQ</p>
                    <p style={styles.link}>Contact</p>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.title}>Download App</h3>
                    <p style={styles.subtext}>Save $3 with App New User Only</p>
                    <div style={styles.downloadRow}>
                        <div style={styles.qrCode}>
                            {/* QR Code Placeholder */}
                            <div style={styles.qrInner}></div>
                        </div>
                        <div style={styles.appBadges}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={styles.appBadge} />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={styles.appBadge} />
                        </div>
                    </div>
                    <div style={styles.socialIcons}>
                        <FaFacebookF style={styles.socialIcon} />
                        <FaTwitter style={styles.socialIcon} />
                        <FaInstagram style={styles.socialIcon} />
                        <FaLinkedinIn style={styles.socialIcon} />
                    </div>
                </div>
            </div>
            <div style={styles.bottomBar}>
                <p style={styles.copyright}>© Copyright Evenzo 2026. All right reserved</p>
            </div>
        </footer>
    );
};

const styles: Record<string, React.CSSProperties> = {
    footer: { backgroundColor: '#2563eb', color: 'white', padding: '80px 0 20px', fontFamily: "'Inter', sans-serif" },
    container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', padding: '0 20px' },
    section: { display: 'flex', flexDirection: 'column', gap: '15px' },
    title: { fontSize: '18px', fontWeight: 600, marginBottom: '5px' },
    text: { fontSize: '14px', opacity: 0.9, lineHeight: 1.6, margin: 0 },
    subtext: { fontSize: '12px', opacity: 0.8, margin: 0 },
    link: { fontSize: '14px', cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.2s', margin: 0 },
    inputContainer: { display: 'flex', border: '1.5px solid white', borderRadius: '4px', padding: '10px 15px', marginTop: '10px', alignItems: 'center' },
    input: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '13px', width: '100%', outline: 'none' },
    arrowBtn: { backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' },
    downloadRow: { display: 'flex', gap: '15px', marginTop: '10px', alignItems: 'center' },
    qrCode: { width: '80px', height: '80px', backgroundColor: 'white', padding: '5px', borderRadius: '4px' },
    qrInner: { width: '100%', height: '100%', backgroundColor: '#000' }, // Placeholder for QR pattern
    appBadges: { display: 'flex', flexDirection: 'column', gap: '8px' },
    appBadge: { height: '30px', cursor: 'pointer' },
    socialIcons: { display: 'flex', gap: '24px', marginTop: '20px' },
    socialIcon: { fontSize: '20px', cursor: 'pointer', opacity: 1 },
    bottomBar: { borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '80px', paddingTop: '20px', textAlign: 'center' },
    copyright: { fontSize: '14px', opacity: 0.5, margin: 0 }
};

export default Footer;
