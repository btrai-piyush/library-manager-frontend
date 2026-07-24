import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { userApi } from '../../api/Api'; // adjust path
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Shield,
  Loader2,
} from 'lucide-react';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userApi.getStudentDetails(userId);
        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 text-lg">Loading profile...</span>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // Destructure data
  const {
    firstName,
    lastName,
    email,
    phone,
    role,
    status,
    createdAt,
    studentDetail,
  } = profile || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Your personal and academic information.
        </p>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50/50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Personal Information
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoField icon={<User className="w-4 h-4" />} label="Full Name" value={`${firstName || ''} ${lastName || ''}`} />
          <InfoField icon={<Mail className="w-4 h-4" />} label="Email" value={email} />
          <InfoField icon={<Phone className="w-4 h-4" />} label="Phone" value={phone || 'Not provided'} />
          <InfoField icon={<Shield className="w-4 h-4" />} label="Role" value={role} />
          <InfoField
            icon={<Calendar className="w-4 h-4" />}
            label="Member Since"
            value={formatDate(createdAt)}
          />
          <InfoField
            icon={<Shield className="w-4 h-4" />}
            label="Account Status"
            value={status ? 'Active' : 'Inactive'}
            valueClass={status ? 'text-green-600' : 'text-red-600'}
          />
        </div>
      </div>

      {/* Student Details Card (only if studentDetail exists) */}
      {studentDetail && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Academic Details
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField
              icon={<BookOpen className="w-4 h-4" />}
              label="Course"
              value={studentDetail.courseName}
            />
            <InfoField
              icon={<GraduationCap className="w-4 h-4" />}
              label="Semester"
              value={`Semester ${studentDetail.semester}`}
            />
          </div>
        </div>
      )}

      {/* Edit Profile placeholder (future) */}
      <div className="flex justify-end">
        <button
          disabled
          className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
          title="Editing will be available soon"
        >
          Edit Profile (Coming Soon)
        </button>
      </div>
    </div>
  );
}

// Small helper component for consistent layout
function InfoField({ icon, label, value, valueClass }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`font-medium text-gray-900 ${valueClass || ''}`}>
        {value || '—'}
      </div>
    </div>
  );
}