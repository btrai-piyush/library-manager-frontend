import { useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom'; // if using React Router
import { userApi } from '../../../api/Api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const UserView = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [bookIssues, setBookIssues] = useState([]);
  const [fines, setFines] = useState([]);

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await userApi.adminStudentView(userId);
        setUserData(response.user);
        setBookIssues(response.bookIssues || []);
        setFines(response.fines || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user details.');
        toast.error('Could not load user information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Format date helper
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

  // Status badge helper
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

  const getFineStatusBadge = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading user details...</span>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600">{error || 'User not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Student Details
            </h1>
            <p className="mt-1 text-gray-600">
              View complete profile and history for {userData.firstName} {userData.lastName}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-medium text-gray-900">
                {userData.firstName} {userData.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-900">{userData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-lg font-medium text-gray-900">{userData.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${userData.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {userData.status ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="text-lg font-medium text-gray-900">
                {userData.studentDetail?.courseName || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester</p>
              <p className="text-lg font-medium text-gray-900">
                {userData.studentDetail?.semester ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registered On</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(userData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Book Issues Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Latest Borrowing History 
          </h2>
          {bookIssues.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No borrowing records found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ISBN
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issued
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Returned
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookIssues.map((issue) => (
                      <tr key={issue.bookIssueId} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-wrap">
                          <div className="text-sm font-medium text-gray-900">
                            {issue.book?.title || 'Unknown Book'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-600">{issue.book?.isbn || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {formatDate(issue.issuedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                          {formatDate(issue.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 hidden md:table-cell">
                          {formatDate(issue.returnedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${(issue.status.toLowerCase() === 'returned' && new Date(issue.dueDate) < new Date(issue.returnedDate)) ? 'bg-red-100 text-red-800' : getStatusBadge(issue.status)}`}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Fines Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Latest Fines History
          </h2>
          {fines.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              No fines recorded.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Paid Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fines.map((fine) => (
                      <tr key={fine.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-wrap">
                          <div className="text-sm font-medium text-gray-900">
                            {fine.bookIssue?.book?.title || 'Unknown Book'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                          रु{fine.amount?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFineStatusBadge(fine.status)}`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell text-sm text-gray-600">
                          {fine.paidDate ? formatDate(fine.paidDate) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;