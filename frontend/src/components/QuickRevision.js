// src/components/QuickRevision.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaTimes, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const QuickRevision = ({ isOpen, onClose, notes, monthName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, completed, pending

    if (!isOpen) return null;

    const filteredNotes = notes
        .filter(note => {
            const matchesSearch = note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 note.taskName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || 
                                 (filter === 'completed' && note.completed) ||
                                 (filter === 'pending' && !note.completed);
            return matchesSearch && matchesFilter;
        });

    // Group by date
    const groupedNotes = filteredNotes.reduce((acc, note) => {
        if (!acc[note.date]) acc[note.date] = [];
        acc[note.date].push(note);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedNotes).sort((a, b) => b - a);

    // Get date string
    const getDateString = (dateNum) => {
        const dateObj = new Date(2026, 7, dateNum);
        return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <motion.div 
                    initial={{ scale: 0.9, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="modal-content rounded-4 shadow-lg"
                    style={{ maxHeight: '90vh' }}
                >
                    {/* Header */}
                    <div className="modal-header border-0">
                        <h5 className="fw-bold mb-0">
                            <FaBook className="text-primary me-2" />
                            Quick Revision - All Notes
                        </h5>
                        <button onClick={onClose} className="btn-close"></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ overflowY: 'auto' }}>
                        {/* Search & Filter */}
                        <div className="d-flex gap-2 mb-4">
                            <div className="position-relative flex-grow-1">
                                <FaSearch className="position-absolute text-muted" style={{ top: '12px', left: '12px' }} />
                                <input
                                    type="text"
                                    className="form-control rounded-pill ps-5"
                                    placeholder="Search notes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="form-select rounded-pill w-auto"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="completed">✅ Completed</option>
                                <option value="pending">❌ Pending</option>
                            </select>
                        </div>

                        {/* Statistics */}
                        <div className="d-flex gap-4 mb-4 small text-muted">
                            <span>📝 Total Notes: {notes.length}</span>
                            <span>✅ Completed: {notes.filter(n => n.completed).length}</span>
                            <span>⏳ Pending: {notes.filter(n => !n.completed).length}</span>
                        </div>

                        {/* Notes by Date */}
                        {sortedDates.length > 0 ? (
                            sortedDates.map(date => (
                                <div key={date} className="mb-4">
                                    <h6 className="fw-bold text-muted border-bottom pb-2">
                                        <FaCalendarAlt className="me-2" />
                                        {getDateString(date)}
                                    </h6>
                                    {groupedNotes[date].map((note, idx) => (
                                        <div key={idx} className="d-flex align-items-start gap-2 py-2 border-bottom">
                                            {note.completed ? (
                                                <FaCheckCircle className="text-success mt-1" />
                                            ) : (
                                                <FaTimesCircle className="text-danger mt-1" />
                                            )}
                                            <div>
                                                <div className="fw-semibold small">{note.taskName}</div>
                                                <div className="text-muted small">{note.note}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <FaBook size={48} className="mb-3 opacity-25" />
                                <p>No notes found</p>
                                <p className="small">Start adding notes to your daily tasks!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0">
                        <button onClick={onClose} className="btn btn-light rounded-pill px-4">
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default QuickRevision;