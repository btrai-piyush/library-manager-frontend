import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { PublicRoute, UserRoute, AdminRoute } from '../components/protectedRoutes';
import Login from '../views/login';
import AdminDashboard from '../views/admin/dashboard';
import Books from '../views/admin/books';
import Users from '../views/admin/users';
import BorrowRequests from '../views/admin/borrowRequests';
import Borrowings from '../views/admin/borrowings';
import Fines from '../views/admin/fines';
import UserDashboard from '../views/user/dashboard';
import BrowseBooks from '../views/user/browseBooks';
import UserBorrowings from '../views/user/borrowings';
import UserFines from '../views/user/fines';
import WishList from '../views/user/wishlist';
import Profile from '../views/user/profile';
import AdminLayout from '../views/admin/AdminLayout';
import UserLayout from '../views/user/UserLayout';

// Create the router object first
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
                {
                    index: true,
                    element: <Navigate to="dashboard" replace />
                },
                {
                    path: "dashboard",
                    element: <AdminDashboard />
                },
                {
                    path: "books",
                    element: <Books />
                },
                {
                    path: "users",
                    element: <Users />
                },
                {
                    path: "borrow-requests",
                    element: <BorrowRequests />
                },
                {
                    path: "borrowings",
                    element: <Borrowings />
                },
                {
                    path: "fines",
                    element: <Fines />
                }
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
                {
                    index: true,
                    element: <Navigate to="dashboard" replace />
                },
                {
                    path: "dashboard",
                    element: <UserDashboard />
                },
                {
                    path: "browse-books",
                    element: <BrowseBooks />
                },
                {
                    path: "borrowings",
                    element: <UserBorrowings />
                },
                {
                    path: "fines",
                    element: <UserFines />
                },
                {
                    path: "wishlist",
                    element: <WishList />
                },
                {
                    path: "profile",
                    element: <Profile />
                }
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