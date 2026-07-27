import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom'; // add this import
import { userApi } from '../../api/Api';
import { Loader2, Search, Filter, Eye } from 'lucide-react'; // add Eye
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
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

  // Reset page when search or course filter changes
  useEffect(() => {
    setPageNumber(0);
  }, [debouncedSearchTerm, courseFilter]);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    setError(null);
    try {
      const body = {
        searchTerm: debouncedSearchTerm,
        sortBy: 'createdAt',
        isDescending: true,
        pageNumber: pageNumber + 1,
        pageSize: PAGE_SIZE,
        ...(courseFilter && { courseCode: courseFilter }),
      };
      const response = await userApi.adminGetAllStudents(body, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const items = Array.isArray(response) ? response : [];
      const total = items.length > 0 ? (items[0].totalCount ?? 0) : 0;

      setStudents(items);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again later.');
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [debouncedSearchTerm, courseFilter, pageNumber]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const getStatusBadgeClass = (status) => {
    return status
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const startItem = totalCount === 0 ? 0 : pageNumber * PAGE_SIZE + 1;
  const endItem = Math.min((pageNumber + 1) * PAGE_SIZE, totalCount);

  const courseOptions = [
    { value: '', label: 'All Courses' },
    { value: 'BIT', label: 'BIT' },
    { value: 'BCA', label: 'BCA' },
    { value: 'BCS', label: 'BCS' },
    { value: 'BBA', label: 'BBA' },
  ];

  // ------- RENDER -------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading students...</span>
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
            Students
          </h1>
          <p className="mt-2 text-gray-600 max-w-4xl">
            View and manage all student accounts. Search by name, email, or course, and filter by course.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[140px]"
            >
              {courseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setCourseFilter('');
              }}
            >
              <Filter className="w-5 h-5" />
              Clear
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          {isFetching && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          <div className="px-6 py-4 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">All Students</h2>
              <p className="text-sm text-gray-500">
                {totalCount > 0
                  ? `Showing ${startItem}–${endItem} of ${totalCount} students`
                  : 'No students found'}
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

          {students.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {searchTerm || courseFilter
                ? 'No students match your filters.'
                : 'No students registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {/* View */}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="View student details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-600">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-600">{student.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.studentDetail?.courseName || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {student.studentDetail?.semester ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(student.status)}`}>
                          {student.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-600">
                          {student.createdAt
                            ? new Date(student.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </div>
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