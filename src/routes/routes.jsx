import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PublicRoute, UserRoute, AdminRoute } from '../components/ProtectedRoutes';
import Login from '../views/Login';

import AdminDashboard from '../views/admin/Dashboard';
import Users from '../views/admin/Users';
import AdminActiveBorrowings from '../views/admin/borrowings/ActiveBorrowings';
import AdminBorrowingHistory from '../views/admin/borrowings/BorrowingHistory';
import PendingRequests from '../views/admin/borrow-requests/PendingRequests';
import RequestsHistory from '../views/admin/borrow-requests/RequestsHistory';
import UnpaidFines from '../views/admin/fines/UnpaidFines';
import AdminFinesHistory from '../views/admin/fines/finesHistory';
import AddBooks from '../views/admin/books/AddBooks';
import AdminBrowseBooks from '../views/admin/books/BrowseBooks';

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

                {
                    path:"borrow-requests",
                    children: [
                        { index: true, element: <Navigate to="pending" replace /> },
                        { path: "pending", element: <PendingRequests /> },
                        { path: "history", element: <RequestsHistory /> }
                    ]
                },

                // Fines – nested
                {
                    path: "fines",
                    children: [
                        { index: true, element: <Navigate to="unpaid" replace /> },
                        { path: "unpaid", element: <UnpaidFines /> },
                        { path: "history", element: <FinesHistory /> }
                    ]
                },

                // My Books – nested (wishlist + requested)
                {
                    path: "books",
                    children: [
                        { index: true, element: <Navigate to="browse" replace /> },
                        { path: "browse", element: <BrowseBooks /> },
                        { path: "add", element: <AddBooks /> }
                    ]
                },

                {path: "users", element: <Users />}
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