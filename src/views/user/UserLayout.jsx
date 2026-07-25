import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { useSelector } from "react-redux";

// Hierarchical structure for the sidebar
const sidebarNavlinks = [
    { title: "Dashboard", path: "/user/dashboard" },
    { title: "Browse Books", path: "/user/browse-books" },
    {
    title: "My Borrowings",
    children: [
      { title: "Active Borrowings", path: "/user/borrowings/active" },
      { title: "Borrowing History", path: "/user/borrowings/history" },
    ],
  },
  {
    title: "My Fines",
    children: [
      { title: "Active Fines", path: "/user/fines/active" },
      { title: "Fines History", path: "/user/fines/history" },
    ],
  },
  {
    title: "My Books",
    children: [
      { title: "Wishlist", path: "/user/books/wishlist" },
      { title: "Requested Books", path: "/user/books/requested" },
      { title: "Request History", path: "/user/books/request-history" },
    ],
  },
//   { title: "Profile", path: "/user/profile" },
];

export default function UserLayout() {
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