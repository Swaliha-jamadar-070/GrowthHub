import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        let payload;
        let config = {};

        if (isLogin) {
            const formParams = new URLSearchParams();
            formParams.append('username', formData.username);
            formParams.append('password', formData.password);
            payload = formParams;
            config.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        } else {
            payload = { 
                fullName: formData.fullName, 
                username: formData.username, 
                email: formData.email, 
                password: formData.password,
                role: 'USER' 
            };
        }

        try {
            // ✅ Backend URL - Correct
            const res = await axios.post(`https://growthhub-10.onrender.com${endpoint}`, payload, config);
            
            if (isLogin) {
                login(res.data.user, res.data.token);
                toast.success('🚀 Welcome back!');
                navigate('/dashboard');
            } else {
                toast.success('🎉 Account created! Please login.');
                setIsLogin(true);
                setFormData({ fullName: '', username: '', email: '', password: '' });
            }
        } catch (error) {
            let errorMessage = "Something went wrong";
            if (error.response) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.request) {
                // ✅ FIXED: Updated error message
                errorMessage = "Cannot connect to backend. Please check your internet connection.";
            }
            toast.error(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ fullName: '', username: '', email: '', password: '' });
    };

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative" 
            style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(255, 255, 255, 0.80)', 
                backdropFilter: 'blur(4px)',
                zIndex: 0 
            }}></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container position-relative"
                style={{ maxWidth: '1000px', zIndex: 1 }}
            >
                <div className="row shadow-lg rounded-5 overflow-hidden bg-white border-0">
                    
                    {/* LEFT SIDE: IMAGE & BRANDING */}
                    <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center p-5 text-white"
                         style={{ 
                             background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)'
                         }}
                    >
                        <div className="mb-4 p-4 bg-white rounded-circle shadow-lg d-flex align-items-center justify-content-center">
                            <FaRocket size={44} className="text-primary" />
                        </div>
                        <h2 className="fw-bold mb-3">{isLogin ? 'Welcome Back!' : 'Start Your Journey'}</h2>
                        <p className="text-center text-white-50 mb-4" style={{ maxWidth: '300px' }}>
                            {isLogin 
                                ? 'Track your daily progress, build your roadmap, and achieve your goals.' 
                                : 'Join GrowthHub and start building your skills one day at a time.'}
                        </p>
                        <div className="d-flex gap-3 flex-wrap justify-content-center">
                            <span className="badge bg-white text-primary rounded-pill px-3 py-2">🎯 Roadmaps</span>
                            <span className="badge bg-white text-primary rounded-pill px-3 py-2">📊 Analytics</span>
                            <span className="badge bg-white text-primary rounded-pill px-3 py-2">🏆 Daily Streaks</span>
                        </div>
                    </div>

                    {/* RIGHT SIDE: FORM */}
                    <div className="col-lg-6 p-5 bg-white">
                        <div className="text-center mb-4">
                            <h3 className="fw-bold text-dark mb-1">
                                {isLogin ? 'GrowthHub' : 'Create Account'}
                            </h3>
                            <p className="text-muted small">
                                {isLogin ? 'Sign in to track your progress' : 'Start tracking your progress today'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Full Name (Register Only) */}
                            {!isLogin && (
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">Full Name</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><FaUser className="text-muted" /></span>
                                        <input 
                                            type="text" 
                                            name="fullName"
                                            className="form-control border-start-0 bg-light" 
                                            placeholder="Enter your full name" 
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Username */}
                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-muted">Username</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><FaUser className="text-muted" /></span>
                                    <input 
                                        type="text" 
                                        name="username"
                                        className="form-control border-start-0 bg-light" 
                                        placeholder="Choose a username" 
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email (Register Only) */}
                            {!isLogin && (
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                                        <input 
                                            type="email" 
                                            name="email"
                                            className="form-control border-start-0 bg-light" 
                                            placeholder="Enter your email" 
                                            value={formData.email}
                                            onChange={handleChange}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-muted">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                                    <input 
                                        type="password" 
                                        name="password"
                                        className="form-control border-start-0 bg-light" 
                                        placeholder={isLogin ? "Enter your password" : "Create a password (min 4 chars)"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                {!isLogin && <small className="text-muted small mt-1">Minimum 4 characters</small>}
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm mb-3"
                                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                ) : (
                                    isLogin ? <><FaSignInAlt className="me-2" /> Login</> : <><FaUserPlus className="me-2" /> Create Account</>
                                )}
                            </button>
                        </form>

                        <div className="text-center small">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={toggleMode} 
                                className="btn btn-link text-decoration-none fw-semibold p-0 ms-1"
                                style={{ color: '#8B5CF6' }}
                            >
                                {isLogin ? 'Register' : 'Login'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthPage;
