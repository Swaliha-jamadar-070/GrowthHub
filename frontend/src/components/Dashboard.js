import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    FaTasks, FaFire, FaBullseye, FaChartLine, 
    FaCalendarCheck, FaRocket, FaCheckCircle, 
    FaCircle, FaArrowRight, FaUserGraduate
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const targetDate = new Date(2026, 10, 30);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

    useEffect(() => {
        console.log("🟡 Dashboard Mounted. User object:", user);
        
        const timeout = setTimeout(() => {
            if (loading) {
                console.warn("⚠️ Timeout reached! Stopping loading spinner.");
                setLoading(false);
            }
        }, 3000);

        if (user && user.id) {
            console.log("✅ User found! Fetching tasks...");
            fetchData();
        } else {
            console.log("⏳ Waiting for user context to load...");
        }

        return () => clearTimeout(timeout);
    }, [user]);

    const fetchData = async () => {
        try {
            // ✅ FIXED: Using Render backend URL
            console.log(`🔗 Connecting to: https://growthhub-10.onrender.com/api/tasks/user/${user.id}`);
            
            const res = await axios.get(`https://growthhub-10.onrender.com/api/tasks/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log("✅ Data received from backend:", res.data);
            setTasks(res.data);
            setLoading(false);
        } catch (error) {
            console.error('❌ Failed to fetch data:', error);
            
            if (error.response) {
                console.log("Status Code:", error.response.status);
                console.log("Error Message:", error.response.data);
                
                if (error.response.status === 403) {
                    console.error("🔴 403 Forbidden Error!");
                }
            } else if (error.request) {
                console.error("🔴 Network Error: Backend is unreachable.");
            }
            
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

    const stats = [
        { label: 'Total Tasks', value: totalTasks, icon: FaTasks, color: 'icon-purple' },
        { label: 'Completed', value: completedTasks, icon: FaCheckCircle, color: 'icon-green' },
        { label: 'Streak', value: `${streak} days`, icon: FaFire, color: 'icon-orange' },
        { label: 'Days Left', value: `${daysRemaining}`, icon: FaBullseye, color: 'icon-pink' },
    ];

    const weekTasks = tasks.filter(t => t.day >= 25 && t.day <= 31);
    const weekCompleted = weekTasks.filter(t => t.overallCompleted === true).length;
    const weekProgress = weekTasks.length > 0 ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    return (
        <div className="container-fluid p-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hero-gradient mb-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="text-white fw-bold" style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>
                            👋 Welcome back, {user?.fullName?.split(' ')[0] || user?.username}!
                        </h1>
                        <p className="text-white/80 fs-5 fw-normal mb-3">
                            Build. Learn. Improve every single day. 🎉
                        </p>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-white/20 text-white px-3 py-2 rounded-pill">
                                <FaFire className="me-1" /> {streak} Day Streak
                            </span>
                            <span className="badge bg-white/20 text-white px-3 py-2 rounded-pill">
                                <FaBullseye className="me-1" /> {completionRate}% Complete
                            </span>
                            <span className="badge bg-white/20 text-white px-3 py-2 rounded-pill">
                                <FaCalendarCheck className="me-1" /> {daysRemaining} Days Left
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <div className="bg-white/20 px-4 py-3 rounded-4 text-center d-inline-block">
                            <div className="text-white fw-bold" style={{ fontSize: '32px' }}>{completionRate}%</div>
                            <div className="text-white/70 small">Progress</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="row g-4 mb-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="col-6 col-lg-3">
                            <div className="premium-card">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted small fw-medium mb-1">{stat.label}</p>
                                        <h2 className="fw-bold mb-0" style={{ fontSize: '28px' }}>{stat.value}</h2>
                                    </div>
                                    <div className={`icon-wrapper ${stat.color}`}><Icon /></div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="row g-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-6">
                    <div className="premium-card">
                        <h5 className="fw-semibold mb-4">📊 This Week's Progress</h5>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between small mb-1">
                                <span className="text-muted">Week Progress</span>
                                <span className="fw-bold">{weekProgress}%</span>
                            </div>
                            <div className="progress progress-custom">
                                <div className="progress-bar" style={{ width: `${weekProgress}%` }} />
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="bg-light rounded-4 p-3 text-center">
                                    <h4 className="fw-bold text-primary mb-0">{weekCompleted}</h4>
                                    <small className="text-muted">Tasks Done</small>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="bg-light rounded-4 p-3 text-center">
                                    <h4 className="fw-bold text-purple mb-0">{weekTasks.length}</h4>
                                    <small className="text-muted">Total Tasks</small>
                                </div>
                            </div>
                        </div>
                        <div className="bg-light rounded-4 p-3 text-center mt-3">
                            <p className="text-muted small mb-0">Days Remaining</p>
                            <p className="fw-bold text-orange mb-0" style={{ fontSize: '20px' }}>{daysRemaining} days</p>
                            <small className="text-muted">Until November 30, 2026</small>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-lg-6">
                    <div className="premium-card">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-semibold mb-0">✅ Today's Tasks</h5>
                            <span className="badge bg-light text-dark rounded-pill px-3 py-2">
                                {tasks.filter(t => t.day === new Date().getDate()).length} tasks
                            </span>
                        </div>
                        {tasks.filter(t => t.day === new Date().getDate()).length > 0 ? (
                            <div>
                                {tasks.filter(t => t.day === new Date().getDate()).slice(0, 5).map((task, idx) => {
                                    const labels = ['Java', 'LeetCode', 'DSA', 'SQL', 'Project', 'GitHub'];
                                    const statuses = [task.javaCompleted, task.leetcodeCompleted, task.dsaCompleted, task.sqlCompleted, task.projectCompleted, task.githubCompleted];
                                    return (
                                        <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3 bg-light mb-1">
                                            {statuses[idx] ? <FaCheckCircle className="text-success" size={18} /> : <FaCircle className="text-muted" size={18} />}
                                            <span className={`small ${statuses[idx] ? 'text-muted text-decoration-line-through' : ''}`}>{labels[idx]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">
                                <p className="small mb-1">📝 No tasks for today</p>
                                <p className="small">Click on a day in the tracker to start</p>
                                <button onClick={() => window.location.href = '/tracker'} className="btn btn-primary btn-sm rounded-pill px-4 mt-2">+ Add Task</button>
                            </div>
                        )}
                        <button onClick={() => window.location.href = '/tracker'} className="btn btn-link text-primary text-decoration-none mt-2 p-0">
                            View all tasks <FaArrowRight className="ms-1" size={12} />
                        </button>
                    </div>
                </motion.div>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-md-4">
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none' }}>
                        <FaRocket size={24} className="mb-2" />
                        <h6 className="fw-semibold">📝 Log Today</h6>
                        <p className="small opacity-75">Track your daily progress</p>
                        <button onClick={() => window.location.href = '/tracker'} className="btn btn-light btn-sm rounded-pill px-4">Go to Tracker →</button>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #EC4899, #F472B6)', color: 'white', border: 'none' }}>
                        <FaUserGraduate size={24} className="mb-2" />
                        <h6 className="fw-semibold">📚 Roadmap</h6>
                        <p className="small opacity-75">View your 4-month plan</p>
                        <button onClick={() => window.location.href = '/weekly-focus'} className="btn btn-light btn-sm rounded-pill px-4">View Roadmap →</button>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #059669, #34D399)', color: 'white', border: 'none' }}>
                        <FaChartLine size={24} className="mb-2" />
                        <h6 className="fw-semibold">📊 Analytics</h6>
                        <p className="small opacity-75">Detailed progress stats</p>
                        <button onClick={() => window.location.href = '/progress'} className="btn btn-light btn-sm rounded-pill px-4">View Analytics →</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;