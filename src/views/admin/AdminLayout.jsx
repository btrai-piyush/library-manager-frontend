import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useSelector } from "react-redux";

// Hierarchical structure for the sidebar
const sidebarNavlinks = [
    { title: "Dashboard", path: "/admin/dashboard" },
    { title: "Users", path: "/admin/users" },
    {
    title: "Manage Borrowings",
    children: [
      { title: "Active Borrowings", path: "/admin/borrowings/active" },
      { title: "Borrowing History", path: "/admin/borrowings/history" },
    ],
  },
  {
    title: "Borrow Requests",
    children: [
      { title: "Pending Requests", path: "/admin/borrow-requests/pending" },
      { title: "Request History", path: "/admin/borrow-requests/history" },
    ],
  },
  {
    title: "Manage Fines",
    children: [
      { title: "Unpaid Fines", path: "/admin/fines/unpaid" },
      { title: "Fines History", path: "/admin/fines/history" },
    ],
  },
  {
    title: "Manage Books",
    children: [
      { title: "Browse Books", path: "/admin/books/browse" },
      { title: "Add Books", path: "/admin/books/add" },
    ],
  },
];

export default function AdminLayout() {
  const sidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);

  return (
    <div className="flex h-screen flex-col">
      <Navbar navlinks={sidebarNavlinks} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navlinks={sidebarNavlinks} />
        <main
          className={`flex-1 overflow-y-auto bg-gray-50 p-4 transition-all duration-200 md:p-6 ${
            sidebarOpen ? "md:ml-62.5" : "md:ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}