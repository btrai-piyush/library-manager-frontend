import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, userApi } from "../api/api";
import { useDispatch, useSelector } from "react-redux";

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
      await authApi.login({
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className=" bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 sm:mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
                <img
                  alt="Patan College Logo"
                  src="tu-logo.png"
                  className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 object-contain drop-shadow-lg"
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Patan Multiple Campus
            </h1>
            <p className="mt-1 text-sm sm:text-base text-indigo-200/80 font-medium tracking-wide">
              Library Management System
            </p>
            <div className="mt-3 h-0.5 w-16 sm:w-20 bg-linear-to-r from-transparent via-indigo-400 to-transparent rounded-full" />
          </div>

          <div className="mt-6 sm:mt-8">
            <form action="#" method="POST" className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-indigo-100/90"
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
                    className="block w-full rounded-xl border-0 bg-white/10 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-indigo-400 outline-none transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-indigo-100/90"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-1.5">
                  <input
                    id="password"
                    value={form.password}
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-white/10 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-indigo-400 outline-none transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex cursor-pointer items-center gap-2 text-[14px] text-[#4b5563]">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-[#cbd5e1] text-[#baec16] focus:ring-[#ff5a5f]"
                  />
                  <span className="text-white">Remember me</span>
                </label>
                <a href="#" className="text-[14px] text-[#eeeef5] transition hover:text-[#7170d8]">Lost your password?</a>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              {error && (
                <div className="text-red-500 text-sm sm:text-base mt-2">
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