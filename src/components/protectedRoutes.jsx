import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        if (user.role == "user") {
            return <Navigate to="/user" replace />;
        }
        else if (user.role === "admin") {
            return <Navigate to="/admin" replace />;
        }
    }

    return children;
}

export function UserRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        if (user.role == "user") {
            return children;
        }
        else if (user.role === "admin") {
            return <Navigate to="/admin" replace />;
        }
    }
    else {
        return <Navigate to="/login" replace />;
    }
}

export function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        if (user.role === "admin") {
            return children;
        }
        else if (user.role === "user") {
            return <Navigate to="/user" replace />;
        }
    }
    else {
        return <Navigate to="/login" replace />;
    }
}