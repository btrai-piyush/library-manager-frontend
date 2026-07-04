import useState from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, userApi } from "../api/api";
import { useDispatch, useSelector } from "react-redux";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await authApi.login({
        email: form.email,
        password: form.password
      });

      const meResponse=await authApi.getCurrentUser();
      const meUser=meResponse.user;

      if(!meUser){
        
      }
    } catch (error) {
      console.error("Login failed:", error);
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
                  <a
                    href="#"
                    className="text-xs sm:text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-colors duration-200"
                  >
                    Forgot password?
                  </a>
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
                    className="block w-full rounded-xl border-0 bg-white/10 px-4 py-2.5 sm:py-3 text-white placeholder:text-white/40 shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-indigo-400 outline-none transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="group relative w-full flex justify-center rounded-xl bg-linear-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}