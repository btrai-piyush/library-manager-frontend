import { useEffect, useState, useCallback, useRef } from 'react';
import { fineApi } from '../../../api/Api';
import { Loader2, Search, Filter, CheckCircle, ArrowUpDown } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

export default function UnpaidFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Search, sorting & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [isDescending, setIsDescending] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mark as paid modal
  const [payTarget, setPayTarget] = useState(null);

  // Request cancellation
  const abortControllerRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when search, sort, or order changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearchTerm, sortBy, isDescending]);

  // Fetch fines from server
  const fetchFines = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setError(null);
    try {
      const body = {
        userId: 0,
        status: 'unpaid',
        searchTerm: debouncedSearchTerm,
        sortBy,
        isDescending,
        pageNumber: pageNumber + 1,
        pageSize: PAGE_SIZE,
      };
      const response = await fineApi.adminGetAllFines(body, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const items = Array.isArray(response) ? response : [];
      const total = items.length > 0 ? (items[0].totalCount ?? 0) : 0;

      setFines(items);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching fines:', err);
      setError('Failed to load fines. Please try again later.');
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, isDescending, pageNumber]);

  // Trigger fetch
  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePageChange = (newPage) => {
    setPageNumber(newPage - 1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  // Mark fine as paid
  const handlePayFine = async (fineId) => {
    try {
      await fineApi.payFine(fineId);
      setFines((prev) =>
        prev.map((f) =>
          f.id === fineId ? { ...f, status: 'Paid', paidDate: new Date().toISOString() } : f
        )
      );
      toast.success('Fine marked as paid.');
    } catch (err) {
      console.error('Error paying fine:', err);
      toast.error(err?.message || 'Failed to mark fine as paid.');
    }
  };

  // Status badge helper
  const getStatusBadgeClass = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Row helpers
  const startItem = totalCount === 0 ? 0 : pageNumber * PAGE_SIZE + 1;
  const endItem = Math.min((pageNumber + 1) * PAGE_SIZE, totalCount);

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading fines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Unpaid Fines
          </h1>
          <p className="mt-2 text-gray-600 max-w-4xl">
            View and manage unpaid fines. Mark fines as paid once settled.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount</option>
              <option value="user.fullName">User</option>
            </select>

            <button
              onClick={toggleOrder}
              className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={isDescending ? 'Descending' : 'Ascending'}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="text-sm text-gray-700">
                {isDescending ? 'Descending' : 'Ascending'}
              </span>
            </button>

            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setSortBy('dueDate');
                setIsDescending(true);
              }}
            >
              <Filter className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          <div className="px-6 py-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">All Unpaid Fines</h2>
              <p className="text-sm text-gray-500">
                {totalCount > 0
                  ? `Showing ${startItem}–${endItem} of ${totalCount} fines`
                  : 'No fines found'}
              </p>
            </div>
            <div className="hidden sm:block">
              <Pagination
                currentPage={pageNumber + 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>

          {fines.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? 'No fines match your search.' : 'No unpaid fines yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date (Late Days)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Paid Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-wrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fine.bookIssue?.book?.title ?? 'Unknown Book'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fine.bookIssue?.user?.fullName ?? 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {fine.bookIssue?.user?.email ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-wrap text-center text-sm text-gray-600">
                        {fine.bookIssue?.dueDate
                          ? new Date(fine.bookIssue.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                        <span className="ml-2 text-xs text-gray-400">
                          ({Math.max(0, Math.floor((new Date() - new Date(fine.bookIssue?.dueDate)) / (1000 * 60 * 60 * 24)))-1})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        रु{fine.amount?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(fine.status)}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap justify-center hidden lg:table-cell text-sm text-gray-600">
                        {fine.paidDate
                          ? new Date(fine.paidDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {fine.status === 'Unpaid' ? (
                          <button
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as paid"
                            onClick={() => setPayTarget(fine.id)}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t bg-gray-50/50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pageNumber + 1} of {totalPages}
              </div>
              <Pagination
                currentPage={pageNumber + 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Pay Fine Confirmation Modal */}
        {payTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
              <p className="text-gray-800 mb-4">
                Mark this fine as <span className="font-semibold text-green-700">paid</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPayTarget(null)}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handlePayFine(payTarget);
                    setPayTarget(null);
                  }}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}