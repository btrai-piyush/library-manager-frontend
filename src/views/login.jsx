import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, userApi } from "../api/Api";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("librarymanager.auth.user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("Found stored user:", parsedUser);
      if (parsedUser.role === 'admin') {
        navigate('/admin/dashboard');
      }
      else if (parsedUser.role === 'user') {
        navigate('/user/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe
      });

      const meUser = await authApi.getCurrentUser();

      console.log("Fetched user data after login:", meUser);

      if (!meUser) {
        throw new Error("Failed to fetch user data after login.");
      }

      let userData = meUser;
      const meEmail = meUser.email;
      if (meEmail) {
        try {
          const profile = await userApi.getByEmail(meEmail);
          if (profile) {
            userData = { ...meUser, ...profile, email: meEmail, role: profile.role };
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }

      if (!userData) {
        throw new Error("User data is not available.");
      }

      login(userData);

      setForm({ email: '', password: '' });

      if (typeof onSuccess === 'function') {
        onSuccess(userData);
      }

      if (meUser.role === 'admin') {
        navigate('/admin/dashboard');
      }
      else if (meUser.role === 'user') {
        navigate('/user/dashboard');
      }
    } catch (error) {
      setError("Login failed. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 sm:mb-5">
              <img
                alt="Patan College Logo"
                src="tu-logo.png"
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
              />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
              Patan Multiple Campus
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500 font-medium tracking-wide">
              Library Management System
            </p>
            <div className="mt-3 h-0.5 w-16 sm:w-20 bg-gray-200 rounded-full" />
          </div>

          <div className="mt-6 sm:mt-8">
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1.5">
                  <input
                    id="email"
                    value={form.email}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-1.5 relative">
                  <input
                    id="password"
                    value={form.password}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:py-3 pr-10 text-gray-900 placeholder:text-gray-400 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 transition">
                  Lost your password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              {error && (
                <div className="text-red-600 text-sm sm:text-base mt-2 text-center">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}