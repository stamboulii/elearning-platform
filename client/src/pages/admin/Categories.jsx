import { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import categoryService from '../../services/categoryService';
import { Upload, X } from 'lucide-react';

const AdminCategories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
    if (!window.confirm(t('admin.categories.confirm.delete'))) return;

    try {
      await categoryService.deleteCategory(categoryId);
      alert(t('admin.categories.success.deleted'));
      refreshCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || t('admin.categories.error.delete_failed'));
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
      </div>
    </div>
  );
};

/* ============================================================
   UI Components
============================================================ */

const TableHead = ({ children, align }) => (
  <th
    className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'
      }`}
  >
    {children}
  </th>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex justify-between items-center transition-colors duration-300">
    <div>
      <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
      {icon}
    </div>
  </div>
);

const EmptyState = ({ onCreate }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center transition-colors duration-300">
      <div className="text-6xl mb-4">📁</div>
      <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">{t('admin.categories.empty.no_categories')}</h3>
      <p className="text-gray-600 dark:text-slate-400 mb-6">{t('admin.categories.empty.create_first')}</p>
      <button
        onClick={onCreate}
        className="bg-blue-600 dark:bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition"
      >
        {t('admin.categories.empty.create_category')}
      </button>
    </div>
  );
};

const CategoryRow = ({ category, level, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const indent = level * 32;

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: indent }}>
            {level > 0 && <span className="mr-2 text-gray-400">└─</span>}
            <CategoryIcon icon={category.icon} picture={category.picture} />
            <div>
              <div className="font-medium text-gray-800 dark:text-white">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-slate-400">
          {category.slug}
        </td>
        <td className="px-6 py-4 text-gray-800 dark:text-white">
          {category._count?.courses ?? 0}
        </td>
        <td className="px-6 py-4 text-gray-800 dark:text-white">
          {category.displayOrder}
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => onEdit(category)}
            className="text-blue-600 dark:text-indigo-400 mr-4 hover:underline"
          >
            {t('admin.categories.actions.edit')}
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            {t('admin.categories.actions.delete')}
          </button>
        </td>
      </tr>

      {category.children?.map(child => (
        <CategoryRow
          key={child.id}
          category={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
};

/* ============================================================
   Category Icon Component (Default SVG)
============================================================ */

const CategoryIcon = ({ icon, picture }) => {
  if (picture) {
    return (
      <img
        src={picture}
        alt="Category"
        className="w-10 h-10 rounded-lg object-cover mr-3"
      />
    );
  }

  // Default SVG Icon
  return (
    <svg
      className="w-10 h-10 rounded-lg mr-3 flex-shrink-0"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="12" fill="#EEF2FF" />
      <path d="M16 20H48C50.2091 20 52 21.7909 52 24V40C52 42.2091 50.2091 44 48 44H16C13.7909 44 12 42.2091 12 40V24C12 21.7909 13.7909 20 16 20Z" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 28H52" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="36" r="3" fill="#6366F1" />
      <circle cx="42" cy="36" r="3" fill="#6366F1" />
    </svg>
  );
};

/* ============================================================
   Modal
============================================================ */

const CategoryModal = ({ category, categories, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const isEditing = Boolean(category);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    picture: category?.picture || '',
    parentCategoryId: category?.parentCategoryId || null,
    displayOrder: category?.displayOrder || 0
  });

  const [picturePreview, setPicturePreview] = useState(category?.picture || null);
  const [loading, setLoading] = useState(false);

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke previous blob URL to prevent memory leaks
      if (picturePreview && picturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(picturePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setPicturePreview(previewUrl);
      setFormData({ ...formData, picture: file });
    }
  };

  const removePicture = () => {
    // Revoke blob URL
    if (picturePreview && picturePreview.startsWith('blob:')) {
      URL.revokeObjectURL(picturePreview);
    }
    setPicturePreview(null);
    setFormData({ ...formData, picture: null }); // use null, not empty string
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert(t('admin.categories.error.name_required'));
      return;
    }

    if (!formData.slug) {
      alert(t('admin.categories.error.slug_required'));
      return;
    }

    try {
      setLoading(true);

      isEditing
        ? await categoryService.updateCategory(category.id, formData)
        : await categoryService.createCategory(formData);

      alert(isEditing ? t('admin.categories.success.updated') : t('admin.categories.success.created'));
      onSuccess();
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || t(isEditing ? 'admin.categories.error.update_failed' : 'admin.categories.error.create_failed'));
    } finally {
      setLoading(false);
    }
  };

  const availableParents = categories.filter(c =>
    !isEditing || c.id !== category.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-2xl w-full transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {isEditing ? t('admin.categories.modal.edit_category') : t('admin.categories.modal.create_category')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('admin.categories.modal.name')} required value={formData.name}
              onChange={(v) => {
                const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                setFormData({ ...formData, name: v, slug: isEditing ? formData.slug : slug });
              }}
            />

            <Input label={t('admin.categories.modal.slug')} required value={formData.slug}
              onChange={(v) => setFormData({ ...formData, slug: v })}
            />
          </div>

          <Textarea
            label={t('admin.categories.modal.description')}
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />

          {/* Picture Upload */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-slate-300">
              {t('admin.categories.modal.picture')}
              <span className="text-gray-500 text-sm">( {t('admin.categories.modal.optional')} )</span>
            </label>

            {!picturePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-indigo-500 transition-colors"
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-slate-400 mb-2">
                  {t('admin.categories.modal.picture_upload')}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={picturePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={removePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.categories.modal.icon')}
              value={formData.icon}
              onChange={(v) => setFormData({ ...formData, icon: v })}
            />

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-slate-300">{t('admin.categories.modal.parent')}</label>
              <select
                className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 outline-none transition-colors"
                value={formData.parentCategoryId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parentCategoryId: e.target.value || null })
                }
              >
                <option value="">{t('admin.categories.modal.no_parent')}</option>
                {availableParents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition">
              {t('admin.categories.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 dark:bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? t('admin.categories.modal.saving') : t('admin.categories.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================
   Small Inputs
============================================================ */

const Input = ({ label, value, onChange, required }) => (
  <div>
    <label className="block mb-1 font-medium text-gray-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 outline-none transition-colors"
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium text-gray-700 dark:text-slate-300">{label}</label>
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-500 outline-none transition-colors"
    />
  </div>
);

export default AdminCategories;
