import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { bookRequestApi } from '../../../api/Api';
import { Search, Loader2, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import Pagination from '../../../components/Pagination';

const PAGE_SIZE = 20;

export default function RequestHistory() {
    const { user } = useSelector((state) => state.auth);
    const userId = user?.id;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Reset page on new search
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const fetchRequests = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const body = {
                searchId: userId,               // your API expects a 'searchId' likely userId
                searchTerm: debouncedSearch.trim(),
                sortBy: 'requestDate',           // default sort; adjust as needed
                isDescending: true,
                pageNumber: page,
                pageSize: PAGE_SIZE,
            };

            const response = await bookRequestApi.getRequestHistory(body);
            const data = Array.isArray(response) ? response : [];
            setRequests(data);
            setTotalCount(data[0]?.totalCount || data.length);
        } catch (err) {
            setError(err.message || 'Failed to fetch request history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId, debouncedSearch, page]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.startsWith('0001')) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        <Ban className="w-3.5 h-3.5" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600 text-lg">Loading request history...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Request History</h1>
                    <p className="text-gray-600 text-sm mt-1">Track the status of your book requests.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by book title..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
                    No request history found.
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Book</th>
                                    <th className="px-4 py-3 font-medium">Author(s)</th>
                                    <th className="px-4 py-3 font-medium">Request Date</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {req.book?.title || 'Unknown Book'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {req.book?.authors?.map(a => `${a.firstName} ${a.lastName}`).join(', ') || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {formatDate(req.requestDate)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(req.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
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