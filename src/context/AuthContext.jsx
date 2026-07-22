import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSession, setSession } from "../redux/authSlice";
import { authApi } from "../api/api";

const AuthContext = createContext(null);
const AUTH_USER_STORAGE_KEY = "librarymanager.auth.user";

const AUTH_SESSION_EXPIRED_EVENT = "auth:session_expired";

function AuthProvider({ children }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                dispatch(setSession({ user: parsedUser }));
            }
        } catch (error) {
            console.error("Failed to load stored user:", error);
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    const login = (userData) => {
        try {
            if (!userData) {
                throw new Error("User data is required");
            }
            
            dispatch(setSession({ user: userData }));
            
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            try {
                await authApi.logout();
            } catch (error) {
                console.warn("Logout API call failed:", error);
            }
            dispatch(clearSession());
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    useEffect(() => {
        const handleSessionExpired = async () => {
            console.log("Session expired – logging out and redirecting");
            await logout();
            window.location.href = "/login";
        };

        window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

        return () => {
            window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthProvider;