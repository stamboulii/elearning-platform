import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../../services/adminService';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(filters);
      setUsers(data.data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);



  const handleToggleStatus = async (userId) => {
    if (!confirm(t('admin.users.confirm.toggle_status'))) return;

    try {
      await adminService.toggleUserStatus(userId);
      fetchUsers();
      alert(t('admin.users.success.status_updated'));
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(t('admin.users.error.status_update_failed'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm(t('admin.users.confirm.delete'))) return;

    try {
      await adminService.deleteUser(userId);
      fetchUsers();
      alert(t('admin.users.success.deleted'));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('admin.users.error.delete_failed'));
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('admin.users.title')}</h1>
          <p className="text-gray-600 dark:text-slate-400">{t('admin.users.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder={t('admin.users.search_placeholder')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            >
              <option value="">{t('admin.users.filters.all_roles')}</option>
              <option value="STUDENT">{t('admin.users.filters.student')}</option>
              <option value="INSTRUCTOR">{t('admin.users.filters.instructor')}</option>
              <option value="ADMIN">{t('admin.users.filters.admin')}</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            >
              <option value="">{t('admin.users.filters.all_status')}</option>
              <option value="active">{t('admin.users.filters.active')}</option>
              <option value="inactive">{t('admin.users.filters.inactive')}</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', role: '', status: '', page: 1, limit: 20 })}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              {t('admin.users.filters.clear_filters')}
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-colors">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.joined')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.users.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.profilePicture || 'https://via.placeholder.com/40'}
                            alt={user.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          user.role === 'INSTRUCTOR' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                        >
                          {t('admin.users.actions.edit')}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 mr-3"
                        >
                          {user.isActive ? t('admin.users.actions.deactivate') : t('admin.users.actions.activate')}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          {t('admin.users.actions.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white transition"
                >
                  {t('common.previous')}
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setFilters({ ...filters, page: index + 1 })}
                    className={`px-4 py-2 border rounded-lg ${filters.page === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white'
                      } transition`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white transition"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              fetchUsers();
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await adminService.updateUser(user.id, formData);
      alert(t('admin.users.success.updated'));
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(t('admin.users.error.update_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 transition-colors">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('admin.users.modal.edit_user')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-2">{t('admin.users.modal.first_name')}</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-2">{t('admin.users.modal.last_name')}</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-slate-300 font-medium mb-2">{t('admin.users.modal.role')}</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
            >
              <option value="STUDENT">{t('admin.users.filters.student')}</option>
              <option value="INSTRUCTOR">{t('admin.users.filters.instructor')}</option>
              <option value="ADMIN">{t('admin.users.filters.admin')}</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-slate-300">{t('admin.users.modal.active')}</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-indigo-600 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {loading ? t('admin.users.modal.saving') : t('admin.users.modal.save_changes')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUsers;
