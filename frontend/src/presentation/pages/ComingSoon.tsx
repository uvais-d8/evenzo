import React from "react";
import { useNavigate } from "react-router-dom";

interface Props {
    title?: string;
}

const ComingSoon: React.FC<Props> = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div style={s.wrapper}>
            <div style={s.iconRing}>
                <span style={s.icon}>🚀</span>
            </div>
            <h2 style={s.heading}>{title || "Coming Soon"}</h2>
            <p style={s.sub}>
                This feature is currently under active development and will be launching soon. Stay tuned!
            </p>
            <button style={s.btn} onClick={() => navigate(-1)}>Back to Previous Page</button>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        padding: "40px",
        gap: '20px',
    },
    iconRing: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        border: '1px solid rgba(37, 99, 235, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        backdropFilter: 'blur(8px)',
    },
    icon: { fontSize: '32px' },
    heading: {
        fontSize: '22px',
        fontWeight: 500,
        color: '#1e293b',
        margin: 0,
    },
    sub: {
        fontSize: '14px',
        color: '#64748b',
        maxWidth: '400px',
        lineHeight: 1.6,
        margin: 0,
        fontWeight: 300,
    },
    btn: {
        marginTop: 10,
        padding: "10px 30px",
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#2563eb',
        color: 'white',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        boxShadow: '0 8px 15px rgba(37, 99, 235, 0.15)',
    },
};

export default ComingSoon;
