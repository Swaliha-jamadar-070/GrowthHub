import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Calendar, CalendarDays, BarChart3, 
    LogOut, User, Award, Flame
} from 'lucide-react';
import axios from 'axios';

const Navigation = () => {
    const location = useLocation();
    const { user, token, logout } = useAuth();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (user && token) {
            fetchStreak();
        }
    }, [user, token]);

    const fetchStreak = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8081/api/tasks/user/${user.id}/progress`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStreak(response.data.currentStreak || 0);
        } catch (error) {
            console.error('Failed to fetch streak:', error);
        }
    };

    if (!user) return null;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/tracker', label: 'Daily Tracker', icon: Calendar },
        { path: '/weekly-focus', label: 'Roadmap', icon: CalendarDays },
        { path: '/progress', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                RoadMap Tracker
                            </span>
                        </Link>
                        <div className="hidden md:flex space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Flame size={16} className="text-orange-500" />
                            <span className="text-sm font-medium">{streak} day streak</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 border-l pl-4">
                            <User size={18} className="text-blue-600" />
                            <span className="hidden md:inline font-medium text-sm">{user.username}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                        >
                            <LogOut size={18} />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;