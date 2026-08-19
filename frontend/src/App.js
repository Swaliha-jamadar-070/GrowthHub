import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AuthPage from './components/AuthPage'; 
import Dashboard from './components/Dashboard';
import DailyTracker from './components/DailyTracker';
import WeeklyFocus from './components/WeeklyFocus';
import ProgressStats from './components/ProgressStats';
import Profile from './components/Profile';

// Create a wrapper component to handle global auth loading
function AppContent() {
    const { loading } = useAuth();

    // If the AuthContext hasn't finished loading from local storage, show a loader
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading App...</span>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Updated Routes using the new AuthPage */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tracker" element={<DailyTracker />} />
                <Route path="weekly-focus" element={<WeeklyFocus />} />
                <Route path="progress" element={<ProgressStats />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        // 🚨 FIX IS HERE: Router MUST be outside of AuthProvider so navigate works!
        <BrowserRouter>
            <AuthProvider>
                <div className="min-h-screen">
                    <AppContent />
                    <Toaster position="top-right" />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;