import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { fineApi } from '../../api/Api';
import { Search, Loader2, ArrowUpDown, Filter } from 'lucide-react';
import Pagination from '../Pagination';

const PAGE_SIZE = 10;

export default function UserFinesList({
  status = 'Unpaid',
  title = 'Fines',
  showSearch = true,
  showPay = false,
  emptyMessage = 'No fines found.',
}) {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sort & order state
  const [sortBy, setSortBy] = useState('dueDate');
  const [isDescending, setIsDescending] = useState(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when search, sort, or order changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, isDescending]);

  // Fetch fines
  const fetchFines = useCallback(async () => {
    if (!userId) {
      setFines([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        userId,
        status,
        searchTerm: debouncedSearch.trim(),
        sortBy,
        isDescending,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      };

      const response = await fineApi.getFinesByUser(body);
      const list = Array.isArray(response) ? response : [];
      setFines(list);
      const count = Number(list[0]?.totalCount ?? list.length);
      setTotalCount(Number.isNaN(count) ? list.length : count);
    } catch (err) {
      console.error('Failed to fetch fines:', err);
      setFines([]);
      setTotalCount(0);
      setError('Failed to load fines.');
    } finally {
      setLoading(false);
    }
  }, [userId, status, debouncedSearch, sortBy, isDescending, page]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Handlers
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  const handleClear = () => {
    setSearchInput('');
    setSortBy('dueDate');
    setIsDescending(true);
  };

  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return '—';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Compute total fine amount (from API or fallback)
  const totalFineAmount =
    fines[0]?.totalFineAmount ??
    fines.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Placeholder for payment
  const handlePayAll = () => {
    alert(`Payment of रु${totalFineAmount.toFixed(2)} is not yet integrated.`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>

      {/* Search & Sort Bar */}
      {showSearch && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              {status === 'Paid' && <option value="paiddate">Paid Date</option>}
              <option value="title">Book Title</option>
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
              onClick={handleClear}
            >
              <Filter className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Loading / Error / Empty */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
      ) : fines.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {fine.bookIssue?.book?.title || 'Unknown Book'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(fine.bookIssue?.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      रु{fine.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          fine.status === 'Unpaid'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fine.paidDate ? formatDate(fine.paidDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} (Total {totalCount} fines)
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Total & Pay Button (only for active unpaid fines) */}
      {showPay && fines.length > 0 && !loading && (
        <div className="mt-4 w-max flex items-center justify-end rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <p className="text-blue-800 text-2xl">रु</p>
            <div>
              <p className="text-sm text-blue-800">Total outstanding</p>
              <p className="text-2xl font-bold text-blue-900">
                {totalFineAmount.toFixed(2)}
              </p>
            </div>
          </div>
          {/* <button
            onClick={handlePayAll}
            className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Pay All Fines
          </button> */}
        </div>
      )}
    </div>
  );
}