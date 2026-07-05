import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/navbar";
import Sidebar from "../../components/layout/sidebar";
import { useSelector } from "react-redux";


const navlinks = [
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Users", path: "/admin/users" },
    { title: "Books", path: "/admin/books" },
    { title: "Borrowings", path: "/admin/borrowings" },
    { title: "Borrow Requests", path: "/admin/borrow-requests" },
    { title: "Fines", path: "/admin/fines" }
];

export default function AdminLayout() {
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
                        sidebarOpen ? 'md:ml-[250px]' : 'md:ml-0'
                    }`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}