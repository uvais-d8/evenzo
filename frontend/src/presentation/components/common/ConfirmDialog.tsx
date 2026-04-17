import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
    isLoading = false
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) cancelRef.current?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles: Record<string, React.CSSProperties> = {
        danger: { backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' },
        warning: { backgroundColor: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' },
        info: { backgroundColor: 'rgba(37, 99, 235, 0.05)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)' },
        primary: { backgroundColor: 'rgba(37, 99, 235, 0.05)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)' },
    };

    return (
        <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div style={styles.modal}>
                <h3 id="confirm-title" style={styles.title}>{title}</h3>
                <p style={styles.message}>{message}</p>
                <div style={styles.actions}>
                    <button
                        id="confirm-cancel-btn"
                        ref={cancelRef}
                        style={styles.cancelBtn}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        id="confirm-ok-btn"
                        style={{ ...styles.confirmBtn, ...variantStyles[variant] }}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    },
    modal: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        width: '90%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        textAlign: 'center'
    },
    title: { margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: '#1e293b' },
    message: { margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: 1.6, fontWeight: 300 },
    actions: { display: 'flex', justifyContent: 'center', gap: '12px' },
    cancelBtn: {
        padding: '10px 24px', backgroundColor: 'transparent', color: '#64748b',
        border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer',
        fontSize: '13px', fontWeight: 600, transition: 'all 0.2s'
    },
    confirmBtn: {
        padding: '10px 24px', borderRadius: '12px',
        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s'
    },
};

export default ConfirmDialog;
