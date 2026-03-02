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
                This section is under construction and will be available shortly.
            </p>
            <button style={s.btn} onClick={() => navigate(-1)}>← Go Back</button>
        </div>
    );
};

const s: Record<string, React.CSSProperties> = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        padding: "40px 20px",
        gap: 16,
    },
    iconRing: {
        width: 90,
        height: 90,
        borderRadius: "50%",
        backgroundColor: "#eff6ff",
        border: "2px solid #bfdbfe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    icon: { fontSize: 40 },
    heading: {
        fontSize: 26,
        fontWeight: 700,
        color: "#1e293b",
        margin: 0,
    },
    sub: {
        fontSize: 15,
        color: "#94a3b8",
        maxWidth: 380,
        lineHeight: 1.6,
        margin: 0,
    },
    btn: {
        marginTop: 8,
        padding: "10px 28px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        color: "#3b82f6",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
    },
};

export default ComingSoon;
