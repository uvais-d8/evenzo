import React, { useState, useEffect, useCallback } from 'react';
import { useRepositories } from '../../../infrastructure/context/RepositoryContext';
import { ICategory, PaginatedResponse } from '../../../core/types/category.types';
import { CreateCategoryPayload, UpdateCategoryPayload } from '../../../core/repositories/ICategoryRepository';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../core/constants/Messages';

const PAGE_LIMIT = 10;

const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7000';
    return `${baseUrl}${path}`;
};

const CategoryManagement: React.FC = () => {
    const { categoryRepository } = useRepositories();
    const [result, setResult] = useState<PaginatedResponse<ICategory> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [formData, setFormData] = useState<CreateCategoryPayload>({ name: '', description: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchCategories = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const res = await categoryRepository.getCategories({ page: p, limit: PAGE_LIMIT });
            setResult(res);
        } catch {
            toast.error(ERROR_MESSAGES.FETCH_CATEGORIES_FAILED);
        } finally {
            setLoading(false);
        }
    }, [categoryRepository]);

    useEffect(() => { fetchCategories(page); }, [fetchCategories, page]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description || '');
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (editingCategory) {
                await categoryRepository.updateCategory(editingCategory._id!, submitData);
                toast.success(SUCCESS_MESSAGES.CATEGORY_UPDATED);
            } else {
                await categoryRepository.createCategory(submitData);
                toast.success(SUCCESS_MESSAGES.CATEGORY_CREATED);
            }
            setShowModal(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setImageFile(null);
            setImagePreview(null);
            fetchCategories(page);
        } catch (error) {
            const axiosErr = error as AxiosError<{ message?: string }>;
            toast.error(axiosErr.response?.data?.message || ERROR_MESSAGES.DEFAULT);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await categoryRepository.deleteCategory(deleteTarget);
            toast.success(SUCCESS_MESSAGES.CATEGORY_DELETED);
            setDeleteTarget(null);
            fetchCategories(page);
        } catch {
            toast.error(ERROR_MESSAGES.DEFAULT);
            setDeleteTarget(null);
        }
    };

    if (loading && !result) return <LoadingSpinner message="Loading categories..." />;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Category Management</h2>
                    <p style={styles.subtitle}>Organize and manage event categories</p>
                </div>
                <button
                    id="add-category-btn"
                    style={styles.addBtn}
                    onClick={() => { 
                        setEditingCategory(null); 
                        setFormData({ name: '', description: '' }); 
                        setImageFile(null);
                        setImagePreview(null);
                        setShowModal(true); 
                    }}
                >
                    + Add New Category
                </button>
            </div>

            <div style={styles.grid}>
                {result && result.data.length > 0 ? (
                    result.data.map((cat: ICategory) => (
                        <div key={cat._id} style={styles.card}>
                            <img src={getImageUrl(cat.image)} alt={cat.name} style={styles.cardImage} />
                            <div style={styles.cardHeader}>
                                <h3 style={styles.catName}>{cat.name}</h3>
                                <div style={styles.actions}>
                                    <button
                                        id={`edit-category-${cat._id}`}
                                        style={styles.editBtn}
                                        onClick={() => {
                                            setEditingCategory(cat);
                                            setFormData({ name: cat.name, description: cat.description ?? '' });
                                            setImageFile(null);
                                            setImagePreview(cat.image ? getImageUrl(cat.image) : null);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        id={`delete-category-${cat._id}`}
                                        style={styles.delBtn}
                                        onClick={() => setDeleteTarget(cat._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p style={styles.catDesc}>{cat.description ?? 'No description'}</p>
                        </div>
                    ))
                ) : (
                    <p style={styles.empty}>No categories found.</p>
                )}
            </div>

            {result && result.totalPages > 1 && (
                <div style={styles.paginationWrapper}>
                    <Pagination
                        currentPage={page}
                        totalPages={result.totalPages}
                        onPageChange={setPage}
                        isLoading={loading}
                    />
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div style={styles.overlay} role="dialog" aria-modal="true">
                    <div style={styles.modal}>
                        <h3 style={styles.modalTitle}>
                            {editingCategory ? 'Update Category' : 'Add New Category'}
                        </h3>
                        <p style={styles.modalSubtitle}>Enter the category details below</p>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Category Name *</label>
                                <input
                                    id="category-name-input"
                                    style={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Corporate Events"
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    id="category-description-input"
                                    style={styles.textarea}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Write a brief category description..."
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    style={styles.input}
                                />
                                {imagePreview && (
                                    <div style={styles.previewContainer}>
                                        <img src={imagePreview} alt="Preview" style={styles.previewImage} />
                                    </div>
                                )}
                            </div>
                            <div style={styles.modalActions}>
                                <button id="cancel-category-btn" type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button id="save-category-btn" type="submit" style={styles.saveBtn}>
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: { width: '100%', padding: '0px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '20px', fontWeight: 500, color: '#1e293b', margin: '0 0 5px 0' },
    subtitle: { fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 300 },
    addBtn: { padding: '8px 20px', backgroundColor: 'rgba(37, 99, 235, 0.05)', color: 'rgba(37, 99, 235, 0.6)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, backdropFilter: 'blur(8px)', transition: 'all 0.2s', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' },
    cardImage: { width: '100%', height: '140px', objectFit: 'cover' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '15px 15px 0 15px' },
    catName: { fontSize: '16px', fontWeight: 500, margin: 0, color: '#1e293b' },
    catDesc: { fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 300, padding: '0 15px 15px 15px' },
    actions: { display: 'flex', gap: '8px' },
    editBtn: { padding: '6px 14px', backgroundColor: 'rgba(71, 85, 105, 0.05)', color: 'rgba(71, 85, 105, 0.6)', border: '1px solid rgba(71, 85, 105, 0.1)', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em', backdropFilter: 'blur(4px)' },
    delBtn: { padding: '6px 14px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: 'rgba(239, 68, 68, 0.6)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '10px', cursor: 'pointer', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em', backdropFilter: 'blur(4px)' },
    empty: { textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8', padding: '40px', fontSize: '13px', fontWeight: 300 },
    paginationWrapper: { marginTop: '25px' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
    modalTitle: { margin: '0 0 8px 0', fontSize: '18px', fontWeight: 500, color: '#1e293b' },
    modalSubtitle: { fontSize: '12px', color: '#64748b', marginBottom: '24px', fontWeight: 300 },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '11px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', fontWeight: 300 },
    textarea: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', fontWeight: 300, resize: 'none' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn: { padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, color: '#64748b', fontSize: '12px' },
    saveBtn: { padding: '8px 20px', backgroundColor: 'rgba(37, 99, 235, 0.05)', color: 'rgba(37, 99, 235, 0.6)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '10px', cursor: 'pointer', fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    previewContainer: { width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '10px' },
    previewImage: { width: '100%', height: '100%', objectFit: 'cover' }
};

export default CategoryManagement;
