import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
    label: string;
    variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    success: { backgroundColor: '#dcfce7', color: '#16a34a' },
    warning: { backgroundColor: '#fef9c3', color: '#ca8a04' },
    danger: { backgroundColor: '#fee2e2', color: '#dc2626' },
    info: { backgroundColor: '#dbeafe', color: '#2563eb' },
    neutral: { backgroundColor: '#f1f5f9', color: '#64748b' },
};

const Badge: React.FC<BadgeProps> = ({ label, variant }) => (
    <span
        style={{
            ...styles.badge,
            ...variantStyles[variant],
        }}
    >
        {label}
    </span>
);

const styles: Record<string, React.CSSProperties> = {
    badge: {
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.02em',
    },
};

export default Badge;
