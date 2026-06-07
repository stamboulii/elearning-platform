import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import categoryService from '../../services/categoryService';
import { Upload, X } from 'lucide-react';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from '../../utils/toast';

const AdminCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ------------------------------------------------
  // Fetch categories (safe, one-time)
  // ------------------------------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getAllCategories();
        setCategories(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const refreshCategories = async () => {
    const response = await categoryService.getAllCategories();
    setCategories(Array.isArray(response) ? response : []);
  };

  // ------------------------------------------------
  // Actions
  // ------------------------------------------------
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setActionLoading(true);
      await categoryService.deleteCategory(categoryToDelete);
      toast.success(t('admin.categories.success.deleted'));
      refreshCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || t('admin.categories.error.delete_failed'));
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // ------------------------------------------------
  // Organize categories into tree
  // ------------------------------------------------
  const organizedCategories = useMemo(() => {
    const map = {};
    const roots = [];

    categories.forEach((cat) => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach((cat) => {
      if (cat.parentCategoryId && map[cat.parentCategoryId]) {
        map[cat.parentCategoryId].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    return roots;
  }, [categories]);

  // ------------------------------------------------
  // Loading
  // ------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {t('admin.categories.title')}
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              {t('admin.categories.subtitle')}
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition font-medium"
          >
            {t('admin.categories.add_category')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title={t('admin.categories.stats.total_categories')}
            value={categories.length}
            icon="📁"
            color="bg-blue-500"
          />
          <StatCard
            title={t('admin.categories.stats.parent_categories')}
            value={categories.filter(c => !c.parentCategoryId).length}
            icon="📂"
            color="bg-green-500"
          />
          <StatCard
            title={t('admin.categories.stats.subcategories')}
            value={categories.filter(c => c.parentCategoryId).length}
            icon="📄"
            color="bg-purple-500"
          />
        </div>

        {/* Table */}
        {categories.length === 0 ? (
          <EmptyState onCreate={handleAddCategory} />
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors duration-300">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-600">
                <tr>
                  <TableHead>{t('admin.categories.table.category')}</TableHead>
                  <TableHead>{t('admin.categories.table.slug')}</TableHead>
                  <TableHead>{t('admin.categories.table.courses')}</TableHead>
                  <TableHead>{t('admin.categories.table.order')}</TableHead>
                  <TableHead align="right">{t('admin.categories.table.actions')}</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {organizedCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <CategoryModal
            category={editingCategory}
            categories={categories}
            onClose={() => {
              setShowModal(false);
              setEditingCategory(null);
            }}
            onSuccess={() => {
              refreshCategories();
              setShowModal(false);
              setEditingCategory(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteCategoryModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDeleteCategory}
          isLoading={actionLoading}
        />
      </div>
  </div>
  );
};

const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('admin.categories.modal.delete_title')}
      message={t('admin.categories.confirm.delete')}
      confirmText={t('common.delete')}
      cancelText={t('common.cancel')}
      type="danger"
      isLoading={isLoading}
    />
  );
};

export default AdminCategories;
