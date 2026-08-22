// src/components/ProgressStats.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
    FaChartPie, FaChartBar, FaRocket, FaCheckCircle, 
    FaFire, FaBullseye, FaCalendarAlt, FaStar, 
    FaTrophy, FaClock, FaSpinner 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ProgressStats = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Target Date: November 30, 2026
    const targetDate = new Date(2026, 10, 30);
    const today = new Date();
    const actualDaysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

    // Fetch tasks on component mount
    useEffect(() => {
        if (user && token) {
            fetchData();
        }
    }, [user, token]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:8081/api/tasks/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data || []);
        } catch (error) {
            console.error('❌ Failed to fetch tasks:', error);
            setError('Failed to load progress data. Please refresh.');
            toast.error('Failed to load progress data');
        } finally {
            setLoading(false);
        }
    };

    // ========== CALCULATIONS ==========
    
    // Overall stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.overallCompleted === true).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task-wise completion
    const javaCompleted = tasks.filter(t => t.javaCompleted === true).length;
    const leetcodeCompleted = tasks.filter(t => t.leetcodeCompleted === true).length;
    const dsaCompleted = tasks.filter(t => t.dsaCompleted === true).length;
    const sqlCompleted = tasks.filter(t => t.sqlCompleted === true).length;
    const projectCompleted = tasks.filter(t => t.projectCompleted === true).length;
    const githubCompleted = tasks.filter(t => t.githubCompleted === true).length;

    // Calculate streak (consecutive days with all tasks completed)
    const calculateStreak = () => {
        let streak = 0;
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Check from today going backwards
        for (let i = 0; i < 60; i++) {
            const checkDate = new Date(currentYear, currentMonth, currentDay - i);
            const day = checkDate.getDate();
            
            // Only check days in the current month (simplified)
            if (checkDate.getMonth() !== currentMonth) {
                // If we go to previous month, stop (simplified streak)
                break;
            }
            
            const dayTasks = tasks.filter(t => t.day === day);
            
            // If no tasks for this day, streak breaks
            if (dayTasks.length === 0) {
                break;
            }
            
            // Check if all tasks for this day are completed
            const allDone = dayTasks.every(t => t.overallCompleted === true);
            
            if (allDone) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    };

    const streak = calculateStreak();

    // Calculate total hours spent (based on task durations)
    const calculateTotalHours = () => {
        let totalMinutes = 0;
        tasks.forEach(task => {
            if (task.javaCompleted) totalMinutes += 90; // 1.5h
            if (task.leetcodeCompleted) totalMinutes += 60; // 1h
            if (task.dsaCompleted) totalMinutes += 60; // 1h
            if (task.sqlCompleted) totalMinutes += 60; // 1h
            if (task.projectCompleted) totalMinutes += 150; // 2.5h
            if (task.githubCompleted) totalMinutes += 30; // 0.5h
        });
        return Math.round(totalMinutes / 60);
    };

    const totalHours = calculateTotalHours();

    // Get unique active days
    const activeDays = new Set(tasks.map(t => t.day)).size;

    // Get task distribution for pie chart
    const getTaskDistribution = () => {
        const total = completedTasks + (totalTasks - completedTasks);
        if (total === 0) return [0, 1]; // Empty state
        
        return [
            completedTasks,
            Math.max(0, totalTasks - completedTasks)
        ];
    };

    const taskDistribution = getTaskDistribution();

    // ========== CHART DATA ==========

    // Pie Chart Data
    const pieData = {
        labels: ['Completed ✅', 'Remaining ⏳'],
        datasets: [{
            data: taskDistribution,
            backgroundColor: ['#8b5cf6', '#e5e7eb'],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    // Bar Chart Data
    const barData = {
        labels: ['☕ Java', '💻 LeetCode', '📊 DSA/OOP', '🗄️ SQL/API', '🚀 Project', '📁 GitHub'],
        datasets: [{
            label: 'Tasks Completed',
            data: [javaCompleted, leetcodeCompleted, dsaCompleted, sqlCompleted, projectCompleted, githubCompleted],
            backgroundColor: [
                'rgba(139, 92, 246, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(6, 182, 212, 0.8)'
            ],
            borderColor: [
                '#8b5cf6',
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ec4899',
                '#06b6d4'
            ],
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.6,
        }],
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#6b7280',
                    font: { 
                        family: 'Inter, system-ui, sans-serif', 
                        size: 12, 
                        weight: '500' 
                    },
                    boxWidth: 12,
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#111827',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.parsed || context.data;
                        if (context.datasetIndex === 0) {
                            const total = taskDistribution[0] + taskDistribution[1];
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { 
                    color: 'rgba(243, 244, 246, 0.8)',
                    drawBorder: false,
                },
                ticks: { 
                    color: '#6b7280',
                    font: { size: 11 },
                    stepSize: 1,
                },
            },
            x: {
                grid: { display: false },
                ticks: { 
                    color: '#6b7280',
                    font: { size: 11 },
                },
            },
        },
    };

    // Bar chart specific options (no legend)
    const barChartOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            legend: {
                display: false,
            },
        },
    };

    // ========== STATS CARDS DATA ==========

    const statsCards = [
        { 
            label: 'Completion Rate', 
            value: `${completionRate}%`, 
            icon: FaChartPie, 
            color: '#8b5cf6', 
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            description: `${completedTasks}/${totalTasks} tasks done`
        },
        { 
            label: 'Tasks Completed', 
            value: `${completedTasks}/${totalTasks}`, 
            icon: FaCheckCircle, 
            color: '#3b82f6', 
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            description: `${totalTasks - completedTasks} remaining`
        },
        { 
            label: 'Current Streak', 
            value: `${streak} day${streak !== 1 ? 's' : ''}`, 
            icon: FaFire, 
            color: '#f97316', 
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            description: streak === 0 ? 'Start your streak today!' : 'Keep going! 🔥'
        },
        { 
            label: 'Active Days', 
            value: `${activeDays}`, 
            icon: FaCalendarAlt, 
            color: '#10b981', 
            bg: 'bg-green-50',
            border: 'border-green-200',
            description: 'Days you\'ve tracked'
        },
        { 
            label: 'Days Left', 
            value: `${actualDaysRemaining}`, 
            icon: FaBullseye, 
            color: '#ec4899', 
            bg: 'bg-pink-50',
            border: 'border-pink-200',
            description: actualDaysRemaining === 0 ? '🎯 Target Day!' : 'Until Nov 30, 2026'
        },
        { 
            label: 'Total Hours', 
            value: `${totalHours}h`, 
            icon: FaClock, 
            color: '#8b5cf6', 
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            description: 'Estimated study time'
        },
    ];

    // ========== RENDER ==========

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
                    <h5 className="alert-heading">⚠️ Error Loading Data</h5>
                    <p>{error}</p>
                    <button onClick={fetchData} className="btn btn-primary rounded-pill">
                        <FaSpinner className="me-2" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0 pb-5">
            
            {/* ===== HEADER ===== */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="hero-gradient mb-4 p-4 rounded-4 shadow-sm"
                style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)'
                }}
            >
                <div className="d-flex flex-wrap align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-3 rounded-3">
                            <FaChartBar size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-white fw-bold fs-2 mb-0">📊 Progress Analytics</h1>
                            <p className="text-white-80 mb-0 opacity-75">
                                Track your learning journey • {activeDays} active days
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={fetchData}
                        className="btn btn-light rounded-pill px-4 py-2 fw-semibold shadow-sm mt-2 mt-md-0"
                    >
                        <FaSpinner className="me-2" /> Refresh Data
                    </button>
                </div>
            </motion.div>

            {/* ===== STATS CARDS ===== */}
            <div className="row g-3 mb-4">
                {statsCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: index * 0.05 }} 
                            className="col-6 col-lg-4 col-xl-2"
                        >
                            <div 
                                className={`bg-white border ${stat.border} rounded-4 p-3 shadow-sm hover:shadow-md transition-all duration-300 h-100`}
                                style={{ cursor: 'default' }}
                            >
                                <div className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <p className="text-muted small fw-semibold mb-0 text-uppercase tracking-wider" style={{ fontSize: '10px' }}>
                                            {stat.label}
                                        </p>
                                        <div className={`p-2 rounded-3 ${stat.bg}`}>
                                            <Icon style={{ color: stat.color, fontSize: '16px' }} />
                                        </div>
                                    </div>
                                    <h3 className="fw-bold mb-0 text-dark fs-2">{stat.value}</h3>
                                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ===== CHARTS SECTION ===== */}
            <div className="row g-4 mb-4">
                
                {/* Pie Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="col-lg-6"
                >
                    <div className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm h-100">
                        <h5 className="fw-bold text-dark mb-4 fs-6 d-flex align-items-center gap-2">
                            <FaChartPie style={{ color: '#8b5cf6' }} /> Overall Completion
                            {totalTasks > 0 && (
                                <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                    {completionRate}%
                                </span>
                            )}
                        </h5>
                        <div style={{ height: '280px', position: 'relative' }}>
                            {totalTasks > 0 ? (
                                <Pie data={pieData} options={chartOptions} />
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <FaChartPie size={48} className="text-muted opacity-25 mb-3" />
                                    <p className="text-muted">No tasks created yet</p>
                                    <p className="text-muted small">Start tracking in Daily Tracker</p>
                                </div>
                            )}
                        </div>
                        {totalTasks > 0 && (
                            <div className="text-center mt-3 pt-3 border-top border-light">
                                <p className="text-muted small mb-0">
                                    {completedTasks} of {totalTasks} tasks completed
                                    {completionRate === 100 && ' 🎉 Perfect!'}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Bar Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="col-lg-6"
                >
                    <div className="bg-white border border-gray-200 rounded-4 p-4 shadow-sm h-100">
                        <h5 className="fw-bold text-dark mb-4 fs-6 d-flex align-items-center gap-2">
                            <FaChartBar style={{ color: '#3b82f6' }} /> Task-wise Completion
                        </h5>
                        <div style={{ height: '280px' }}>
                            {totalTasks > 0 ? (
                                <Bar data={barData} options={barChartOptions} />
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                    <FaChartBar size={48} className="text-muted opacity-25 mb-3" />
                                    <p className="text-muted">No data to display</p>
                                    <p className="text-muted small">Complete tasks to see progress</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ===== MOTIVATION SECTION ===== */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-4 rounded-4 shadow-sm text-white"
                style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'
                }}
            >
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h2 className="fw-bold fs-3 mb-2">
                            {completionRate >= 80 ? '🌟 Amazing Progress!' :
                             completionRate >= 50 ? '💪 Keep Going!' :
                             completionRate >= 20 ? '📈 Great Start!' :
                             '🚀 Let\'s Get Started!'}
                        </h2>
                        <p className="text-white-80 mb-3 opacity-90">
                            {completionRate >= 80 
                                ? `You're on fire! ${streak} day streak and ${completionRate}% complete. Keep crushing it! 🔥`
                                : completionRate >= 50
                                ? `You're making excellent progress! ${completionRate}% complete. Stay consistent! 💪`
                                : completionRate >= 20
                                ? `Great foundation built! ${completionRate}% complete. Keep the momentum going! 📈`
                                : `Start your journey today! Every expert was once a beginner. 🚀`
                            }
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">
                                {streak > 0 ? `🔥 ${streak} Day Streak` : '🌟 Start Your Streak'}
                            </span>
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">
                                {totalTasks > 0 ? `${completedTasks}/${totalTasks} Tasks Done` : '⚡ Ready to Start'}
                            </span>
                            <span className="badge bg-white text-dark bg-opacity-20 px-3 py-2 rounded-pill">
                                {actualDaysRemaining > 0 ? `📅 ${actualDaysRemaining} Days to Go` : '🎯 Target Reached!'}
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        {completionRate >= 80 ? (
                            <FaTrophy size={56} className="text-white opacity-75" />
                        ) : (
                            <FaRocket size={56} className="text-white opacity-50" />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ===== QUICK TIPS ===== */}
            {totalTasks === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-info bg-opacity-10 border border-info rounded-4"
                >
                    <h6 className="fw-bold text-info mb-2">💡 Quick Start Guide</h6>
                    <ol className="text-muted small mb-0 ps-3">
                        <li>Go to <strong>Daily Tracker</strong> and click on today's date</li>
                        <li>Click <strong>"Create Tasks"</strong> to generate your daily tasks</li>
                        <li>Mark tasks as <strong>"Done"</strong> as you complete them</li>
                        <li>Add <strong>notes</strong> to remember what you learned</li>
                        <li>Check back here to see your progress grow! 📈</li>
                    </ol>
                </motion.div>
            )}

            {/* ===== STREAK CELEBRATION ===== */}
            {streak >= 7 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded-4 text-center"
                >
                    <h6 className="fw-bold text-warning mb-0">
                        🎉 {streak} Day Streak! You're unstoppable! Keep going! 🔥
                    </h6>
                </motion.div>
            )}
        </div>
    );
};

export default ProgressStats;