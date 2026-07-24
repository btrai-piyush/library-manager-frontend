import { useEffect, useState, useCallback } from 'react';
import { bookRequestApi, bookIssueApi } from '../../api/Api';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;

export default function BorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & pagination (server-side)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(0);   // 0‑based
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [approveModal, setApproveModal] = useState(null); // { requestId, dueDate }
  const [rejectTarget, setRejectTarget] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch requests from server
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = {
        searchTerm: debouncedSearchTerm,
        sortBy: 'requestDate',    // adjust if needed
        isDescending: true,       // newest first
        pageNumber: pageNumber + 1,
        pageSize: PAGE_SIZE,
      };
      const response = await bookRequestApi.getAll(body);

      const items = Array.isArray(response) ? response : [];
      const total = items.length > 0 ? (items[0].totalCount ?? 0) : 0;

      setRequests(items);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE));
    } catch (err) {
      console.error('Error fetching borrow requests:', err);
      setError('Failed to load requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, pageNumber]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset page when search changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearchTerm]);

  // Page change handler (convert 1‑based -> 0‑based)
  const handlePageChange = (newPage) => {
    setPageNumber(newPage - 1);
  };

  // Approve
  const handleApprove = async (requestId, dueDate) => {
    try {
      await bookIssueApi.issueBook({ requestId, dueDate });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
      );
      toast.success('Request approved successfully.');
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error(err?.message || 'Failed to approve request. Please try again.');
    }
  };

  // Reject
  const handleReject = async (requestId) => {
    try {
      await bookRequestApi.rejectRequest(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
      );
      toast.success('Request rejected.');
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast.error('Could not reject request. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // ----- RENDER -----
  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading requests...</span>
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
            Borrow Requests
          </h1>
          <p className="mt-2 text-gray-600 max-w-4xl">
            Manage all book requests from users. Approve or reject pending requests here.
          </p>
        </div>

        {/* Search Bar */}
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
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => setSearchTerm('')}
          >
            <Filter className="w-5 h-5" />
            Clear
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">All Requests</h2>
              <p className="text-sm text-gray-500">
                Showing {(pageNumber * PAGE_SIZE) + 1}–
                {Math.min((pageNumber + 1) * PAGE_SIZE, totalCount)} of{' '}
                {totalCount} requests
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

          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm ? 'No requests match your search.' : 'No borrow requests yet.'}
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
                      Requested By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-wrap">
                        <div className="text-sm font-medium text-gray-900">
                          {req.book?.title ?? 'Unknown Book'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-wrap hidden md:table-cell">
                        <div className="text-sm text-gray-600">
                          {req.book?.authors
                            ?.map((a) => `${a.firstName} ${a.lastName}`)
                            .join(', ') || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {req.user?.fullName ?? 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.user?.email ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {req.requestDate
                            ? new Date(req.requestDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell text-center">
                        <div className="text-sm text-gray-600">
                          {req.book?.availableCopies ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${
                              req.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : req.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {req.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="View details"
                              onClick={() => console.log('View request', req.id)}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Approve request"
                              onClick={() => setApproveModal({ requestId: req.id, dueDate: '' })}
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Reject request"
                              onClick={() => setRejectTarget(req.id)}
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {req.status === 'Approved' ? 'Approved' : 'Rejected'}
                          </span>
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

        {/* Approve Modal with Due Date (unchanged) */}
        {approveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Set Due Date
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the date by which the book must be returned.
              </p>
              <div className="mb-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="dueDate"
                    type="date"
                    min={today}
                    value={approveModal.dueDate}
                    onChange={(e) =>
                      setApproveModal({ ...approveModal, dueDate: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {approveModal.dueDate && approveModal.dueDate < today && (
                  <p className="text-red-500 text-xs mt-1">Due date cannot be in the past.</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setApproveModal(null)}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!approveModal.dueDate || approveModal.dueDate < today) {
                      toast.error('Please select a valid future date.');
                      return;
                    }
                    await handleApprove(approveModal.requestId, approveModal.dueDate);
                    setApproveModal(null);
                  }}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={!approveModal.dueDate || approveModal.dueDate < today}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal (unchanged) */}
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full">
              <p className="text-gray-800 mb-4">
                Are you sure you want to <span className="font-semibold text-red-700">reject</span> this request?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleReject(rejectTarget);
                    setRejectTarget(null);
                  }}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}