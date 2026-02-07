import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, Search, Filter, Download, Eye, RefreshCw,
  Calendar, CreditCard, CheckCircle, XCircle, Clock,
  AlertCircle, TrendingUp, Users, ShoppingBag, FileText,
  ChevronDown, ChevronUp, X, Check, Copy
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

const TransactionManager = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      if (filterPaymentMethod !== 'all') {
        params.paymentMethod = filterPaymentMethod;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data.transactions);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(t('admin.transactions.error.load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/transactions/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filterStatus, filterPaymentMethod, searchTerm, dateRange]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleViewDetails = async (transaction) => {
    try {
      const response = await api.get(`/transactions/${transaction.id}`);
      setSelectedTransaction(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error(t('admin.transactions.error.details_failed'));
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm(t('admin.transactions.confirm.refund'))) {
      return;
    }

    try {
      const response = await api.post(`/transactions/${transactionId}/refund`);
      if (response.data.success) {
        toast.success(t('admin.transactions.success.refunded'));
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error refunding transaction:', error);
      toast.error(error.response?.data?.message || t('admin.transactions.error.refund_failed'));
    }
  };

  const handleApproveOfflinePayment = async (transactionId) => {
    if (!window.confirm(t('admin.transactions.confirm.approve'))) {
      return;
    }

    try {
      const response = await api.post(`/transactions/${transactionId}/approve`);
      if (response.data.success) {
        toast.success(t('admin.transactions.success.approved'));
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error.response?.data?.message || t('admin.transactions.error.approve_failed'));
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        paymentMethod: filterPaymentMethod !== 'all' ? filterPaymentMethod : undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      const response = await api.get('/transactions/export', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('admin.transactions.success.exported'));
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error(t('admin.transactions.error.export_failed'));
    }
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    toast.success(t('admin.transactions.success.copied'));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      COMPLETED: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        icon: CheckCircle,
        label: t('admin.transactions.status.completed'),
      },
      PENDING: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: Clock,
        label: t('admin.transactions.status.pending'),
      },
      FAILED: {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        icon: XCircle,
        label: t('admin.transactions.status.failed'),
      },
      REFUNDED: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: RefreshCw,
        label: t('admin.transactions.status.refunded'),
      },
    };

    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPaymentMethod('all');
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t('admin.transactions.title')}</h1>
              <p className="text-slate-600 mt-1">{t('admin.transactions.subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('admin.transactions.refresh')}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('admin.transactions.export_csv')}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('admin.transactions.stats.total_revenue')}</span>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('admin.transactions.stats.total_transactions')}</span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.totalTransactions}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('admin.transactions.stats.completed')}</span>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.completedTransactions}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('admin.transactions.stats.pending')}</span>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {stats.pendingTransactions}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{t('admin.transactions.stats.failed')}</span>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-600">
                {stats.failedTransactions}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('common.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('admin.transactions.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('admin.transactions.filters.status')}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">{t('admin.transactions.filters.all_status')}</option>
                  <option value="COMPLETED">{t('admin.transactions.status.completed')}</option>
                  <option value="PENDING">{t('admin.transactions.status.pending')}</option>
                  <option value="FAILED">{t('admin.transactions.status.failed')}</option>
                  <option value="REFUNDED">{t('admin.transactions.status.refunded')}</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('admin.transactions.filters.payment_method')}
                </label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">{t('admin.transactions.filters.all_methods')}</option>
                  <option value="card">{t('admin.transactions.payment_method.card')}</option>
                  <option value="offline">{t('admin.transactions.payment_method.offline')}</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('admin.transactions.filters.date_range')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            {(searchTerm || filterStatus !== 'all' || filterPaymentMethod !== 'all' || dateRange.startDate || dateRange.endDate) && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('admin.transactions.filters.clear_all')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-slate-500">{t('admin.transactions.loading')}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('admin.transactions.empty.title')}</h3>
              <p className="text-slate-500">{t('admin.transactions.empty.subtitle')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.reference')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.user')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.course')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.amount')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.payment_method')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.status')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.date')}</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">{t('admin.transactions.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <>
                        <tr
                          key={transaction.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-slate-900">
                                {transaction.transactionReference.substring(0, 16)}...
                              </span>
                              <button
                                onClick={() => handleCopyReference(transaction.transactionReference)}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                title={t('admin.transactions.actions.copy_reference')}
                              >
                                <Copy className="w-3 h-3 text-slate-400" />
                              </button>
                              <button
                                onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                {expandedRow === transaction.id ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                {transaction.user?.firstName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {transaction.user?.firstName} {transaction.user?.lastName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {transaction.user?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              <div className="font-medium text-slate-900 truncate">
                                {transaction.course?.title}
                              </div>
                              <div className="text-xs text-slate-500">
                                {t('admin.courses.card.by')} {transaction.course?.instructor?.firstName} {transaction.course?.instructor?.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-600">
                              {transaction.paymentMethod === 'card' ? t('admin.transactions.payment_method.card') : t('admin.transactions.payment_method.offline')}
                            </span>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-slate-600">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(transaction)}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title={t('admin.transactions.actions.view_details')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {transaction.status === 'PENDING' && transaction.paymentMethod === 'offline' && (
                                <button
                                  onClick={() => handleApproveOfflinePayment(transaction.id)}
                                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title={t('admin.transactions.actions.approve_payment')}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {transaction.status === 'COMPLETED' && (
                                <button
                                  onClick={() => handleRefund(transaction.id)}
                                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title={t('admin.transactions.actions.refund')}
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRow === transaction.id && (
                          <tr key={`${transaction.id}-details`}>
                            <td colSpan="8" className="p-4 bg-slate-50">
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-slate-500">Transaction ID:</span>
                                  <span className="ml-2 font-mono text-slate-900">{transaction.id}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Coupon Used:</span>
                                  <span className="ml-2 text-slate-900">{transaction.couponCode || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Original Amount:</span>
                                  <span className="ml-2 text-slate-900">{formatCurrency(transaction.originalAmount || transaction.amount)}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500">Discount:</span>
                                  <span className="ml-2 text-slate-900">{transaction.discountAmount ? formatCurrency(transaction.discountAmount) : '-'}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-6 bg-slate-50/50 border-t border-slate-100">
                  <div className="text-sm font-medium text-slate-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('common.previous')}
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setShowDetailsModal(false)}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
};

// Transaction Details Modal Component
const TransactionDetailsModal = ({ transaction, onClose, formatCurrency, getStatusBadge }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{t('admin.transactions.actions.view_details')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            <div>
              {getStatusBadge(transaction.status)}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(transaction.amount)}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-sm text-slate-500">{t('admin.transactions.table.reference')}</span>
              <p className="font-mono text-slate-900 break-all">{transaction.transactionReference}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-sm text-slate-500">{t('admin.transactions.table.payment_method')}</span>
              <p className="text-slate-900">{transaction.paymentMethod === 'card' ? t('admin.transactions.payment_method.card') : t('admin.transactions.payment_method.offline')}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-sm text-slate-500">{t('admin.transactions.table.date')}</span>
              <p className="text-slate-900">{new Date(transaction.createdAt).toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <span className="text-sm text-slate-500">Coupon</span>
              <p className="text-slate-900">{transaction.couponCode || '-'}</p>
            </div>
          </div>

          {/* User Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('admin.transactions.table.user')}</h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-medium text-slate-900">{transaction.user?.firstName} {transaction.user?.lastName}</p>
              <p className="text-sm text-slate-500">{transaction.user?.email}</p>
            </div>
          </div>

          {/* Course Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('admin.transactions.table.course')}</h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="font-medium text-slate-900">{transaction.course?.title}</p>
              <p className="text-sm text-slate-500">
                {t('admin.courses.card.by')} {transaction.course?.instructor?.firstName} {transaction.course?.instructor?.lastName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionManager;
