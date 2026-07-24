import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { bookIssueApi } from '../../api/Api';
import { Search, Loader2 } from 'lucide-react';
import Pagination from '../Pagination';


const PAGE_SIZE = 20;

export default function UserBorrowingsList({
  statuses,
  title = 'Borrowings',
  showSearch = true,
  emptyMessage = 'No records found.',
}) {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hasReturnDate, setHasReturnDate] = useState(false);

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when debounced search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const body = {
        userId,
        status: statuses.join(','), // "active,overdue" or "returned"
        searchTerm: debouncedSearch.trim(),
        pageNumber: page,
        pageSize: PAGE_SIZE,
      };
      const response = await bookIssueApi.getBorrowedBooksByUser(body);
      const list = Array.isArray(response) ? response : [];
      setData(list);
      setTotalCount(list[0]?.totalCount || list.length);
      console.log('Fetched borrowings:', list[0]);
      if (list[0].returnedDate != null) {
        setHasReturnDate(true);
      }
    } catch (err) {
      setError('Failed to load borrowings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, statuses, debouncedSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const lower = status?.toLowerCase();
    if (lower === 'active') return 'bg-green-100 text-green-800';
    if (lower === 'overdue') return 'bg-red-100 text-red-800';
    if (lower === 'returned') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {showSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by book title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
          <div className="overflow-x-auto rounded border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">Author(s)</th>
                  <th className="px-4 py-3 font-medium">Issued Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  {hasReturnDate && (
                    <th className="px-4 py-3 font-medium">Return Date</th>
                  )}
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => (
                  <tr key={item.bookIssueId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.book?.title || 'Unknown Book'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.book?.authors
                        ?.map((a) => `${a.firstName} ${a.lastName}`)
                        .join(', ') || '—'}
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
                        {(new Date(item.returnedDate) > new Date(item.dueDate)) && (
                          ' (Late)'
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {item.status === 'Returned' && (new Date(item.returnedDate) > new Date(item.dueDate))
                        ?
                        (
                          <span className="inline-block rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800"> Returned</span>
                        )
                        :
                        (
                          <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        )
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} (Total {totalCount} results)
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}