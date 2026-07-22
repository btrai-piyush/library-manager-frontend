import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/navbar";
import Sidebar from "../../components/layout/sidebar";
import { useSelector } from "react-redux";

const navlinks = [
    { title: "Dashboard", path: "/user/dashboard" },
    { title: "My Borrowings", path: "/user/borrowings" },
    { title: "My Fines", path: "/user/fines" },
    { title: "Profile", path: "/user/profile" },
    { title: "Browse Books", path: "/user/browse-books" },
    { title: "Wish List", path: "/user/wishlist" },
];

export default function UserLayout() {
    const sidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);

    return (
        <div className="flex h-screen flex-col">
            <Navbar
                navlinks={navlinks}
            />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    navlinks={navlinks}
                />
                <main
                    className={`flex-1 overflow-y-auto bg-gray-50 p-4 transition-all duration-200 md:p-6 ${
                        sidebarOpen ? 'md:ml-62.5' : 'md:ml-0'
                    }`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}