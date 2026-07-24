import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PublicRoute, UserRoute, AdminRoute } from '../components/ProtectedRoutes';
import Login from '../views/Login';
import AdminDashboard from '../views/admin/Dashboard';
import Books from '../views/admin/Books';
import Borrowings from '../views/admin/Borrowings';
import Users from '../views/admin/Users';
import BorrowRequests from '../views/admin/BorrowRequests';
import Fines from '../views/admin/Fines';
import UserDashboard from '../views/user/Dashboard';
import BrowseBooks from '../views/user/BrowseBooks';
import ActiveBorrowings from '../views/user/borrowings/ActiveBorrowings';
import BorrowingHistory from '../views/user/borrowings/BorrowingHistory';
import ActiveFines from '../views/user/fines/ActiveFines';
import FinesHistory from '../views/user/fines/FinesHistory';
import Wishlist from '../views/user/mybooks/Wishlist';
import RequestedBooks from '../views/user/mybooks/RequestedBooks';
import RequestedHistory from '../views/user/mybooks/RequestHistory';
import Profile from '../views/user/Profile';
import AdminLayout from '../views/admin/AdminLayout';
import UserLayout from '../views/user/UserLayout';

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Navigate to="/login" replace />
        },
        {
            path: "/login",
            element: (
                <PublicRoute>
                    <Login />
                </PublicRoute>
            )
        },
        {
            path: "/admin",
            element: (
                <AdminRoute>
                    <AdminLayout />
                </AdminRoute>
            ),
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <AdminDashboard /> },
                { path: "books", element: <Books /> },
                { path: "users", element: <Users /> },
                { path: "borrow-requests", element: <BorrowRequests /> },
                { path: "borrowings", element: <Borrowings /> },
                { path: "fines", element: <Fines /> }
            ]
        },
        {
            path: "/user",
            element: (
                <UserRoute>
                    <UserLayout />
                </UserRoute>
            ),
            children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <UserDashboard /> },

                // Borrowings – nested
                {
                    path: "borrowings",
                    children: [
                        { index: true, element: <Navigate to="active" replace /> },
                        { path: "active", element: <ActiveBorrowings /> },
                        { path: "history", element: <BorrowingHistory /> }
                    ]
                },

                // Fines – nested
                {
                    path: "fines",
                    children: [
                        { index: true, element: <Navigate to="active" replace /> },
                        { path: "active", element: <ActiveFines /> },
                        { path: "history", element: <FinesHistory /> }
                    ]
                },

                // My Books – nested (wishlist + requested)
                {
                    path: "books",
                    children: [
                        { index: true, element: <Navigate to="wishlist" replace /> },
                        { path: "wishlist", element: <Wishlist /> },
                        { path: "requested", element: <RequestedBooks /> },
                        { path: "request-history", element: <RequestedHistory /> }
                    ]
                },

                // Standalone routes (no nesting)
                { path: "browse-books", element: <BrowseBooks /> },
                { path: "profile", element: <Profile /> }
            ]
        },
        {
            path: "*",
            element: <Navigate to="/login" replace />
        }
    ],
    {
        future: {
            v7_relativeSplatPath: true
        }
    }
);

export default router;