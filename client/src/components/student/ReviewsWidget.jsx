import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import { Brain, ChevronRight, Clock, Loader } from 'lucide-react';

const ReviewsWidget = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getStats()
      .then(res => setStats(res.data?.data?.stats || null))
      .catch(err => console.error('Error loading review stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center justify-center h-32">
        <Loader className="w-5 h-5 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Révisions</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complète des leçons pour activer les révisions espacées
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border p-6 ${
      stats.dueCount > 0
        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className={`w-5 h-5 ${stats.dueCount > 0 ? 'text-purple-600' : 'text-slate-400'}`} />
          <h3 className="font-bold text-slate-900 dark:text-white">Révisions</h3>
        </div>
        {stats.dueCount > 0 && (
          <button
            onClick={() => navigate('/student/reviews')}
            className="text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline flex items-center gap-1"
          >
            Commencer
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {stats.dueCount > 0 ? (
        <div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
            {stats.dueCount}
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            révision{stats.dueCount > 1 ? 's' : ''} à faire aujourd'hui
          </p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{stats.dueCount * 3} min estimées
          </p>
        </div>
      ) : (
        <div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
            ✓
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Toutes les révisions sont à jour
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {stats.totalCount} leçon{stats.totalCount > 1 ? 's' : ''} suivie{stats.totalCount > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsWidget;