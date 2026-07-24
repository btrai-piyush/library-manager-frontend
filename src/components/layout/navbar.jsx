import { useState, useEffect } from 'react';
import {
    ChevronDown,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/SidebarSlice';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const getStoredUser = () => {
    try {
        const userData = localStorage.getItem('librarymanager.auth.user');
        if (userData) return JSON.parse(userData);
        return null;
    } catch {
        return null;
    }
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

    // Mobile drawer (right sidebar)
    const MobileDrawer = () => (
        <>
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"   // ✅ add md:hidden here
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-80 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-4 sm:px-6">
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
                        className="rounded-lg p-2 hover:bg-[#f1f5f9] transition-colors flex-shrink-0"
                    >
                        <X className="h-5 w-5 text-[#64748b]" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4 rounded-lg bg-indigo-50 p-3">
                        <p className="text-xs font-medium text-indigo-700">
                            Role: {currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        {navlinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => handleNavigation(link.path)}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-[#1e293b] transition-colors hover:bg-indigo-50"
                            >
                                {/* You can add icons here if you have them in navlinks */}
                                <span>{link.title}</span>
                            </button>
                        ))}
                        <div className="border-t border-[#f1f5f9] my-2" />
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
            </div>
        </>
    );

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-[#e0e7f0] bg-white shadow-md">
                <nav className="relative mx-auto flex h-16 items-center justify-between px-3 sm:h-17.5 sm:px-4 lg:px-6">
                    {/* Left section: Desktop toggle + Logo */}
                    <div className="flex items-center gap-2">
                        {/* Desktop sidebar toggle button (hidden on mobile) */}
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
                                <div className="relative flex h-15 w-15 items-center justify-center rounded-full sm:h-15 sm:w-20 md:h-15 md:w-20">
                                    <img
                                        src="/tu-logo.png"
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="h-13 w-13 sm:h-15 sm:w-15 md:h-15 md:w-15"
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
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-lg p-1.5 hover:bg-[#f1f5f9] transition-colors sm:p-2 md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5 text-[#64748b]" />
                        </button>

                        {/* Profile dropdown (desktop) */}
                        <div className="hidden md:block">
                            <ProfileDropdown />
                        </div>

                        {/* Mobile avatar */}
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

            {/* Mobile drawer */}
            <MobileDrawer />
        </>
    );
};

export default Navbar;