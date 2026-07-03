import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Trash2, EyeOff, Eye, Search } from 'lucide-react';
import adminService from '../../services/adminService';
import Avatar from '../../components/common/Avatar';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllReviews({
        page,
        limit: 15,
        search: search || undefined,
        rating: ratingFilter || undefined,
        isApproved: statusFilter || undefined
      });
      setReviews(data.data.reviews);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(t('admin_reviews.error_load'));
    } finally {
      setLoading(false);
    }
  }, [page, search, ratingFilter, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (review) => {
    try {
      if (review.isApproved) {
        await adminService.disapproveReview(review.id);
        toast.success(t('admin_reviews.hidden_success'));
      } else {
        await adminService.approveReview(review.id);
        toast.success(t('admin_reviews.approved_success'));
      }
      fetchReviews();
    } catch (error) {
      console.error('Toggle approval error:', error);
      toast.error(error.response?.data?.message || t('admin_reviews.action_failed'));
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await adminService.deleteReview(reviewId);
      toast.success(t('admin_reviews.deleted_success'));
      setConfirmDelete(null);
      fetchReviews();
    } catch (error) {
      toast.error(t('admin_reviews.error_delete'));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('admin_reviews.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('admin_reviews.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('admin_reviews.search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">{t('admin_reviews.all_ratings')}</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} {t('admin_reviews.stars')}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
        >
          <option value="">{t('admin_reviews.all_statuses')}</option>
          <option value="true">{t('admin_reviews.approved')}</option>
          <option value="false">{t('admin_reviews.disapproved')}</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-slate-400">
          {t('admin_reviews.no_reviews')}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`flex gap-4 p-5 rounded-2xl border bg-white dark:bg-slate-900 ${
                review.isApproved
                  ? 'border-slate-100 dark:border-slate-800'
                  : 'border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-900/10'
              }`}
            >
              <Avatar
                src={review.user?.profilePicture}
                firstName={review.user?.firstName}
                lastName={review.user?.lastName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {review.user?.firstName} {review.user?.lastName}
                      <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-2">
                        {t('admin_reviews.on_course')} {review.course?.title}
                      </span>
                    </p>
                    <div className="flex text-amber-400 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!review.isApproved && (
                      <span className="text-[10px] uppercase font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
                        {t('admin_reviews.hidden')}
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleApproval(review)}
                      title={review.isApproved ? t('admin_reviews.disapprove_hint') : t('admin_reviews.approve_hint')}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      {review.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(review.id)}
                      title={t('admin_reviews.delete_hint')}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {review.reviewText && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {review.reviewText}
                  </p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg font-bold text-sm ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
              {t('admin_reviews.confirm_delete_title')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {t('admin_reviews.confirm_delete_text')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('admin_reviews.cancel')}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
              >
                {t('admin_reviews.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;