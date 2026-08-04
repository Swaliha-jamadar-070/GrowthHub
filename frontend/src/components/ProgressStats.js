import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaChartPie, FaChartBar, FaRocket, FaCheckCircle, FaFire, FaBullseye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ProgressStats = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // ACTUAL DAYS REMAINING CALCULATION
    const targetDate = new Date(2026, 10, 30); // November 30, 2026
    const today = new Date();
    const actualDaysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

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
            console.error('❌ Failed to fetch:', error);
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

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.overallCompleted === true).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const javaCompleted = tasks.filter(t => t.javaCompleted === true).length;
    const leetcodeCompleted = tasks.filter(t => t.leetcodeCompleted === true).length;
    const dsaCompleted = tasks.filter(t => t.dsaCompleted === true).length;
    const sqlCompleted = tasks.filter(t => t.sqlCompleted === true).length;
    const projectCompleted = tasks.filter(t => t.projectCompleted === true).length;
    const githubCompleted = tasks.filter(t => t.githubCompleted === true).length;

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

    // --- PROFESSIONAL LIGHT THEME CHART OPTIONS ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { 
                    color: '#6b7280', // Dark Gray for Light Mode
                    font: { family: 'Inter, sans-serif', size: 12, weight: '500' },
                    boxWidth: 15,
                    padding: 15
                },
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#111827',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }, // Light grid lines
                ticks: { color: '#6b7280' },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280' },
            },
        },
    };

    const pieData = {
        labels: ['Completed ✅', 'Remaining ⏳'],
        datasets: [{
            data: [completedTasks, Math.max(0, totalTasks - completedTasks)],
            backgroundColor: ['#8b5cf6', '#e5e7eb'], // Purple vs Light Gray
            borderWidth: 0,
        }],
    };

    const barData = {
        labels: ['Java', 'LeetCode', 'DSA', 'SQL/API', 'Project', 'GitHub'],
        datasets: [{
            label: 'Tasks Completed',
            data: [javaCompleted, leetcodeCompleted, dsaCompleted, sqlCompleted, projectCompleted, githubCompleted],
            backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
            borderRadius: 6,
            barPercentage: 0.6,
        }],
    };

    const statsCards = [
        { label: 'Completion Rate', value: `${completionRate}%`, icon: FaChartPie, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: FaCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Streak', value: `${streak} days`, icon: FaFire, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Days Left', value: `${actualDaysRemaining} days`, icon: FaBullseye, color: 'text-pink-600', bg: 'bg-pink-100' }, // UPDATED TO ACTUAL
    ];

    return (
        <div className="container-fluid p-0 pb-5">
            {/* --- PROFESSIONAL HEADER --- */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="hero-gradient mb-4 p-4 rounded-4 shadow-sm"
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-3">
                        <FaChartBar size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white fw-bold fs-2 mb-0">📊 Progress Analytics</h1>
                        <p className="text-white/80 mb-0 fs-6">Track your learning journey</p>
                    </div>
                </div>
            </motion.div>

            {/* --- STATS CARDS (Light Mode Setup) --- */}
            <div className="row g-4 mb-4">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.1 }} 
                            className="col-6 col-lg-3"
                        >
                            <div className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm hover:shadow-md transition-all duration-300 h-100">
                                <div className="d-flex justify-content-between align-items-center h-100">
                                    <div>
                                        <p className="text-muted small fw-semibold mb-1 text-uppercase tracking-wider">{stat.label}</p>
                                        <h2 className="fw-bold mb-0 text-dark fs-3">{stat.value}</h2>
                                    </div>
                                    <div className={`p-3 rounded-3 ${stat.bg}`}>
                                        <Icon className={`${stat.color} fs-4`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="row g-4 mb-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-6">
                    <div className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm h-100">
                        <h5 className="fw-bold text-dark mb-4 fs-6 d-flex align-items-center gap-2">
                            <FaChartPie className="text-purple-600" /> Overall Completion
                        </h5>
                        <div style={{ height: '250px', position: 'relative' }}>
                            <Pie data={pieData} options={chartOptions} />
                        </div>
                        <div className="text-center mt-3 pt-3 border-top border-light">
                            <p className="text-muted small mb-0">{completedTasks} of {totalTasks} tasks completed</p>
                            {totalTasks === 0 && <p className="text-warning small mt-2 fw-bold">⚠️ Create tasks in Daily Tracker to start tracking!</p>}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-6">
                    <div className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm h-100">
                        <h5 className="fw-bold text-dark mb-4 fs-6 d-flex align-items-center gap-2">
                            <FaChartBar className="text-blue-600" /> Task-wise Completion
                        </h5>
                        <div style={{ height: '250px' }}>
                            <Bar data={barData} options={chartOptions} />
                        </div>
                        {totalTasks === 0 && <p className="text-warning small text-center mt-3 fw-bold">⚠️ No data to display. Create tasks in Daily Tracker!</p>}
                    </div>
                </motion.div>
            </div>

            {/* --- MOTIVATION SECTION --- */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-gradient p-4 rounded-4 shadow-sm text-white">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h2 className="fw-bold fs-3 mb-2">🚀 Keep Going!</h2>
                        <p className="text-white-80 mb-3">You're making great progress! Consistency is key to mastering development skills.</p>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">#CodeEveryday</span>
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">#NeverGiveUp</span>
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">#StayConsistent</span>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <FaRocket size={48} className="text-white opacity-50" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProgressStats;