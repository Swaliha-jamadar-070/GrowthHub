import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, Maximize, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WeeklyFocus = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const imageUrl = '/roadmapp.png';

    return (
        // Wrapper: Screen ke bilkul center mein sab kuch laane ke liye
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
            
            {/* --- HEADER SECTION (Top Center) --- */}
            <div className="w-full max-w-4xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-6 mb-8 text-white shadow-xl text-center border border-white/10">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    🚀 Full Stack + AI Roadmap
                </h1>
                <p className="text-blue-100 text-base md:text-lg font-medium">
                    Your 4-month journey to become a future-ready software engineer
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mt-5">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-full font-semibold transition flex items-center gap-2 shadow-md"
                    >
                        <Maximize size={18} />
                        View Full
                    </button>
                    <button 
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = imageUrl;
                            link.download = 'FullStack_Roadmap.png';
                            link.click();
                        }}
                        className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-full font-semibold transition flex items-center gap-2 backdrop-blur-sm border border-white/30"
                    >
                        <Download size={18} />
                        Download
                    </button>
                </div>
            </div>

            {/* --- IMAGE SECTION (Short, Centered, Professional) --- */}
            <div 
                onClick={() => setIsModalOpen(true)}
                className="w-full max-w-5xl cursor-pointer group relative"
            >
                <div className="relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 p-4 flex items-center justify-center">
                    
                    {/* Image: Limited Height (Short) aur Center mein */}
                    <img 
                        src={imageUrl}
                        alt="Java Full Stack + AI Engineer Roadmap"
                        className="w-full h-auto max-h-[50vh] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                        onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            document.getElementById('image-error').style.display = 'flex';
                        }}
                    />
                    
                    {/* Professional Hover Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-2xl">
                        <div className="bg-white dark:bg-gray-800 rounded-full p-3 scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                            <Maximize size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                
                {/* Error Message */}
                <div id="image-error" style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl p-10">
                    <p className="text-2xl font-bold">⚠️ Image not found</p>
                    <p className="text-sm mt-2">Make sure <code>roadmapp.png</code> is in the <code>public</code> folder</p>
                </div>
            </div>

            {/* --- FULL SCREEN MODAL (Professional Popup) --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Close Button */}
                            <div className="absolute top-4 right-4 z-10">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition backdrop-blur-sm"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Image Area */}
                            <div className="w-full h-full overflow-auto flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-4">
                                <img 
                                    src={imageUrl}
                                    alt="Full Stack Roadmap"
                                    className="w-auto max-w-full h-auto object-contain"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            
        </div>
    );
};

export default WeeklyFocus;