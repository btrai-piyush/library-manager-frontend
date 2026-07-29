import { useEffect, useState, useCallback, useRef } from 'react';
import { fineApi } from '../../../api/Api';
import { Loader2, Search, Filter, ArrowUpDown } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

export default function AdminFinesHistory() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Search, sorting, pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('paidDate');
  const [isDescending, setIsDescending] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when search or sort changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearchTerm, sortBy, isDescending]);

  // Fetch fines
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
        status: 'paid',
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

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

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

  const getStatusBadgeClass = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const startItem = totalCount === 0 ? 0 : pageNumber * PAGE_SIZE + 1;
  const endItem = Math.min((pageNumber + 1) * PAGE_SIZE, totalCount);

  // ------- RENDER -------
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
            Fines History
          </h1>
          <p className="mt-2 text-gray-600 max-w-4xl">
            View all fines that have been paid. You can search, sort, and filter through the history.
          </p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title, user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="paiddate">Paid Date</option>
              <option value="amount">Amount</option>
              <option value="duedate">Due Date</option>
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
                setSortBy('paidDate');
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
              <h2 className="text-lg font-semibold text-gray-800">All Paid Fines</h2>
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
              {searchTerm ? 'No fines match your search.' : 'No paid fines yet.'}
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
                      Due Date
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
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {fine.bookIssue?.dueDate
                          ? new Date(fine.bookIssue.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        रु{fine.amount?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(fine.status)}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell text-sm text-gray-600">
                        {fine.paidDate
                          ? new Date(fine.paidDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
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
      </div>
    </div>
  );
}