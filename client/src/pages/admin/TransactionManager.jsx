import { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Filter, Download, Eye, RefreshCw, 
  Calendar, CreditCard, CheckCircle, XCircle, Clock, 
  AlertCircle, TrendingUp, Users, ShoppingBag, FileText,
  ChevronDown, ChevronUp, X, Check, Copy
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';

const TransactionManager = () => {
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
      toast.error('Failed to load transactions');
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
      toast.error('Failed to load transaction details');
    }
  };

  const handleRefund = async (transactionId) => {
    if (!window.confirm('Are you sure you want to refund this transaction?')) {
      return;
    }

    try {
      const response = await api.post(`/transactions/${transactionId}/refund`);
      if (response.data.success) {
        toast.success('Transaction refunded successfully');
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error refunding transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to refund transaction');
    }
  };

  const handleApproveOfflinePayment = async (transactionId) => {
    if (!window.confirm('Are you sure you want to approve this offline payment?')) {
      return;
    }

    try {
      const response = await api.post(`/transactions/${transactionId}/approve`);
      if (response.data.success) {
        toast.success('Payment approved successfully');
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve payment');
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

      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    toast.success('Transaction reference copied!');
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
        label: 'Completed',
      },
      PENDING: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: Clock,
        label: 'Pending',
      },
      FAILED: {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        icon: XCircle,
        label: 'Failed',
      },
      REFUNDED: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: RefreshCw,
        label: 'Refunded',
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
              <h1 className="text-3xl font-bold text-slate-900">Transaction Management</h1>
              <p className="text-slate-600 mt-1">Monitor and manage all payment transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Total Revenue</span>
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
                <span className="text-sm font-medium text-slate-600">Total Transactions</span>
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
                <span className="text-sm font-medium text-slate-600">Completed</span>
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
                <span className="text-sm font-medium text-slate-600">Pending</span>
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
                <span className="text-sm font-medium text-slate-600">Failed</span>
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
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by reference, user, course..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">All Methods</option>
                  <option value="card">Card</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date Range
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
                  Clear all filters
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
              <p className="mt-4 text-slate-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No transactions found</h3>
              <p className="text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Reference</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Course</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Payment Method</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
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
                                title="Copy reference"
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
                                by {transaction.course?.instructor?.firstName} {transaction.course?.instructor?.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                              <span className="text-sm capitalize">
                                {transaction.paymentMethod}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 capitalize">
                              via {transaction.paymentGateway}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-900">
                              {formatDate(transaction.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(transaction)}
                                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {transaction.status === 'PENDING' && transaction.paymentMethod === 'offline' && (
                                <button
                                  onClick={() => handleApproveOfflinePayment(transaction.id)}
                                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Approve Payment"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {transaction.status === 'COMPLETED' && (
                                <button
                                  onClick={() => handleRefund(transaction.id)}
                                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Refund"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row Details */}
                        {expandedRow === transaction.id && (
                          <tr className="bg-slate-50">
                            <td colSpan="8" className="p-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <div className="text-xs font-medium text-slate-500 mb-1">
                                    Full Reference
                                  </div>
                                  <div className="text-sm font-mono text-slate-900">
                                    {transaction.transactionReference}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-slate-500 mb-1">
                                    Created At
                                  </div>
                                  <div className="text-sm text-slate-900">
                                    {formatDate(transaction.createdAt)}
                                  </div>
                                </div>
                                {transaction.completedAt && (
                                  <div>
                                    <div className="text-xs font-medium text-slate-500 mb-1">
                                      Completed At
                                    </div>
                                    <div className="text-sm text-slate-900">
                                      {formatDate(transaction.completedAt)}
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-xs font-medium text-slate-500 mb-1">
                                    Transaction ID
                                  </div>
                                  <div className="text-sm font-mono text-slate-900">
                                    {transaction.id.substring(0, 8)}...
                                  </div>
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
                <div className="flex items-center justify-between p-4 border-t border-slate-100">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Transaction Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedTransaction.status)}
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </span>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Transaction Reference
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg flex-1">
                        {selectedTransaction.transactionReference}
                      </div>
                      <button
                        onClick={() => handleCopyReference(selectedTransaction.transactionReference)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Payment Method
                    </label>
                    <div className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg capitalize">
                      {selectedTransaction.paymentMethod} via {selectedTransaction.paymentGateway}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">
                      Created At
                    </label>
                    <div className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                      {formatDate(selectedTransaction.createdAt)}
                    </div>
                  </div>

                  {selectedTransaction.completedAt && (
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">
                        Completed At
                      </label>
                      <div className="text-sm text-slate-900 bg-slate-50 px-3 py-2 rounded-lg">
                        {formatDate(selectedTransaction.completedAt)}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">
                        Name
                      </label>
                      <div className="text-sm text-slate-900">
                        {selectedTransaction.user?.firstName} {selectedTransaction.user?.lastName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">
                        Email
                      </label>
                      <div className="text-sm text-slate-900">
                        {selectedTransaction.user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Course Information</h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex gap-4">
                      {selectedTransaction.course?.thumbnailImage && (
                        <img
                          src={selectedTransaction.course.thumbnailImage}
                          alt={selectedTransaction.course.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {selectedTransaction.course?.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          by {selectedTransaction.course?.instructor?.firstName} {selectedTransaction.course?.instructor?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Info */}
                {selectedTransaction.enrollment && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Enrollment Status</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">
                          Payment Status
                        </label>
                        <div className="text-sm">
                          {selectedTransaction.enrollment.isPaid ? (
                            <span className="text-emerald-600 font-semibold">Paid</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Unpaid</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">
                          Progress
                        </label>
                        <div className="text-sm text-slate-900">
                          {selectedTransaction.enrollment.progressPercentage}% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  {selectedTransaction.status === 'PENDING' && selectedTransaction.paymentMethod === 'offline' && (
                    <button
                      onClick={() => {
                        handleApproveOfflinePayment(selectedTransaction.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Approve Payment
                    </button>
                  )}
                  {selectedTransaction.status === 'COMPLETED' && (
                    <button
                      onClick={() => {
                        handleRefund(selectedTransaction.id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors"
                    >
                      Process Refund
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;