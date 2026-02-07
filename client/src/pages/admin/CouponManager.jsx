import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, Filter, Edit, Trash2, Copy, Calendar,
  Tag, Percent, DollarSign, Eye, X, Check, BookOpen
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

const CouponManager = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    applicableCourses: [],
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filterActive !== 'all') {
        params.isActive = filterActive === 'active';
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/coupons', { params });
      setCoupons(response.data.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(t('admin.coupons.error.load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async (search = '') => {
    try {
      setIsCoursesLoading(true);
      const response = await api.get('/courses', {
        params: {
          search,
          limit: 20,
          status: 'PUBLISHED'
        }
      });
      setCourses(response.data.data.courses || response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(t('admin.coupons.error.load_courses_failed'));
    } finally {
      setIsCoursesLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [filterActive, searchTerm]);

  // Fetch courses when modal opens
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      fetchCourses();
    }
  }, [showCreateModal, showEditModal]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      // Filter out any empty values from applicableCourses
      const couponData = {
        ...formData,
        applicableCourses: formData.applicableCourses.filter(id => id)
      };

      const response = await api.post('/coupons', couponData);
      if (response.data.success) {
        toast.success(t('admin.coupons.success.created'));
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || t('admin.coupons.error.create_failed'));
    }
  };

  const handleEditCoupon = async (e) => {
    e.preventDefault();
    try {
      // Filter out any empty values from applicableCourses
      const couponData = {
        ...formData,
        applicableCourses: formData.applicableCourses.filter(id => id)
      };

      const response = await api.put(`/coupons/${selectedCoupon.id}`, couponData);
      if (response.data.success) {
        toast.success(t('admin.coupons.success.updated'));
        setShowEditModal(false);
        resetForm();
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.message || t('admin.coupons.error.update_failed'));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm(t('admin.coupons.confirm.delete'))) {
      return;
    }

    try {
      const response = await api.delete(`/coupons/${id}`);
      if (response.data.success) {
        toast.success(t('admin.coupons.success.deleted'));
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.message || t('admin.coupons.error.delete_failed'));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(t('admin.coupons.success.copied'));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      applicableCourses: [],
      isActive: true,
    });
    setCourseSearch('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    setFormData(prev => {
      const currentCourses = [...prev.applicableCourses];
      const index = currentCourses.indexOf(courseId);

      if (index > -1) {
        // Remove course
        currentCourses.splice(index, 1);
      } else {
        // Add course
        currentCourses.push(courseId);
      }

      return { ...prev, applicableCourses: currentCourses };
    });
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : `Course ${courseId}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t('admin.coupons.title')}</h1>
              <p className="text-slate-600 mt-1">{t('admin.coupons.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('admin.coupons.create_coupon')}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('admin.coupons.search_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterActive === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {t('admin.coupons.filters.all')}
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterActive === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {t('admin.coupons.filters.active')}
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${filterActive === 'inactive'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {t('admin.coupons.filters.inactive')}
              </button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-500">{t('admin.coupons.loading')}</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('admin.coupons.empty.title')}</h3>
              <p className="text-slate-500">{t('admin.coupons.empty.subtitle')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.code')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.discount')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.valid_period')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.applicable_to')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.usage')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.status')}</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.coupons.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
                            {coupon.code}
                          </div>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            title={t('admin.coupons.actions.copy_code')}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="font-semibold">
                            {coupon.discountType === 'PERCENTAGE'
                              ? `${coupon.discountValue}%`
                              : `€${coupon.discountValue}`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {coupon.applicableCourses && coupon.applicableCourses.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {coupon.applicableCourses.length} {coupon.applicableCourses.length !== 1 ? t('admin.coupons.table.courses') : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">{t('admin.coupons.table.all_courses')}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900">
                            {coupon.timesUsed} / {coupon.usageLimit || '∞'}
                          </div>
                          <div className="text-slate-500">{t('admin.coupons.table.times_used')}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {coupon.isActive ? t('admin.coupons.status.active') : t('admin.coupons.status.inactive')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setFormData({
                                code: coupon.code,
                                discountType: coupon.discountType,
                                discountValue: coupon.discountValue.toString(),
                                validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
                                validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
                                usageLimit: coupon.usageLimit?.toString() || '',
                                applicableCourses: coupon.applicableCourses || [],
                                isActive: coupon.isActive,
                              });
                              setShowEditModal(true);
                            }}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('admin.coupons.actions.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t('admin.coupons.actions.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <CouponFormModal
          formData={formData}
          setFormData={setFormData}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          courses={courses}
          isCoursesLoading={isCoursesLoading}
          handleCourseSelect={handleCourseSelect}
          getCourseName={getCourseName}
          onSubmit={handleCreateCoupon}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isEditing={false}
        />
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && selectedCoupon && (
        <CouponFormModal
          formData={formData}
          setFormData={setFormData}
          courseSearch={courseSearch}
          setCourseSearch={setCourseSearch}
          courses={courses}
          isCoursesLoading={isCoursesLoading}
          handleCourseSelect={handleCourseSelect}
          getCourseName={getCourseName}
          onSubmit={handleEditCoupon}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          isEditing={true}
        />
      )}
    </div>
  );
};

// Coupon Form Modal Component
const CouponFormModal = ({
  formData,
  setFormData,
  courseSearch,
  setCourseSearch,
  courses,
  isCoursesLoading,
  handleCourseSelect,
  getCourseName,
  onSubmit,
  onClose,
  isEditing
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {isEditing ? t('admin.coupons.modal.edit') : t('admin.coupons.modal.create_new')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.coupons.modal.coupon_code')} *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                    placeholder="SUMMER2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.coupons.modal.discount_type')} *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                  >
                    <option value="PERCENTAGE">{t('admin.coupons.modal.percentage')}</option>
                    <option value="FIXED">{t('admin.coupons.modal.fixed_amount')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.coupons.modal.discount_value')} *
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '25' : '50'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.coupons.modal.valid_from')} *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.coupons.modal.valid_until')} *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.coupons.modal.usage_limit')} {t('admin.coupons.modal.optional')}
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    min="0"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">{t('admin.coupons.modal.active')}</span>
                  </label>
                </div>
              </div>

              {/* Right Column - Course Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('admin.coupons.modal.applicable_courses')}
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder={t('admin.coupons.modal.search_courses')}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {isCoursesLoading ? (
                      <div className="p-4 text-center text-slate-500">
                        {t('admin.coupons.modal.loading_courses')}
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        {t('admin.coupons.modal.no_courses_found')}
                      </div>
                    ) : (
                      courses.map((course) => (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.applicableCourses.includes(course.id)}
                            onChange={() => handleCourseSelect(course.id)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.price}€</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected Courses Summary */}
                {formData.applicableCourses.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {t('admin.coupons.modal.selected_courses')}: {formData.applicableCourses.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, applicableCourses: [] })}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {t('admin.coupons.modal.clear_all')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                {t('admin.coupons.modal.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                {isEditing ? t('admin.coupons.modal.update') : t('admin.coupons.modal.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponManager;
