import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCrown, FaStar, FaFire, FaTrophy, FaCalendarCheck, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Profile = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`http://localhost:8081/api/tasks/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            setLoading(false);
        } catch (error) {
            console.error('❌ Failed to fetch profile data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // --- CALCULATE REAL DATA ---
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.overallCompleted === true).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate Real XP (1 XP per task completed)
    const totalXP = completedTasks * 10; 

    // Calculate Streak
    const calculateStreak = () => {
        let streak = 0;
        const sorted = [...tasks].sort((a, b) => a.day - b.day);
        for (const task of sorted) {
            if (task.overallCompleted === true) streak++;
            else break;
        }
        return streak;
    };
    const streak = calculateStreak();

    // Determine Level based on XP
    const getLevel = (xp) => {
        if (xp < 50) return { name: 'Beginner', color: 'text-secondary', icon: '🌱' };
        if (xp < 150) return { name: 'Bronze', color: 'text-orange-500', icon: '🥉' };
        if (xp < 300) return { name: 'Silver', color: 'text-gray-500', icon: '🥈' };
        if (xp < 500) return { name: 'Gold', color: 'text-yellow-500', icon: '🥇' };
        return { name: 'Platinum', color: 'text-indigo-500', icon: '💎' };
    };
    const currentLevel = getLevel(totalXP);

    // Achievements Data (Derived from real data)
    const achievements = [
        { 
            id: 1, 
            name: '7 Day Streak', 
            icon: '🔥', 
            achieved: streak >= 7, 
            color: 'bg-orange-100 text-orange-600' 
        },
        { 
            id: 2, 
            name: '50 Tasks', 
            icon: '⭐', 
            achieved: completedTasks >= 50, 
            color: 'bg-blue-100 text-blue-600' 
        },
        { 
            id: 3, 
            name: 'Gold Rank', 
            icon: '🏆', 
            achieved: totalXP >= 300, 
            color: 'bg-yellow-100 text-yellow-600' 
        },
        { 
            id: 4, 
            name: 'Consistency', 
            icon: '📅', 
            achieved: completionRate >= 50, 
            color: 'bg-green-100 text-green-600' 
        },
    ];

    return (
        <div className="container-fluid p-0 pb-5">
            {/* --- PROFILE HEADER & COVER (Professional Look) --- */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white rounded-4 shadow-sm overflow-hidden mb-4"
            >
                {/* Cover Image */}
                <div 
                    className="w-100 position-relative" 
                    style={{ 
                        height: '180px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    }}
                >
                    <button className="btn btn-sm btn-light position-absolute top-0 end-0 m-3 rounded-pill shadow-sm">
                        <FaEdit className="me-1" /> Edit Cover
                    </button>
                </div>

                {/* Profile Info Area */}
                <div className="px-4 pb-4 position-relative" style={{ marginTop: '-75px' }}>
                    <div className="row align-items-end">
                        {/* Avatar */}
                        <div className="col-md-auto text-center text-md-start">
                            <div className="bg-white p-2 rounded-circle d-inline-block shadow-lg">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center bg-gradient-to-r from-indigo-500 to-purple-600"
                                    style={{ width: '130px', height: '130px', color: 'white' }}
                                >
                                    <FaUser size={60} />
                                </div>
                            </div>
                        </div>

                        {/* Name & Bio */}
                        <div className="col-md mt-3 mt-md-0 text-center text-md-start">
                            <h2 className="fw-bold text-dark mb-0 fs-3">
                                {user?.fullName || user?.username}
                            </h2>
                            <p className="text-muted mb-2">{user?.email}</p>
                            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                    <FaCrown className="text-warning me-1" /> {currentLevel.name}
                                </span>
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                    <FaFire className="text-danger me-1" /> {streak} Day Streak
                                </span>
                                <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                    <FaStar className="text-warning me-1" /> {totalXP} XP
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="col-md-auto mt-3 mt-md-0 text-center text-md-end">
                            <button className="btn btn-primary rounded-pill px-4 shadow-sm">
                                <FaEdit className="me-2" /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- TABS --- */}
            <div className="d-flex gap-4 border-bottom mb-4 px-2">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`btn btn-link text-decoration-none pb-2 px-3 fw-semibold position-relative ${activeTab === 'overview' ? 'text-primary border-bottom border-primary border-2' : 'text-muted'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('achievements')}
                    className={`btn btn-link text-decoration-none pb-2 px-3 fw-semibold position-relative ${activeTab === 'achievements' ? 'text-primary border-bottom border-primary border-2' : 'text-muted'}`}
                >
                    Achievements
                </button>
            </div>

            {/* --- TAB CONTENT: OVERVIEW --- */}
            {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="row g-4">
                    <div className="col-lg-6">
                        <div className="bg-white rounded-4 shadow-sm p-4 border border-light">
                            <h5 className="fw-bold mb-4 border-bottom pb-2">📊 My Stats</h5>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-50 rounded-3">
                                    <span className="text-muted fw-medium">Total XP</span>
                                    <span className="fw-bold text-dark fs-5">{totalXP}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-50 rounded-3">
                                    <span className="text-muted fw-medium">Level</span>
                                    <span className={`fw-bold fs-5 ${currentLevel.color}`}>{currentLevel.icon} {currentLevel.name}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-50 rounded-3">
                                    <span className="text-muted fw-medium">Tasks Completed</span>
                                    <span className="fw-bold text-dark fs-5">{completedTasks}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-50 rounded-3">
                                    <span className="text-muted fw-medium">Current Streak</span>
                                    <span className="fw-bold text-danger fs-5"><FaFire className="me-1" /> {streak} days</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light bg-opacity-50 rounded-3">
                                    <span className="text-muted fw-medium">Completion Rate</span>
                                    <span className="fw-bold text-success fs-5">{completionRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="bg-white rounded-4 shadow-sm p-4 border border-light">
                            <h5 className="fw-bold mb-4 border-bottom pb-2">🏆 Recent Achievements</h5>
                            <div className="row g-3">
                                {achievements.slice(0, 4).map((ach) => (
                                    <div className="col-6" key={ach.id}>
                                        <div className={`p-3 rounded-3 text-center ${ach.achieved ? ach.color : 'bg-light text-muted opacity-50'}`}>
                                            <div className="fs-2 mb-1">{ach.icon}</div>
                                            <h6 className="small fw-bold mb-0">{ach.name}</h6>
                                            <span className="small">{ach.achieved ? '✅ Unlocked' : '🔒 Locked'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- TAB CONTENT: ACHIEVEMENTS --- */}
            {activeTab === 'achievements' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="row g-4">
                    <div className="col-12">
                        <div className="bg-white rounded-4 shadow-sm p-4 border border-light">
                            <h5 className="fw-bold mb-4 border-bottom pb-2">🏅 All Achievements</h5>
                            <div className="row g-3">
                                {achievements.map((ach) => (
                                    <div className="col-md-3 col-6" key={ach.id}>
                                        <div className={`p-4 rounded-4 text-center shadow-sm ${ach.achieved ? 'bg-white border border-success' : 'bg-light opacity-50'}`}>
                                            <div className="fs-1 mb-2">{ach.icon}</div>
                                            <h6 className="fw-bold mb-1">{ach.name}</h6>
                                            <p className="small text-muted mb-0">
                                                {ach.achieved ? '✅ Achieved' : '⏳ In Progress'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Profile;