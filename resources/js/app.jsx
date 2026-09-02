import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '../css/app.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterPrestataire from './pages/RegisterPrestataire';
import Dashboard from './pages/Dashboard';
import './i18n';
function AppContent() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [pendingBooking, setPendingBooking] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('pendingBooking');
        if (saved) {
            try {
                setPendingBooking(JSON.parse(saved));
            } catch (e) {
                localStorage.removeItem('pendingBooking');
            }
        }
    }, []);

    const startPendingBooking = (booking) => {
        setPendingBooking(booking);
        localStorage.setItem('pendingBooking', JSON.stringify(booking));
    };

    const clearPendingBooking = () => {
        setPendingBooking(null);
        localStorage.removeItem('pendingBooking');
    };

    if (loading) {
        return (
            <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF5F0'}}>
                <div style={{textAlign: 'center'}}>
                    <img src="/images/logo_PAWNELLA.jpeg" alt="PawNella" style={{height: '80px', marginBottom: '16px'}}/>
                    <p style={{color: '#E8756A', fontSize: '16px', fontWeight: '600'}}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {user ? (
                <Route
                    path="/*"
                    element={<Dashboard pendingBooking={pendingBooking} clearPendingBooking={clearPendingBooking} />}
                />
            ) : (
                <>
                    <Route
                        path="/"
                        element={
                            <Home
                                onLogin={() => navigate('/login')}
                                onRegister={() => navigate('/register')}
                                onPrestataire={() => navigate('/register-prestataire')}
                                startPendingBooking={startPendingBooking}
                            />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <Login
                                onSwitch={() => navigate('/register')}
                                onHome={() => navigate('/')}
                            />
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <Register
                                onSwitch={() => navigate('/login')}
                                onHome={() => navigate('/')}
                                onPrestataire={() => navigate('/register-prestataire')}
                            />
                        }
                    />
                    <Route
                        path="/register-prestataire"
                        element={
                            <RegisterPrestataire
                                onSwitch={() => navigate('/register')}
                                onHome={() => navigate('/')}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <NotificationProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </NotificationProvider>
        </BrowserRouter>
    );
}

const root = document.getElementById('app');
if (root) {
    ReactDOM.createRoot(root).render(<App />);
}