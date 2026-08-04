import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    FaCalendarAlt, FaCheck, FaPlus, FaSync, 
    FaSave, FaComment, FaBullseye, FaTasks, FaSpinner, FaTrophy, FaTimesCircle, FaEdit
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const DailyTracker = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskNote, setTaskNote] = useState('');
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        if (user && token) fetchTasks();
    }, [user, token]);

    const fetchTasks = async () => {
        setLoading(true); // Refresh ke liye loading set karo
        try {
            const res = await axios.get(`http://localhost:8081/api/tasks/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to refresh tasks');
        } finally {
            setLoading(false);
        }
    };

    const createTaskForDay = async (day) => {
        setCreating(true);
        try {
            const date = new Date(currentYear, currentMonth, day);
            const res = await axios.post(
                `http://localhost:8081/api/tasks/user/${user.id}/day/${day}?date=${date.toISOString().split('T')[0]}`,
                {}, { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setTasks([...tasks, res.data]);
            toast.success(`✅ Tasks created for ${monthNames[currentMonth]} ${day}`);
        } catch (error) {
            toast.error('Failed to create tasks');
        } finally {
            setCreating(false);
        }
    };

    const toggleTask = async (taskId, field) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = { ...task, [field]: !task[field] };
        
        try {
            const res = await axios.put(
                `http://localhost:8081/api/tasks/${taskId}`,
                updatedTask,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setTasks(tasks.map(t => t.id === taskId ? res.data : t));
            
            if (updatedTask[field]) {
                toast.success('🤲 Alhamdulillah! Task done!');
            } else {
                toast.info('Marked as Not Complete');
            }
        } catch (error) {
            toast.error(`❌ ${error.response?.data?.message || 'Update failed'}`);
        }
    };

    const handleDayClick = async (day) => {
        // Pehle selectedDay ko update karo
        setSelectedDay(day);
        const dayTasks = tasks.filter(task => task.day === day);
        if (dayTasks.length === 0 && !creating) {
            await createTaskForDay(day);
        }
    };

    const handleTaskClick = (task, field) => {
        const labels = { javaCompleted: 'Java', leetcodeCompleted: 'LeetCode', dsaCompleted: 'DSA/OOP', sqlCompleted: 'SQL/APIs', projectCompleted: 'Project', githubCompleted: 'GitHub/Portfolio' };
        setSelectedTask({ task, field, label: labels[field] });
        setTaskNote(task.notes || '');
        setIsModalOpen(true);
    };

    const saveNote = async () => {
        if (!selectedTask) return;
        try {
            const updatedTask = { ...selectedTask.task, notes: taskNote };
            const res = await axios.put(`http://localhost:8081/api/tasks/${selectedTask.task.id}`, updatedTask, { headers: { Authorization: `Bearer ${token}` } });
            setTasks(tasks.map(t => t.id === selectedTask.task.id ? res.data : t));
            toast.success('💾 Note saved!');
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    const getDayTasks = (day) => tasks.filter(task => task.day === day);
    const getDayStatus = (day) => {
        const dayTasks = getDayTasks(day);
        if (dayTasks.length === 0) return 'empty';
        const completed = dayTasks.filter(t => t.overallCompleted).length;
        return completed === dayTasks.length ? 'done' : (completed > 0 ? 'partial' : 'started');
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.overallCompleted).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><div className="spinner-border text-primary" /></div>;

    const taskLabels = [
        { key: 'javaCompleted', label: 'Java (1.5h)', icon: '☕' },
        { key: 'leetcodeCompleted', label: 'LeetCode (1+)', icon: '💻' },
        { key: 'dsaCompleted', label: 'DSA/OOP (1h)', icon: '📊' },
        { key: 'sqlCompleted', label: 'SQL/APIs (1h)', icon: '🗄️' },
        { key: 'projectCompleted', label: 'Project (2-3h)', icon: '🚀' },
        { key: 'githubCompleted', label: 'GitHub/Portfolio', icon: '📁' }
    ];

    return (
        <div className="container-fluid p-0 pb-5 bg-light" style={{ minHeight: '100vh', overflowY: 'auto' }}>
            
            {/* Modal */}
            {isModalOpen && selectedTask && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow-lg p-2">
                            <div className="modal-body">
                                <h5 className="fw-bold mb-3">{selectedTask.label} Note</h5>
                                <textarea value={taskNote} onChange={(e) => setTaskNote(e.target.value)} className="form-control border-0 bg-light" rows="4" placeholder="What did you learn today?" />
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button onClick={() => setIsModalOpen(false)} className="btn btn-light rounded-pill px-4">Cancel</button>
                                <button onClick={saveNote} className="btn btn-primary rounded-pill px-4"><FaSave className="me-2" /> Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="hero-gradient mb-4 rounded-4 shadow-sm text-white p-4 d-flex flex-wrap justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-4"><FaCalendarAlt size={24} /></div>
                    <div>
                        <h4 className="fw-bold mb-0 fs-3">📅 {monthNames[currentMonth]} {currentYear}</h4>
                        <div className="d-flex gap-3 text-white-50 small"><span>{currentDay} {monthNames[currentMonth]}</span></div>
                    </div>
                </div>
                <button onClick={fetchTasks} className="btn btn-light rounded-pill px-3 fw-semibold"><FaSync className="me-1" /> Refresh</button>
            </motion.div>

            {/* Progress Bar */}
            <div className="bg-white rounded-4 shadow-sm p-3 mb-4 border border-light">
                <div className="d-flex justify-content-between mb-1"><span className="small fw-semibold text-muted">📊 Overall Progress</span><span className="fw-bold text-primary small">{progressPercent}%</span></div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#e9ecef' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${progressPercent}%`, borderRadius: '10px' }} />
                </div>
            </div>

            {/* Calendar + Tasks Grid */}
            <div className="row g-4">
                
                {/* Calendar */}
                <div className="col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 border border-light">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold mb-0 text-dark fs-6">
                                <FaCalendarAlt className="text-primary me-2" /> Monthly Calendar
                            </h6>
                            <div className="d-flex gap-3 small fw-medium">
                                <span className="d-flex align-items-center gap-1 text-success"><span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#22c55e' }}></span> Completed</span>
                                <span className="d-flex align-items-center gap-1 text-warning"><span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#eab308' }}></span> Partial</span>
                                <span className="d-flex align-items-center gap-1 text-primary"><span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#6366f1' }}></span> Started</span>
                            </div>
                        </div>

                        <div className="row g-0 mb-2 text-center text-muted fw-semibold small">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="col">{d}</div>)}
                        </div>

                        <div className="row g-2">
                            {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="col"></div>)}
                            {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const status = getDayStatus(day);
                                const isToday = day === currentDay;
                                let boxBg = 'bg-white', boxBorder = 'border', textColor = 'text-dark', dotColor = '#d1d5db';
                                if (isToday) { boxBg = 'bg-white'; boxBorder = 'border-2 border-primary'; textColor = 'text-dark fw-bold'; dotColor = '#6366f1'; } 
                                else if (status === 'done') { boxBg = 'bg-white'; dotColor = '#22c55e'; } 
                                else if (status === 'partial') { boxBg = 'bg-white'; dotColor = '#eab308'; } 
                                else if (status === 'started') { boxBg = 'bg-white'; dotColor = '#6366f1'; }
                                return (
                                    <div key={day} className="col">
                                        <button onClick={() => handleDayClick(day)} className={`w-100 btn rounded-3 py-3 d-flex flex-column align-items-center justify-content-center ${boxBg} ${boxBorder}`} style={{ aspectRatio: '1 / 1' }}>
                                            <span className={`fs-5 ${textColor}`}>{day}</span>
                                            <div className="mt-1 rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: dotColor }}></div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tasks & Actions Section */}
                <div className="col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 border border-light" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <h6 className="fw-bold mb-3 text-dark border-bottom pb-2"><FaTasks className="me-2 text-primary" /> {selectedDay ? `Day ${selectedDay} Tasks` : 'Select a Day'}</h6>
                        
                        {selectedDay ? (
                            <div className="flex-grow-1 d-flex flex-column gap-2">
                                {taskLabels.map(({ key, label, icon }) => {
                                    const dayTasks = getDayTasks(selectedDay);
                                    const task = dayTasks && dayTasks.length > 0 ? dayTasks[0] : null;
                                    const isCompleted = task ? task[key] : false;
                                    return (
                                        <div key={key} className={`d-flex justify-content-between align-items-center p-3 rounded-3 border ${isCompleted ? 'border-success bg-success bg-opacity-10' : 'bg-light'}`}>
                                            <div className="d-flex align-items-center gap-2">
                                                <span>{icon}</span>
                                                <span className={`small fw-medium ${isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>{label}</span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                {isCompleted ? (
                                                    <button onClick={() => task && toggleTask(task.id, key)} className="btn btn-outline-danger rounded-pill px-2 py-1 fw-semibold" style={{ fontSize: '11px' }}>
                                                        <FaTimesCircle className="me-1" /> Not Complete
                                                    </button>
                                                ) : (
                                                    <button onClick={() => task && toggleTask(task.id, key)} className="btn btn-success rounded-pill px-3 py-1 fw-semibold" style={{ fontSize: '11px' }}>
                                                        <FaCheck className="me-1" /> Mark Done
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {getDayTasks(selectedDay).length === 0 && !creating && (
                                    <div className="text-center py-5 bg-light rounded-4 border-dashed border-2 border-secondary flex-grow-1 d-flex flex-column justify-content-center">
                                        <p className="text-muted small mb-3 fw-semibold">No tasks created yet.</p>
                                        <button onClick={() => handleDayClick(selectedDay)} className="btn btn-primary rounded-pill px-4 fw-semibold"><FaPlus className="me-2" /> Create Tasks</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 text-muted"><div className="text-center"><FaCalendarAlt size={48} className="text-gray-400 mb-3" /><p className="small fw-semibold text-dark">👆 Click a box on the calendar</p></div></div>
                        )}
                        
                        {/* --- BUTTONS: NOTES & ACHIEVEMENTS --- */}
                        {selectedDay && getDayTasks(selectedDay).length > 0 && (
                            <div className="mt-3 pt-3 border-top border-light d-flex gap-2">
                                <button 
                                    className="btn btn-outline-primary rounded-pill flex-grow-1 fw-semibold py-2 d-flex align-items-center justify-content-center"
                                    style={{ fontSize: '13px' }}
                                    onClick={() => {
                                        const task = getDayTasks(selectedDay)[0];
                                        if(task) {
                                            setSelectedTask({ task, field: 'notes', label: 'Daily Notes' });
                                            setTaskNote(task.notes || '');
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <FaEdit className="me-2" /> Notes
                                </button>
                                <button 
                                    className="btn btn-outline-warning rounded-pill flex-grow-1 fw-semibold py-2 d-flex align-items-center justify-content-center"
                                    style={{ fontSize: '13px' }}
                                    onClick={() => {
                                        const task = getDayTasks(selectedDay)[0];
                                        if(task) {
                                            setSelectedTask({ task, field: 'notes', label: 'Achievements' });
                                            setTaskNote(task.notes || '');
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <FaTrophy className="me-2" /> Achievements
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyTracker;