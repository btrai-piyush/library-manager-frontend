import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { fineApi } from '../../api/Api';
import { DollarSign } from 'lucide-react'; // optional icon

const PAGE_SIZE = 10;

export default function UserFinesList({
  status = "Unpaid",
  title = "Fines",
  showSearch = false,
  showPay = false,   
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchFines = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const body = {
        userId,
        status,
        searchTerm: debouncedSearch.trim(),
        pageNumber: page,
        pageSize: PAGE_SIZE,
      };

      const response = await fineApi.getFinesByUser(body);
      const finesData = Array.isArray(response) ? response : [];
      setFines(finesData);
      // totalCount and totalFineAmount are usually in the first element
      setTotalCount(finesData[0]?.totalCount || finesData.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch fines.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, status, debouncedSearch, page]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Compute total fine amount from API response (if present) or fallback to sum
  const totalFineAmount =
    fines[0]?.totalFineAmount ??
    fines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Placeholder for payment integration
  const handlePayAll = () => {
    // TODO: Integrate with external payment gateway
    alert(`Payment of $${totalFineAmount.toFixed(2)} is not yet integrated.`);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>

        {showSearch && (
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by book title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Total & Pay Button (only for active unpaid fines) */}
      {showPay && fines.length > 0 && !loading && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">Total outstanding</p>
              <p className="text-2xl font-bold text-blue-900">
                ${totalFineAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handlePayAll}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Pay All Fines
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading fines...</p>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : fines.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-gray-500">
          No fines found.
        </div>
      ) : (
        <>
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
                      ${fine.amount?.toFixed(2) || '0.00'}
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
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages} (Total {totalCount} fines)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}