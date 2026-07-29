import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Undo2, ArrowUpDown, Filter } from 'lucide-react';
import { bookIssueApi } from '../../api/api';
import Pagination from '../Pagination';
import { toast } from 'react-toastify';

const AdminBorrowingsList = ({
  fetchBorrowings,
  title = 'Borrowings',
  showSearch = true,
  emptyMessage = 'No records found.',
  defaultSortBy = 'issuedDate',
  defaultIsDescending = true,
  defaultPageSize = 10,
  showActions = false,
}) => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Search, sort, order
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [isDescending, setIsDescending] = useState(defaultIsDescending);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search, sort, or order changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearch, sortBy, isDescending]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        searchTerm: debouncedSearch.trim(),
        sortBy,
        isDescending,
        pageNumber,
        pageSize: defaultPageSize,
      };

      const response = await fetchBorrowings(params);
      const list = Array.isArray(response) ? response : [];
      setData(list);

      const count = Number(list[0]?.totalCount ?? list.length);
      setTotalCount(Number.isNaN(count) ? list.length : count);
    } catch (err) {
      console.error('Failed to fetch borrowings:', err);
      setData([]);
      setTotalCount(0);
      setError('Failed to load borrowings.');
    } finally {
      setLoading(false);
    }
  }, [fetchBorrowings, debouncedSearch, sortBy, isDescending, pageNumber, defaultPageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived
  const hasReturnDate = data.some((item) => item.returnedDate != null);
  const totalPages = Math.max(1, Math.ceil(totalCount / defaultPageSize));
  const currentPage = pageNumber + 1;

  // Date formatting
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

  // Check if a returned book was late
  const isReturnedLate = (item) => {
    if (!item.returnedDate || !item.dueDate) return false;
    if (item.returnedDate.startsWith('0001') || item.dueDate.startsWith('0001')) return false;
    const returnedDate = new Date(item.returnedDate);
    const dueDate = new Date(item.dueDate);
    if (Number.isNaN(returnedDate.getTime()) || Number.isNaN(dueDate.getTime())) return false;
    return returnedDate > dueDate;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const lower = status?.toLowerCase();
    switch (lower) {
      case 'active':
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handlers
  const handlePageChange = (newPage) => {
    setPageNumber(newPage - 1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleOrder = () => {
    setIsDescending(!isDescending);
  };

  const handleClear = () => {
    setSearchInput('');
    setSortBy(defaultSortBy);
    setIsDescending(defaultIsDescending);
  };

  const handleReturnBook = async (bookIssueId) => {
    try {
      await bookIssueApi.returnBook(bookIssueId);
      toast.success('Book returned successfully.');
      fetchData();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error?.message || 'Failed to return the book.');
    }
  };

  return (
    <div>
      {/* Header + Search + Sort/Order */}
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title, author, or user name..."
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
              <option value="requestdate">Request Date</option>
              <option value="issueddate">Issued Date</option>
              <option value="duedate">Due Date</option>
              <option value="status">Status</option>
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
              onClick={() => {
                setSearchTerm('');
                setSortBy('requestDate');
                setIsDescending(true);
              }}
            >
              <Filter className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>


      {/* Loading / Error / Empty */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-red-500">{error}</div>
      ) : data.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">ISBN</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Issued Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  {hasReturnDate && <th className="px-4 py-3 font-medium">Return Date</th>}
                  <th className="px-4 py-3 font-medium">Status</th>
                  {showActions && <th className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => {
                  const returnedLate = isReturnedLate(item);
                  return (
                    <tr key={item.bookIssueId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.book?.title || 'Unknown Book'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.book?.isbn || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.user?.fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(item.issuedDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(item.dueDate)}
                      </td>
                      {hasReturnDate && (
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(item.returnedDate)}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${returnedLate
                              ? 'bg-red-100 text-red-800'
                              : getStatusBadge(item.status)
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {showActions && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleReturnBook(item.bookIssueId)}
                            className="rounded-full p-2 text-blue-600 hover:bg-blue-100"
                            title="Return this book"
                          >
                            <Undo2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} (Total {totalCount} results)
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBorrowingsList;