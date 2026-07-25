import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../redux/sidebarSlice";

// Small chevron icon for expand/collapse
function ChevronIcon({ open }) {
  return (
    <svg
      className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Sidebar({ navlinks }) {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);
  const location = useLocation();

  // Keep track of which top‑level sections are expanded
  const [openSections, setOpenSections] = useState({});

  // Auto‑expand the section that contains the currently active child route
  useEffect(() => {
    const newOpenSections = {};
    navlinks.forEach((link) => {
      if (link.children) {
        const hasActiveChild = link.children.some(
          (child) => location.pathname === child.path || location.pathname.startsWith(child.path + "/")
        );
        if (hasActiveChild) newOpenSections[link.title] = true;
      }
    });
    setOpenSections((prev) => ({ ...prev, ...newOpenSections }));
  }, [location.pathname, navlinks]);

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={`hidden md:block fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-62.5 overflow-y-auto overflow-x-hidden border-r border-[#25385c] bg-[#1c2d4c] text-white transition-transform duration-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:top-17.5 md:h-[calc(100vh-70px)]`}
    >
      <nav className="py-1">
        {navlinks.map((link) => {
          // If the link has children, render a collapsible section
          if (link.children) {
            const isOpen = openSections[link.title] || false;
            return (
              <div key={link.title}>
                <button
                  onClick={() => toggleSection(link.title)}
                  className="flex w-full items-center px-4 py-3 text-[15px] font-medium tracking-wide text-[#7f92b7] hover:bg-[#2a3f67] hover:text-white transition-colors border-b border-[#2a3f67]"
                >
                  {link.title}
                  <ChevronIcon open={isOpen} />
                </button>
                {isOpen && (
                  <div className="bg-[#16233f]">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block pl-8 pr-4 py-2.5 text-[14px] font-medium transition-colors border-b border-[#1e3056] last:border-b-0 ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-[#7f92b7] hover:bg-[#2a3f67] hover:text-white"
                          }`
                        }
                      >
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Top‑level link without children (e.g., Dashboard, Browse Books, Profile)
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block px-4 py-3 text-[15px] font-medium tracking-wide transition-colors border-b border-[#2a3f67] last:border-b-0 ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-[#7f92b7] hover:bg-[#2a3f67] hover:text-white"
                }`
              }
            >
              {link.title}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}