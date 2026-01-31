import { useEffect, useMemo, useState } from 'react';
import categoryService from '../../services/categoryService';
import adminService from '../../services/adminService';

const AdminCategories = () => {
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
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await adminService.deleteCategory(categoryId);
      alert('Category deleted successfully');
      refreshCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Category Management
            </h1>
            <p className="text-gray-600">
              Organize your course categories
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Add Category
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Categories"
            value={categories.length}
            icon="📁"
            color="bg-blue-500"
          />
          <StatCard
            title="Parent Categories"
            value={categories.filter(c => !c.parentCategoryId).length}
            icon="📂"
            color="bg-green-500"
          />
          <StatCard
            title="Subcategories"
            value={categories.filter(c => c.parentCategoryId).length}
            icon="📄"
            color="bg-purple-500"
          />
        </div>

        {/* Table */}
        {categories.length === 0 ? (
          <EmptyState onCreate={handleAddCategory} />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y">
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
    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
      align === 'right' ? 'text-right' : 'text-left'
    }`}
  >
    {children}
  </th>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center">
    <div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
      {icon}
    </div>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    <div className="text-6xl mb-4">📁</div>
    <h3 className="text-2xl font-semibold mb-2">No categories yet</h3>
    <p className="text-gray-600 mb-6">Create your first category</p>
    <button
      onClick={onCreate}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Create Category
    </button>
  </div>
);

const CategoryRow = ({ category, level, onEdit, onDelete }) => {
  const indent = level * 32;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center" style={{ paddingLeft: indent }}>
            {level > 0 && <span className="mr-2 text-gray-400">└─</span>}
            <span className="text-xl mr-3">{category.icon || '📁'}</span>
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-sm text-gray-600">
          {category.slug}
        </td>
        <td className="px-6 py-4">
          {category._count?.courses ?? 0}
        </td>
        <td className="px-6 py-4">
          {category.displayOrder}
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => onEdit(category)}
            className="text-blue-600 mr-4 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="text-red-600 hover:underline"
          >
            Delete
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
   Modal
============================================================ */

const CategoryModal = ({ category, categories, onClose, onSuccess }) => {
  const isEditing = Boolean(category);

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    parentCategoryId: category?.parentCategoryId || null,
    displayOrder: category?.displayOrder || 0
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      alert('Name and slug are required');
      return;
    }

    try {
      setLoading(true);
      isEditing
        ? await adminService.updateCategory(category.id, formData)
        : await adminService.createCategory(formData);

      onSuccess();
    } catch (error) {
      console.error('Save failed:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const availableParents = categories.filter(c =>
    !isEditing || c.id !== category.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Category' : 'Create Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" required value={formData.name}
            onChange={(v) => {
              const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              setFormData({ ...formData, name: v, slug: isEditing ? formData.slug : slug });
            }}
          />

          <Input label="Slug" required value={formData.slug}
            onChange={(v) => setFormData({ ...formData, slug: v })}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
          />

          <Input
            label="Icon"
            value={formData.icon}
            onChange={(v) => setFormData({ ...formData, icon: v })}
          />

          <select
            className="w-full border px-4 py-2 rounded-lg"
            value={formData.parentCategoryId || ''}
            onChange={(e) =>
              setFormData({ ...formData, parentCategoryId: e.target.value || null })
            }
          >
            <option value="">No Parent</option>
            {availableParents.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
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
    <label className="block mb-1 font-medium">{label}</label>
    <input
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-4 py-2 rounded-lg"
    />
  </div>
);

const Textarea = ({ label, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border px-4 py-2 rounded-lg"
    />
  </div>
);

export default AdminCategories;
