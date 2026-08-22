// src/components/DailyTracker.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    FaCalendarAlt, FaCheck, FaPlus, FaSync, 
    FaSave, FaEdit, FaBullseye, FaTasks, 
    FaTrophy, FaTimesCircle, FaBook, 
    FaClipboardList, FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import custom components
import TaskItem from './TaskItem';
import DailySummaryModal from './DailySummaryModal';
import QuickRevision from './QuickRevision';

const DailyTracker = () => {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    
    // Modal states
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskNote, setTaskNote] = useState('');
    const [selectedDateForSummary, setSelectedDateForSummary] = useState(null);
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    // Fetch tasks on load
    useEffect(() => {
        if (user && token) fetchTasks();
    }, [user, token]);

    const fetchTasks = async () => {
        setLoading(true);
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

    // Create tasks for a specific day
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

    // Toggle task with better feedback
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
                toast.success('🎉 Alhamdulillah! Task completed!');
            } else {
                toast.info('⏳ Marked as incomplete');
            }
        } catch (error) {
            toast.error(`❌ ${error.response?.data?.message || 'Update failed'}`);
        }
    };

    // Handle day click with summary view
    const handleDayClick = async (day) => {
        setSelectedDay(day);
        const dayTasks = tasks.filter(task => task.day === day);
        
        if (dayTasks.length === 0 && !creating) {
            await createTaskForDay(day);
        }
        
        if (day !== currentDay) {
            setSelectedDateForSummary(day);
            setIsSummaryModalOpen(true);
        }
    };

    // Save note for a task
    const saveNote = async () => {
        if (!selectedTask) return;
        try {
            const updatedTask = { ...selectedTask.task, notes: taskNote };
            const res = await axios.put(
                `http://localhost:8081/api/tasks/${selectedTask.task.id}`,
                updatedTask,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.map(t => t.id === selectedTask.task.id ? res.data : t));
            toast.success('💾 Notes saved successfully!');
            setIsNoteModalOpen(false);
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    // Get tasks for a specific day with notes
    const getDayTasksWithNotes = (day) => {
        return tasks.filter(task => task.day === day);
    };

    // Get all notes for quick revision
    const getAllNotes = () => {
        return tasks
            .filter(task => task.notes && task.notes.trim() !== '')
            .map(task => ({
                date: task.day,
                note: task.notes,
                completed: task.overallCompleted,
                taskName: getTaskName(task)
            }))
            .sort((a, b) => b.date - a.date);
    };

    // Helper to get task name
    const getTaskName = (task) => {
        const labels = {
            javaCompleted: 'Java',
            leetcodeCompleted: 'LeetCode',
            dsaCompleted: 'DSA/OOP',
            sqlCompleted: 'SQL/APIs',
            projectCompleted: 'Project',
            githubCompleted: 'GitHub/Portfolio'
        };
        for (let key of Object.keys(labels)) {
            if (task[key] !== undefined) return labels[key];
        }
        return 'Task';
    };

    // Get completion status for a day
    const getDayStatus = (day) => {
        const dayTasks = tasks.filter(task => task.day === day);
        if (dayTasks.length === 0) return 'empty';
        const completed = dayTasks.filter(t => t.overallCompleted).length;
        return completed === dayTasks.length ? 'done' : (completed > 0 ? 'partial' : 'started');
    };

    // Calculate daily progress
    const getDailyProgress = (day) => {
        const dayTasks = tasks.filter(task => task.day === day);
        if (dayTasks.length === 0) return { completed: 0, total: 0, percent: 0 };
        const completed = dayTasks.filter(t => t.overallCompleted).length;
        return {
            completed,
            total: dayTasks.length,
            percent: Math.round((completed / dayTasks.length) * 100)
        };
    };

    // Overall progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.overallCompleted).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
            <div className="spinner-border text-primary" />
        </div>
    );

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
            
            {/* ===== MODALS ===== */}
            
            {/* Note Modal */}
            <AnimatePresence>
                {isNoteModalOpen && selectedTask && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal show d-block" 
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                        onClick={() => setIsNoteModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="modal-dialog modal-dialog-centered"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-content rounded-4 shadow-lg p-2">
                                <div className="modal-body">
                                    <h5 className="fw-bold mb-3">
                                        <FaEdit className="text-primary me-2" />
                                        {selectedTask.label} - Notes
                                    </h5>
                                    <textarea 
                                        value={taskNote} 
                                        onChange={(e) => setTaskNote(e.target.value)} 
                                        className="form-control border-0 bg-light" 
                                        rows="4" 
                                        placeholder="What did you learn today? Write your key takeaways..."
                                        style={{ resize: 'none' }}
                                    />
                                    <div className="mt-2 text-muted small">
                                        💡 Tip: Write what you understood, not what you did
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button 
                                        onClick={() => setIsNoteModalOpen(false)} 
                                        className="btn btn-light rounded-pill px-4"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={saveNote} 
                                        className="btn btn-primary rounded-pill px-4"
                                    >
                                        <FaSave className="me-2" /> Save Note
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daily Summary Modal */}
            <AnimatePresence>
                {isSummaryModalOpen && selectedDateForSummary && (
                    <DailySummaryModal
                        isOpen={isSummaryModalOpen}
                        onClose={() => setIsSummaryModalOpen(false)}
                        day={selectedDateForSummary}
                        month={currentMonth}
                        year={currentYear}
                        tasks={getDayTasksWithNotes(selectedDateForSummary)}
                        progress={getDailyProgress(selectedDateForSummary)}
                        monthName={monthNames[currentMonth]}
                        onEditNote={(task) => {
                            setSelectedTask(task);
                            setTaskNote(task.notes || '');
                            setIsNoteModalOpen(true);
                            setIsSummaryModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Quick Revision Modal */}
            <AnimatePresence>
                {isRevisionModalOpen && (
                    <QuickRevision
                        isOpen={isRevisionModalOpen}
                        onClose={() => setIsRevisionModalOpen(false)}
                        notes={getAllNotes()}
                        monthName={monthNames[currentMonth]}
                    />
                )}
            </AnimatePresence>

            {/* ===== HEADER ===== */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="hero-gradient mb-4 rounded-4 shadow-sm text-white p-4 d-flex flex-wrap justify-content-between align-items-center"
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-4">
                        <FaCalendarAlt size={24} />
                    </div>
                    <div>
                        <h4 className="fw-bold mb-0 fs-3">📅 {monthNames[currentMonth]} {currentYear}</h4>
                        <div className="d-flex gap-3 text-white-50 small">
                            <span>{currentDay} {monthNames[currentMonth]}</span>
                            <span>•</span>
                            <span>{completedTasks}/{totalTasks} tasks done</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        onClick={() => setIsRevisionModalOpen(true)} 
                        className="btn btn-light rounded-pill px-3 fw-semibold"
                    >
                        <FaBook className="me-1" /> Revision
                    </button>
                    <button 
                        onClick={fetchTasks} 
                        className="btn btn-light rounded-pill px-3 fw-semibold"
                    >
                        <FaSync className="me-1" /> Refresh
                    </button>
                </div>
            </motion.div>

            {/* ===== PROGRESS BAR ===== */}
            <div className="bg-white rounded-4 shadow-sm p-3 mb-4 border border-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold text-muted">
                        <FaBullseye className="text-primary me-1" /> Overall Progress
                    </span>
                    <span className="fw-bold text-primary small">{progressPercent}%</span>
                </div>
                <div className="progress" style={{ height: '8px', borderRadius: '10px', background: '#e9ecef' }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className="progress-bar bg-primary" 
                        style={{ borderRadius: '10px' }}
                    />
                </div>
                <div className="d-flex justify-content-between mt-1">
                    <span className="text-success small">✅ {completedTasks} done</span>
                    <span className="text-danger small">❌ {totalTasks - completedTasks} pending</span>
                </div>
            </div>

            {/* ===== CALENDAR + TASKS GRID ===== */}
            <div className="row g-4">
                
                {/* Calendar */}
                <div className="col-lg-8">
                    <div className="bg-white rounded-4 shadow-sm p-4 border border-light">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="fw-bold mb-0 text-dark fs-6">
                                <FaCalendarAlt className="text-primary me-2" /> Monthly Calendar
                            </h6>
                            <div className="d-flex gap-3 small fw-medium">
                                <span className="d-flex align-items-center gap-1 text-success">
                                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#22c55e' }}></span> Done
                                </span>
                                <span className="d-flex align-items-center gap-1 text-warning">
                                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#eab308' }}></span> Partial
                                </span>
                                <span className="d-flex align-items-center gap-1 text-primary">
                                    <span className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#6366f1' }}></span> Started
                                </span>
                            </div>
                        </div>

                        {/* Week headers */}
                        <div className="row g-0 mb-2 text-center text-muted fw-semibold small">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="col">{d}</div>
                            ))}
                        </div>

                        {/* Calendar days */}
                        <div className="row g-2">
                            {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="col"></div>
                            ))}
                            {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                                const day = i + 1;
                                const status = getDayStatus(day);
                                const isToday = day === currentDay;
                                const hasNotes = tasks.some(t => t.day === day && t.notes && t.notes.trim() !== '');
                                
                                let boxClass = 'btn rounded-3 py-3 d-flex flex-column align-items-center justify-content-center w-100';
                                let bgColor = 'bg-white';
                                let borderClass = 'border';
                                let textClass = 'text-dark';
                                let dotColor = '#d1d5db';
                                
                                if (isToday) {
                                    borderClass = 'border-2 border-primary';
                                    textClass = 'text-dark fw-bold';
                                    dotColor = '#6366f1';
                                    bgColor = 'bg-primary bg-opacity-10';
                                } else if (status === 'done') {
                                    dotColor = '#22c55e';
                                    bgColor = 'bg-success bg-opacity-10';
                                } else if (status === 'partial') {
                                    dotColor = '#eab308';
                                    bgColor = 'bg-warning bg-opacity-10';
                                } else if (status === 'started') {
                                    dotColor = '#6366f1';
                                    bgColor = 'bg-primary bg-opacity-10';
                                }

                                return (
                                    <div key={day} className="col">
                                        <button 
                                            onClick={() => handleDayClick(day)} 
                                            className={`${boxClass} ${bgColor} ${borderClass}`}
                                            style={{ aspectRatio: '1 / 1', position: 'relative' }}
                                        >
                                            <span className={`fs-5 ${textClass}`}>{day}</span>
                                            <div className="mt-1 rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: dotColor }}></div>
                                            {hasNotes && (
                                                <FaStar className="text-warning" style={{ position: 'absolute', top: '4px', right: '4px', fontSize: '10px' }} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="col-lg-4">
                    <div className="bg-white rounded-4 shadow-sm p-4 border border-light" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">
                            <FaTasks className="me-2 text-primary" /> 
                            {selectedDay ? `Day ${selectedDay} Tasks` : 'Select a Day'}
                            {selectedDay && (
                                <span className="ms-2 badge bg-light text-dark">
                                    {getDailyProgress(selectedDay).percent}%
                                </span>
                            )}
                        </h6>
                        
                        {selectedDay ? (
                            <div className="flex-grow-1 d-flex flex-column gap-2">
                                {taskLabels.map(({ key, label, icon }) => {
                                    const dayTasks = tasks.filter(task => task.day === selectedDay);
                                    const task = dayTasks.length > 0 ? dayTasks[0] : null;
                                    const isCompleted = task ? task[key] : false;
                                    const hasNote = task && task.notes && task.notes.trim() !== '';
                                    
                                    return (
                                        <TaskItem
                                            key={key}
                                            icon={icon}
                                            label={label}
                                            isCompleted={isCompleted}
                                            hasNote={hasNote}
                                            onToggle={() => task && toggleTask(task.id, key)}
                                            onAddNote={() => {
                                                if (task) {
                                                    setSelectedTask({ task, label });
                                                    setTaskNote(task.notes || '');
                                                    setIsNoteModalOpen(true);
                                                }
                                            }}
                                        />
                                    );
                                })}
                                
                                {getDayTasksWithNotes(selectedDay).length === 0 && !creating && (
                                    <div className="text-center py-5 bg-light rounded-4 border-dashed border-2 border-secondary flex-grow-1 d-flex flex-column justify-content-center">
                                        <p className="text-muted small mb-3 fw-semibold">No tasks created yet.</p>
                                        <button 
                                            onClick={() => handleDayClick(selectedDay)} 
                                            className="btn btn-primary rounded-pill px-4 fw-semibold"
                                        >
                                            <FaPlus className="me-2" /> Create Tasks
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5 text-muted">
                                <div className="text-center">
                                    <FaCalendarAlt size={48} className="text-gray-400 mb-3" />
                                    <p className="small fw-semibold text-dark">👆 Click a date on the calendar</p>
                                    <p className="text-muted small">View your daily tasks and progress</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Quick Actions */}
                        {selectedDay && getDayTasksWithNotes(selectedDay).length > 0 && (
                            <div className="mt-3 pt-3 border-top border-light d-flex gap-2">
                                <button 
                                    className="btn btn-outline-primary rounded-pill flex-grow-1 fw-semibold py-2 d-flex align-items-center justify-content-center"
                                    style={{ fontSize: '13px' }}
                                    onClick={() => {
                                        const task = tasks.find(t => t.day === selectedDay);
                                        if(task) {
                                            setSelectedTask({ task, label: 'Daily Notes' });
                                            setTaskNote(task.notes || '');
                                            setIsNoteModalOpen(true);
                                        }
                                    }}
                                >
                                    <FaEdit className="me-2" /> Add Notes
                                </button>
                                <button 
                                    className="btn btn-outline-success rounded-pill flex-grow-1 fw-semibold py-2 d-flex align-items-center justify-content-center"
                                    style={{ fontSize: '13px' }}
                                    onClick={() => {
                                        const dayTasks = tasks.filter(t => t.day === selectedDay);
                                        const allDone = dayTasks.every(t => t.overallCompleted);
                                        if (!allDone) {
                                            dayTasks.forEach(t => {
                                                const fields = ['javaCompleted', 'leetcodeCompleted', 'dsaCompleted', 'sqlCompleted', 'projectCompleted', 'githubCompleted'];
                                                fields.forEach(field => {
                                                    if (!t[field]) toggleTask(t.id, field);
                                                });
                                            });
                                            toast.success('🎯 All tasks marked complete!');
                                        } else {
                                            toast.info('All tasks already completed!');
                                        }
                                    }}
                                >
                                    <FaTrophy className="me-2" /> Mark All Done
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