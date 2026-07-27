import { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/SidebarSlice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getStoredUser = () => {
    try {
        const userData = localStorage.getItem('librarymanager.auth.user');
        if (userData) return JSON.parse(userData);
        return null;
    } catch {
        return null;
    }
};

// Helper to flatten hierarchical navlinks into a simple list of { title, path }
const flattenLinks = (links) => {
    const flat = [];
    links.forEach(link => {
        if (link.children) {
            link.children.forEach(child => flat.push(child));
        } else {
            flat.push(link);
        }
    });
    return flat;
};

const Navbar = ({ navlinks = [] }) => {
    const [user, setUser] = useState(null);
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserRole, setCurrentUserRole] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dispatch = useDispatch();
    const sidebarOpen = useSelector((state) => state.sidebar.sidebarOpen);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const mobileNavlinks = navlinks;

    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (title) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            setCurrentUserName(`${storedUser.firstName} ${storedUser.lastName}`);
            setCurrentUserRole(storedUser.role);
        }
    }, []);

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const handleProfileSettings = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        navigate(`/${user?.role}/profile`);
    };

    const handleDashboard = () => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
        navigate('/admin/dashboard');
    };

    const handleNavigation = (path) => {
        setIsMobileMenuOpen(false);
        navigate(path);
    };

    const ProfileDropdown = () => (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-full border-2 border-[#e2e8f0] bg-white px-2 py-1.5 transition-all hover:border-indigo-400 hover:bg-indigo-50 md:px-3"
            >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 md:h-8 md:w-8">
                    <span className="text-xs font-semibold md:text-sm">
                        {currentUserName.charAt(0).toUpperCase()}
                    </span>
                </div>
                <span className="hidden text-sm font-medium text-[#1e293b] lg:inline-block">
                    {currentUserName}
                </span>
                <ChevronDown
                    className={`hidden h-4 w-4 text-[#64748b] transition-transform md:block ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isDropdownOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[#e2e8f0] bg-white shadow-xl md:w-64">
                        <div className="border-b border-[#f1f5f9] px-4 py-3">
                            <p className="text-sm font-semibold text-[#1e293b] truncate">{currentUserName}</p>
                            <p className="text-xs text-[#64748b] truncate">{user?.email}</p>
                            <p className="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                            </p>
                        </div>
                        <div className="p-2">
                            {currentUserRole === 'admin' && (
                                <button
                                    type="button"
                                    onClick={() => { setIsDropdownOpen(false); handleDashboard(); }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1e293b] transition-colors hover:bg-indigo-50"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => { setIsDropdownOpen(false); handleProfileSettings(); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1e293b] transition-colors hover:bg-indigo-50"
                            >
                                <Settings className="h-4 w-4" />
                                Profile Settings
                            </button>
                            <div className="my-1 border-t border-[#f1f5f9]" />
                            <button
                                type="button"
                                onClick={() => { setIsDropdownOpen(false); handleSignOut(); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    // Mobile drawer (right sidebar) – now scrollable
    const MobileDrawer = () => (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-80 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } flex flex-col`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                            <span className="text-lg font-semibold">
                                {currentUserName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1e293b] truncate">{currentUserName}</p>
                            <p className="text-xs text-[#64748b] truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="rounded-lg p-2 hover:bg-[#f1f5f9] transition-colors shrink-0"
                    >
                        <X className="h-5 w-5 text-[#64748b]" />
                    </button>
                </div>

                {/* Scrollable link list */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="mb-4 rounded-lg bg-indigo-50 p-3">
                        <p className="text-xs font-medium text-indigo-700">
                            Role: {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        {mobileNavlinks.map((link) => {
                            // Normal link
                            if (!link.children) {
                                return (
                                    <button
                                        key={link.path}
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleNavigation(link.path);
                                        }}
                                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-[#1e293b] transition-all hover:bg-indigo-50"
                                    >
                                        {link.title}
                                    </button>
                                );
                            }

                            // Parent with children
                            return (
                                <div key={link.title}>
                                    <button
                                        onClick={() => toggleMenu(link.title)}
                                        className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium text-[#1e293b] transition-all hover:bg-indigo-50"
                                    >
                                        <span>{link.title}</span>

                                        {expandedMenus[link.title] ? (
                                            <ChevronDown className="h-4 w-4 text-slate-500" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-500" />
                                        )}
                                    </button>

                                    {expandedMenus[link.title] && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                            {link.children.map((child) => (
                                                <button
                                                    key={child.path}
                                                    onClick={() => {
                                                        setIsMobileMenuOpen(false);
                                                        handleNavigation(child.path);
                                                    }}
                                                    className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    {child.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fixed bottom actions */}
                <div className="border-t border-[#f1f5f9] p-4 shrink-0">
                    <button
                        onClick={handleProfileSettings}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#1e293b] transition-colors hover:bg-indigo-50"
                    >
                        <Settings className="h-5 w-5 text-indigo-600" />
                        Profile Settings
                    </button>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-[#e0e7f0] bg-white shadow-md">
                <nav className="relative mx-auto flex h-16 items-center justify-between px-3 sm:h-17.5 sm:px-4 lg:px-6">
                    {/* Left section: Desktop toggle + Logo */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="hidden rounded-lg p-1.5 hover:bg-[#f1f5f9] transition-colors md:block md:p-2"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5 text-[#64748b]" />
                        </button>

                        <a href="/dashboard" className="flex items-center gap-2 shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-indigo-100/50 blur-sm" />
                                <div className="relative flex h-15 w-15 items-center justify-center rounded-full sm:h-15 sm:w-15 md:h-15 md:w-15">
                                    <img
                                        src="/tu-logo.png"
                                        alt="Logo"
                                        className="h-15 w-15 sm:h-15 sm:w-15 md:h-15 md:w-15"
                                    />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-lg font-bold text-[#1e293b] leading-tight md:text-lg">
                                    Patan Multiple Campus
                                </span>
                                <span className="block text-[13px] font-medium text-[#475569] tracking-wide md:text-[13px]">
                                    Library Management System
                                </span>
                            </div>
                        </a>
                    </div>

                    {/* Center title for mobile only */}
                    <div className="flex flex-col items-center sm:hidden absolute left-1/2 transform -translate-x-1/2">
                        <span className="text-[18px] font-bold text-[#1e293b] leading-tight whitespace-nowrap">
                            Patan Multiple Campus
                        </span>
                        <span className="text-[13px] font-medium text-[#475569] tracking-wide whitespace-nowrap">
                            Library Management System
                        </span>
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-lg p-1.5 hover:bg-[#f1f5f9] transition-colors sm:p-2 md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5 text-[#64748b]" />
                        </button>

                        <div className="hidden md:block">
                            <ProfileDropdown />
                        </div>

                        <div className="md:hidden">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 sm:h-8 sm:w-8">
                                <span className="text-xs font-semibold sm:text-sm">
                                    {currentUserName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <MobileDrawer />
        </>
    );
};

export default Navbar;