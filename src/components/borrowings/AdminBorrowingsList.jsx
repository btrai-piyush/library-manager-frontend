import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2,Undo2 } from 'lucide-react';
import {bookIssueApi} from "../../api/api";
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
  const [pageNumber, setPageNumber] = useState(0); // 0-based
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when search changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearch]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        searchTerm: debouncedSearch.trim(),
        sortBy: defaultSortBy,
        isDescending: defaultIsDescending,
        pageNumber,
        pageSize: defaultPageSize,
      };

      const response = await fetchBorrowings(params);
      const list = Array.isArray(response) ? response : [];

      setData(list);

      // totalCount comes from first item (as per schema)
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
  }, [fetchBorrowings, debouncedSearch, defaultSortBy, defaultIsDescending, pageNumber, defaultPageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived values
  const hasReturnDate = data.some((item) => item.returnedDate != null);
  const totalPages = Math.max(1, Math.ceil(totalCount / defaultPageSize));
  const currentPage = pageNumber + 1; // 1-based for Pagination component

  // Date formatter
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

  // Status badge styling
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

  // Handle page change from Pagination (1-based)
  const handlePageChange = (newPage) => {
    setPageNumber(newPage - 1);
  };

  const handleReturnBook = async (item) => {
    try {
      await bookIssueApi.returnBook(item.bookIssueId);
        // Refresh the borrowings list after returning the book
        fetchData();
        toast.success('Book returned successfully.');
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error?.message || 'Failed to return the book.');
    }
    };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

        {showSearch && (
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by book title, ISBN, or user..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-4 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Loading */}
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
                  <th className="px-4 py-3 font-medium">User(s)</th>
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
                        {item.user.fullName}
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
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                            returnedLate
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
                                    onClick={() => handleReturnBook(item)}
                                    className="rounded-full p-2 text-blue-600 hover:bg-blue-100"
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