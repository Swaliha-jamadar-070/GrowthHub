// src/components/DailySummaryModal.js
import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaEdit, FaClipboardList, FaCalendarDay } from 'react-icons/fa';

const DailySummaryModal = ({ isOpen, onClose, day, month, year, tasks, progress, monthName, onEditNote }) => {
    if (!isOpen) return null;

    const dateObj = new Date(year, month, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = new Date().getDate() === day && new Date().getMonth() === month;

    // Task field mapping
    const taskFields = [
        { key: 'javaCompleted', label: '☕ Java (1.5h)' },
        { key: 'leetcodeCompleted', label: '💻 LeetCode (1+)' },
        { key: 'dsaCompleted', label: '📊 DSA/OOP (1h)' },
        { key: 'sqlCompleted', label: '🗄️ SQL/APIs (1h)' },
        { key: 'projectCompleted', label: '🚀 Project (2-3h)' },
        { key: 'githubCompleted', label: '📁 GitHub/Portfolio' }
    ];

    // Get the first task object (all tasks for a day share the same structure)
    const task = tasks.length > 0 ? tasks[0] : null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <motion.div 
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="modal-content rounded-4 shadow-lg"
                >
                    {/* Header */}
                    <div className="modal-header border-0 pb-0">
                        <div>
                            <h5 className="fw-bold mb-1">
                                <FaCalendarDay className="text-primary me-2" />
                                {dayName}, {day} {monthName} {year}
                                {isToday && <span className="badge bg-primary ms-2">Today</span>}
                            </h5>
                            <div className="text-muted small">
                                <FaClipboardList className="me-1" />
                                {progress.completed}/{progress.total} tasks completed • {progress.percent}% done
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-close"></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {/* Progress bar */}
                        <div className="mb-4">
                            <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                                <div 
                                    className={`progress-bar ${progress.percent === 100 ? 'bg-success' : 'bg-primary'}`}
                                    style={{ width: `${progress.percent}%`, borderRadius: '10px' }}
                                />
                            </div>
                        </div>

                        {/* Task list */}
                        {task ? (
                            <div className="list-group list-group-flush">
                                {taskFields.map(({ key, label }) => {
                                    const isDone = task[key];
                                    const hasNote = task.notes && task.notes.trim() !== '';
                                    
                                    return (
                                        <div key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                            <div className="d-flex align-items-center gap-2">
                                                {isDone ? (
                                                    <FaCheck className="text-success" />
                                                ) : (
                                                    <FaTimes className="text-danger" />
                                                )}
                                                <span className={isDone ? 'text-decoration-line-through text-muted' : ''}>
                                                    {label}
                                                </span>
                                                {hasNote && (
                                                    <span className="badge bg-warning bg-opacity-20 text-warning" style={{ fontSize: '9px' }}>
                                                        📝 Note
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => onEditNote({ task, label })}
                                                className="btn btn-sm btn-outline-primary rounded-pill"
                                            >
                                                <FaEdit /> {hasNote ? 'Edit Note' : 'Add Note'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted">
                                <p>No tasks recorded for this day</p>
                            </div>
                        )}

                        {/* All notes for this day */}
                        {task && task.notes && task.notes.trim() !== '' && (
                            <div className="mt-4 p-3 bg-light rounded-4">
                                <h6 className="fw-bold mb-2">
                                    <FaEdit className="text-primary me-2" />
                                    📝 What was learned today
                                </h6>
                                <div className="small text-muted">
                                    {task.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0">
                        <button onClick={onClose} className="btn btn-light rounded-pill px-4">
                            Close
                        </button>
                        <button 
                            onClick={() => {
                                onClose();
                                // This will navigate to the day's tasks
                            }}
                            className="btn btn-primary rounded-pill px-4"
                        >
                            View Full Day
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DailySummaryModal;