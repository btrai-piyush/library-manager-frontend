import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Heart,
  Send,
  User,
  Search,
  DollarSign,
  Calendar,
  ArrowRight,
  Loader2,
  BookCheck,       // new
  HeartOff,        // new
  Ban,             // new
  XCircle,         // new
} from 'lucide-react';
import { commonApi } from '../../api/Api'; // adjust path

export default function UserDashboard() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await commonApi.userDashboardStats(userId);
        setStats(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // Destructure API response (with fallbacks)
  const {
    activeBorrowings = 0,
    unpaidFines = 0,
    unpaidFinesAmount = 0,
    wishlistItems = 0,
    requestedBooks = 0,
    upcomingDueDates = [],
    recentActivity = [],
  } = stats || {};

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.startsWith('0001')) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const now = new Date();
  const isSoon = (dueDate) => ((new Date(dueDate) - now) <= 3 * 24 * 60 * 60 * 1000);

  // Determine alert style for due dates
  const getDueStatus = (dueDate) => {
    var due = new Date(dueDate);
    if(due.toDateString() === now.toDateString()) return 'Today';
    else if((due - now) <= 3 * 24 * 60 * 60 * 1000) return 'Soon';
    else return 'On Time';
  };

  // Map activity type to icon and colour
  const getActivityIcon = (type) => {
    switch (type) {
      case 'BookIssued':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'BookReturned':
        return <BookCheck className="w-4 h-4 text-green-600" />;
      case 'BookWishlisted':
        return <Heart className="w-4 h-4 text-pink-600" />;
      case 'BookUnwishlisted':
        return <HeartOff className="w-4 h-4 text-gray-600" />;
      case 'BookRequested':
        return <Send className="w-4 h-4 text-orange-600" />;
      case 'BookRequestCancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'BookRequestRejected':
        return <Ban className="w-4 h-4 text-red-600" />;
      case 'FinePaid':
        return <DollarSign className="w-4 h-4 text-teal-600" />;
      case 'FineIncurred':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your library overview at a glance.</p>
        </div>
        <Link
          to="/user/browse-books"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Books
        </Link>
      </div>

      {/* Fines Alert (if any) */}
      {unpaidFines > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">You have unpaid fines</h3>
            <p className="text-yellow-700 text-sm">
              {unpaidFines} fine{unpaidFines > 1 ? 's' : ''} totaling $
              {unpaidFinesAmount.toFixed(2)}. Please resolve them at the library or contact support.
            </p>
          </div>
          <Link
            to="/user/fines/active"
            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline whitespace-nowrap"
          >
            View Fines
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Active Borrowings"
          value={activeBorrowings}
          sub={null}
          link="/user/borrowings/active"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Unpaid Fines"
          value={`$${unpaidFinesAmount.toFixed(2)}`}
          sub={unpaidFines > 0 ? `${unpaidFines} fine(s)` : null}
          link="/user/fines/active"
          iconColor="text-red-600"
          bgColor="bg-red-50"
          alert={unpaidFines > 0}
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Wishlist"
          value={wishlistItems}
          link="/user/books/wishlist"
          iconColor="text-pink-600"
          bgColor="bg-pink-50"
        />
        <StatCard
          icon={<Send className="w-5 h-5" />}
          label="Requested Books"
          value={requestedBooks}
          link="/user/books/requested"
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Due Dates */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Upcoming Due Dates
            </h3>
            <Link
              to="/user/borrowings/active"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingDueDates.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming due dates.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingDueDates.map((item, idx) => (
                <li
                  key={item.bookIssueId || idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {item.book?.title || 'Unknown Book'}
                    </p>
                    <p className="text-xs text-gray-500">Due: {formatDate(item.dueDate)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSoon(item.dueDate)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {getDueStatus(item.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Recent Activity
          </h3>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity to show.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {/* Dynamic icon based on activity type */}
                  <div className="mt-0.5 p-1 rounded-full bg-gray-100">
                    {getActivityIcon(item.activityType)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{item.description || 'Unknown activity'}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink to="/user/borrowings/active" icon={<BookOpen className="w-5 h-5" />} label="Borrowings" />
          <QuickLink to="/user/fines/active" icon={<DollarSign className="w-5 h-5" />} label="Fines" />
          <QuickLink to="/user/books/wishlist" icon={<Heart className="w-5 h-5" />} label="Wishlist" />
          <QuickLink to="/user/profile" icon={<User className="w-5 h-5" />} label="Profile" />
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard
function StatCard({ icon, label, value, sub, link, iconColor, bgColor, alert }) {
  return (
    <Link
      to={link}
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
        alert ? 'ring-2 ring-red-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${bgColor} ${iconColor}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </Link>
  );
}

// Reusable QuickLink
function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
    >
      <span className="text-indigo-600">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}