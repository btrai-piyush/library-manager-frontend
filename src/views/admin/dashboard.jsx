import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BookMarked,
  Activity,
  ArrowRight,
  Search,
  UserPlus,
  FileText,
} from 'lucide-react';

// ---------- MOCK DATA ----------
const mockStats = {
  totalBooks: 1250,
  totalUsers: 348,
  activeBorrowings: 86,
  overdueBorrowings: 12,
  pendingRequests: 7,
  unpaidFines: 24,
  totalFinesAmount: 430.75,
  borrowRequestsToday: 3,
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'borrow_request',
    detail: 'User John Doe requested "Clean Code"',
    timestamp: '2026-07-24T14:30:00Z',
  },
  {
    id: 2,
    type: 'overdue',
    detail: 'Book "Design Patterns" overdue by Jane Smith',
    timestamp: '2026-07-24T09:15:00Z',
  },
  {
    id: 3,
    type: 'fine_paid',
    detail: 'Mark Wilson paid $15.00 fine',
    timestamp: '2026-07-23T16:45:00Z',
  },
  {
    id: 4,
    type: 'new_user',
    detail: 'New user Sarah Connor registered',
    timestamp: '2026-07-23T11:20:00Z',
  },
  {
    id: 5,
    type: 'book_returned',
    detail: '"The Pragmatic Programmer" returned by Alice Brown',
    timestamp: '2026-07-23T08:00:00Z',
  },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'borrow_request':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'overdue':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'fine_paid':
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case 'new_user':
      return <UserPlus className="w-4 h-4 text-purple-600" />;
    case 'book_returned':
      return <CheckCircle className="w-4 h-4 text-teal-600" />;
    default:
      return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

// ---------- COMPONENT ----------
export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your library operations.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/books"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Manage Books
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Total Books"
          value={mockStats.totalBooks}
          link="/admin/books"
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={mockStats.totalUsers}
          link="/admin/users"
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<BookMarked className="w-5 h-5" />}
          label="Active Borrowings"
          value={mockStats.activeBorrowings}
          sub={`${mockStats.overdueBorrowings} overdue`}
          link="/admin/borrowings"
          iconColor="text-teal-600"
          bgColor="bg-teal-50"
          alert={mockStats.overdueBorrowings > 0}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending Requests"
          value={mockStats.pendingRequests}
          link="/admin/borrow-requests"
          iconColor="text-orange-600"
          bgColor="bg-orange-50"
          alert={mockStats.pendingRequests > 0}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Unpaid Fines"
          value={`$${mockStats.totalFinesAmount.toFixed(2)}`}
          sub={`${mockStats.unpaidFines} fines`}
          link="/admin/fines"
          iconColor="text-red-600"
          bgColor="bg-red-50"
          alert={mockStats.unpaidFines > 0}
        />
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </h3>
            <Link
              to="/admin/borrowings"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ul className="space-y-4">
            {mockRecentActivity.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-gray-100">
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{item.detail}</p>
                  <p className="text-xs text-gray-400">{formatDate(item.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              to="/admin/books"
              icon={<BookOpen className="w-5 h-5" />}
              label="Add New Book"
              description="Catalog a new title"
            />
            <QuickAction
              to="/admin/users"
              icon={<Users className="w-5 h-5" />}
              label="View Users"
              description="Manage patrons"
            />
            <QuickAction
              to="/admin/borrow-requests"
              icon={<Clock className="w-5 h-5" />}
              label="Borrow Requests"
              description={`${mockStats.pendingRequests} pending`}
            />
            <QuickAction
              to="/admin/fines"
              icon={<DollarSign className="w-5 h-5" />}
              label="Manage Fines"
              description={`${mockStats.unpaidFines} unpaid`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Reusable Stat Card ----
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

// ---- Quick Action Card ----
function QuickAction({ to, icon, label, description }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
    >
      <div className="p-2 bg-gray-50 rounded-lg text-indigo-600">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}