import { useEffect, useState, useCallback } from 'react';
import { bookIssueApi } from '../../../api/Api';
import { Loader2, Search, Filter, RotateCcw } from 'lucide-react';
import Pagination from '../../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 5;

export default function AdminActiveBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);       // initial load
  const [isFetching, setIsFetching] = useState(false); // page / search changes
  const [error, setError] = useState(null);

  // Search & pagination (server-side)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(0); // 0‑based
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Return modal
  const [returnTarget, setReturnTarget] = useState(null);

  // Debounce search term (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch borrowings from server
  const fetchBorrowings = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const body = {
        searchTerm: debouncedSearchTerm,
        sortBy: 'issuedDate',
        isDescending: false,
        pageNumber: pageNumber + 1,
        pageSize: PAGE_SIZE,
      };
      const response = await bookIssueApi.getAllIssuedBooks(body);

      const items = Array.isArray(response) ? response : [];
      // Extract totalCount from first item (if present), otherwise fallback to array length
      const total = items.length > 0 ? (items[0].totalCount ?? items.length) : 0;

      setBorrowings(items);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE) || 1); // at least 1 page for UX
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      setError('Failed to load borrowings. Please try again later.');
      // Keep previous data on error, but reset counts to avoid infinite spinner
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [debouncedSearchTerm, pageNumber]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  // Reset page when debounced search changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearchTerm]);

  // Handler: page change
  const handlePageChange = (newPage) => {
    setPageNumber(newPage - 1); // convert 1‑based to 0‑based
  };

  // Handler: return book
  const handleReturn = async (bookIssueId) => {
    try {
      await bookIssueApi.returnBook(bookIssueId);
      // Optimistic update
      setBorrowings((prev) =>
        prev.map((b) =>
          b.bookIssueId === bookIssueId ? { ...b, status: 'Returned' } : b
        )
      );
      toast.success('Book marked as returned.');
    } catch (err) {
      console.error('Error returning book:', err);
      toast.error(err?.message || 'Failed to return book. Please try again.');
    }
  };

  // Status badge helpers
  const getStatusBadgeClass = (item) => {
    const dueDate = item.dueDate ? new Date(item.dueDate) : null;
    const today = new Date();
    if (item.status === 'Returned') return 'bg-gray-100 text-gray-600';
    if (dueDate && dueDate < today) return 'bg-red-100 text-red-800'; // overdue
    return 'bg-green-100 text-green-800'; // active
  };

  const getStatusLabel = (item) => {
    if (item.status === 'Returned') return 'Returned';
    const dueDate = item.dueDate ? new Date(item.dueDate) : null;
    if (dueDate && dueDate < new Date()) return 'Overdue';
    return 'Active';
  };

  // Helper for the "Showing X–Y of Z" text
  const startItem = totalCount === 0 ? 0 : pageNumber * PAGE_SIZE + 1;
  const endItem = Math.min((pageNumber + 1) * PAGE_SIZE, totalCount);

  // ----- RENDER -----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading borrowings...</span>
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
            Borrowings
          </h1>
          <p className="mt-2 text-gray-600 max-w-4xl">
            Track all active and past borrowings. See who has which book and when it’s due.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book, author, user, email, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => setSearchTerm('')}
          >
            <Filter className="w-5 h-5" />
            Clear
          </button>
        </div>

        {/* Borrowings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Loading overlay for page changes */}
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          <div className="px-6 py-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Issued Books</h2>
              <p className="text-sm text-gray-500">
                {totalCount > 0
                  ? `Showing ${startItem}–${endItem} of ${totalCount} borrowings`
                  : 'No borrowings found'}
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

          {borrowings.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? 'No borrowings match your search.' : 'No borrowings yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Author(s)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Borrowed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {borrowings.map((item) => (
                    <tr key={item.bookIssueId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-wrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.book?.title ?? 'Unknown Book'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-wrap hidden md:table-cell">
                        <div className="text-sm text-gray-600">
                          {item.book?.authors
                            ?.map((a) => `${a.firstName} ${a.lastName}`)
                            .join(', ') || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.fullName ?? 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.user?.email ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {item.issuedDate
                            ? new Date(item.issuedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item)}`}>
                          {getStatusLabel(item)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {item.status !== 'Returned' ? (
                          <button
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Return book"
                            onClick={() => setReturnTarget(item.bookIssueId)}
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">Returned</span>
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

        {/* Return Confirmation Modal */}
        {returnTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
              <p className="text-gray-800 mb-4">
                Mark this book as <span className="font-semibold text-blue-700">returned</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReturnTarget(null)}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleReturn(returnTarget);
                    setReturnTarget(null);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}