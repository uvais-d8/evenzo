import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
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
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) cancelRef.current?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    const confirmColors: Record<string, React.CSSProperties> = {
        danger: { backgroundColor: '#ef4444', color: '#fff' },
        warning: { backgroundColor: '#f59e0b', color: '#fff' },
        info: { backgroundColor: '#2563eb', color: '#fff' },
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
                    >
                        {cancelLabel}
                    </button>
                    <button
                        id="confirm-ok-btn"
                        style={{ ...styles.confirmBtn, ...confirmColors[variant] }}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
        width: '90%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    title: { margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#1e293b' },
    message: { margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: 1.6 },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelBtn: {
        padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569',
        border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', fontWeight: 500,
    },
    confirmBtn: {
        padding: '10px 20px', border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '14px', fontWeight: 600,
    },
};

export default ConfirmDialog;
