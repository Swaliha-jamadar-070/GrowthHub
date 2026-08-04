import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome, FaCalendarAlt, FaRoad, FaChartBar,
    FaSignOutAlt, FaUser, FaBars, FaTimes,
    FaCog, FaUserCircle, FaBell, FaMoon, FaSun
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FaHome },
        { name: 'Daily Tracker', href: '/tracker', icon: FaCalendarAlt },
        { name: 'Roadmap', href: '/weekly-focus', icon: FaRoad },
        { name: 'Progress', href: '/progress', icon: FaChartBar },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
                {/* Mobile Sidebar */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-dark-card shadow-2xl p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-gray-200 dark:border-dark-border">
                                <span className="fw-bold fs-4" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    🚀 RoadMap
                                </span>
                                <button onClick={() => setSidebarOpen(false)} className="btn btn-link text-dark p-0">
                                    <FaTimes size={20} />
                                </button>
                            </div>
                            <nav className="d-flex flex-column gap-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                                        >
                                            <item.icon size={18} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <hr className="my-3 border-gray-200 dark:border-dark-border" />
                                <button onClick={handleLogout} className="sidebar-link text-danger">
                                    <FaSignOutAlt size={18} /> Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <div className="d-none d-lg-flex flex-column vh-100 bg-white dark:bg-dark-card shadow-sm p-4" style={{ width: '260px', position: 'fixed', zIndex: 100, borderRight: '1px solid #e2e8f0' }}>
                    <div className="mb-4 pb-3 border-bottom border-gray-200 dark:border-dark-border">
                        <span className="fw-bold fs-4" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            🚀 GrowthHub
                        </span>
                    </div>
                    <nav className="d-flex flex-column gap-1 flex-grow-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link key={item.name} to={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                                    <item.icon size={18} /> {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-top pt-3 border-gray-200 dark:border-dark-border">
                        <div className="d-flex align-items-center gap-3 p-2 rounded-3 bg-light dark:bg-dark-bg mb-2">
                            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                <FaUser size={16} />
                            </div>
                            <div className="flex-grow-1">
                                <p className="fw-semibold mb-0 small text-dark dark:text-light-text">{user?.fullName || user?.username}</p>
                                <p className="text-muted small mb-0">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="sidebar-link text-danger w-100">
                            <FaSignOutAlt size={18} /> Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow-1" style={{ marginLeft: '260px' }}>
                    {/* Top Navigation */}
                    <div className="sticky-top bg-white dark:bg-dark-card border-bottom border-gray-200 dark:border-dark-border px-4 py-3 d-flex justify-content-between align-items-center" style={{ zIndex: 50 }}>
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="d-lg-none btn btn-link text-dark p-0">
                                <FaBars size={24} />
                            </button>
                            <span className="fw-bold d-lg-none" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                🚀GrowthHub
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <button onClick={toggleTheme} className="btn btn-link text-dark p-0">
                                {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
                            </button>
                            <button className="btn btn-link text-dark p-0 position-relative">
                                <FaBell size={20} />
                                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle" style={{ width: '8px', height: '8px' }} />
                            </button>
                            <Link to="/profile" className="btn btn-link text-dark p-0">
                                <FaUserCircle size={24} />
                            </Link>
                        </div>
                    </div>

                    <main className="p-4 p-md-5">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;