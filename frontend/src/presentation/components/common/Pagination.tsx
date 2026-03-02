import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}) => {
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 4) pages.push('...');
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 3) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div style={styles.container} aria-label="Pagination">
            <button
                id="pagination-prev"
                style={{ ...styles.btn, ...(currentPage === 1 ? styles.disabled : {}) }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                aria-label="Previous page"
            >
                &#8249;
            </button>

            {pages.map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} style={styles.ellipsis}>…</span>
                ) : (
                    <button
                        key={page}
                        id={`pagination-page-${page}`}
                        style={{
                            ...styles.btn,
                            ...(page === currentPage ? styles.active : {}),
                        }}
                        onClick={() => onPageChange(page as number)}
                        disabled={isLoading}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                id="pagination-next"
                style={{ ...styles.btn, ...(currentPage === totalPages ? styles.disabled : {}) }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                aria-label="Next page"
            >
                &#8250;
            </button>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '24px' },
    btn: {
        minWidth: '36px', height: '36px', padding: '0 6px',
        border: '1px solid #e2e8f0', borderRadius: '8px',
        backgroundColor: '#fff', color: '#475569', cursor: 'pointer',
        fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
    },
    active: { backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb', fontWeight: 700 },
    disabled: { opacity: 0.4, cursor: 'not-allowed' },
    ellipsis: { padding: '0 4px', color: '#94a3b8', fontSize: '14px' },
};

export default Pagination;
