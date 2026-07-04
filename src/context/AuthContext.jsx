import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSession, setSession } from "../redux/authSlice";
import { authApi } from "../api/api";

const AuthContext = createContext(null);
const AUTH_USER_STORAGE_KEY = "librarymanager.auth.user";

function AuthProvider({ children }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (storedUser) {
            dispatch(setSession({ user: JSON.parse(storedUser) }));
        }
        setLoading(false);
    }, [dispatch]);

    const login = async (username, password) => {
        try {
            const response = await authApi.login(username, password);
            if (response && response.user) {
                dispatch(setSession({ user: response.user }));
                localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            dispatch(clearSession());
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;