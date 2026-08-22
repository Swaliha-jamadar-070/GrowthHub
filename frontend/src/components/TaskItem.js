// src/components/TaskItem.js
import React from 'react';
import { FaCheck, FaTimesCircle, FaEdit, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const TaskItem = ({ icon, label, isCompleted, hasNote, onToggle, onAddNote }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`d-flex justify-content-between align-items-center p-3 rounded-3 border ${
                isCompleted ? 'border-success bg-success bg-opacity-10' : 'bg-light'
            }`}
        >
            <div className="d-flex align-items-center gap-2">
                <span>{icon}</span>
                <span className={`small fw-medium ${isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                    {label}
                </span>
                {hasNote && <FaStar className="text-warning" size={10} />}
            </div>
            <div className="d-flex gap-2">
                {isCompleted ? (
                    <button 
                        onClick={onToggle} 
                        className="btn btn-outline-danger rounded-pill px-2 py-1 fw-semibold"
                        style={{ fontSize: '11px' }}
                    >
                        <FaTimesCircle className="me-1" /> Undo
                    </button>
                ) : (
                    <button 
                        onClick={onToggle} 
                        className="btn btn-success rounded-pill px-3 py-1 fw-semibold"
                        style={{ fontSize: '11px' }}
                    >
                        <FaCheck className="me-1" /> Done
                    </button>
                )}
                <button 
                    onClick={onAddNote}
                    className="btn btn-outline-secondary rounded-pill px-2 py-1"
                    style={{ fontSize: '11px' }}
                >
                    <FaEdit />
                </button>
            </div>
        </motion.div>
    );
};

export default TaskItem;