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
                    <div style={styles.appLinks}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={styles.appBadge} />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={styles.appBadge} />
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
    footer: {
        backgroundColor: '#2563eb', // Standard blue
        color: 'white',
        padding: '80px 0 20px',
        fontFamily: "'Inter', sans-serif"
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '30px',
        padding: '0 20px'
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    title: {
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '4px'
    },
    text: {
        fontSize: '14px',
        opacity: 0.9,
        lineHeight: 1.5
    },
    subtext: {
        fontSize: '12px',
        opacity: 0.7
    },
    link: {
        fontSize: '14px',
        cursor: 'pointer',
        opacity: 0.9,
        transition: 'opacity 0.2s',
        display: 'block'
    },
    inputContainer: {
        display: 'flex',
        border: '1px solid white',
        borderRadius: '4px',
        padding: '8px',
        marginTop: '8px'
    },
    input: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '13px',
        width: '100%',
        outline: 'none'
    },
    arrowBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px'
    },
    appLinks: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px'
    },
    appBadge: {
        height: '35px',
        cursor: 'pointer'
    },
    socialIcons: {
        display: 'flex',
        gap: '20px',
        marginTop: '20px'
    },
    socialIcon: {
        fontSize: '18px',
        cursor: 'pointer',
        opacity: 0.9
    },
    bottomBar: {
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '60px',
        paddingTop: '20px',
        textAlign: 'center'
    },
    copyright: {
        fontSize: '12px',
        opacity: 0.4
    }
};

export default Footer;
