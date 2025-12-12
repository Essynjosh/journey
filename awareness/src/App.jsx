import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

// --- Import All Core Pages ---
import LandingPage from './pages/LandingPage'; 
import RiskCheck from './pages/RiskCheck';
import ClinicLocator from './pages/ClinicLocator'; 
import Progress from './pages/Progress';
import Login from './pages/Login';
import Register from './pages/Register'; 
import SessionDetails from './pages/SessionDetails'; 
import SavingsGoal from './pages/SavingsGoal'; 

import './app.css';

// --- Context-Aware Navigation Bar Component ---
const Navbar = () => {
    // Use the AuthContext hook to get the state and functions
    const { authState, logout } = useAuth(); 
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Clears token and updates state
        alert('You have been logged out.');
        navigate('/'); // Redirects to the landing page
    };

    return (
        <nav className="main-nav bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
            <Link to="/" className="text-2xl font-bold text-teal-600">
                Smart Health
            </Link>
            
            {/* FIX APPLIED HERE: Increased space-x to 'space-x-6' for better visual separation. 
               Also adjusted class application for Login/Register.
            */}
            <div className="space-x-6 flex items-center">
                
                {/* General Navigation Links */}
                <Link to="/risk-check" className="nav-link text-gray-700 hover:text-teal-600 font-medium">Risk Check</Link>
                <Link to="/clinic-locator" className="nav-link text-gray-700 hover:text-teal-600 font-medium">Find Clinics</Link>
                {/* Added Savings Goal back, styled as a secondary link */}
                <Link to="/savings-goal" className="nav-link text-gray-700 hover:text-teal-600 font-medium">Savings Goal</Link> 
                
                {/* Conditional Links based on Authentication State */}
                {authState.isAuthenticated ? (
                    <>
                        <Link to="/progress" className="nav-link text-gray-700 hover:text-teal-600 font-medium">Progress</Link>
                        
                        <button 
                            onClick={handleLogout} 
                            // Using text styling for a clear logout button
                            className="text-red-600 hover:text-red-800 font-medium transition duration-150 p-2"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        {/* Login link with a separator for visual clarity */}
                        <Link 
                            to="/login" 
                            className="nav-link text-gray-700 hover:text-teal-600 font-medium border-r pr-6" // Increased right padding (pr-6)
                        >
                            Login
                        </Link>
                        {/* Register button for clear CTA */}
                        <Link to="/register" className="btn btn-primary text-sm px-4 py-2">
                            REGISTER
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};


function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App font-sans bg-gray-50 min-h-screen">
                    
                    <Navbar />

                    <main className="content p-4 sm:p-8">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/risk-check" element={<RiskCheck />} />
                            <Route path="/clinic-locator" element={<ClinicLocator />} />
                            
                            {/* PROTECTED ROUTES */}
                            <Route path="/progress" element={<Progress />} />
                            <Route path="/session/:id" element={<SessionDetails />} />
                            
                            {/* PUBLIC ROUTES */}
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} /> 
                            <Route path="/savings-goal" element={<SavingsGoal />} /> 
                            
                            <Route 
                                path="*" 
                                element={<div className="p-16 text-center text-2xl text-gray-700">404 - Page Not Found</div>} 
                            />
                        </Routes>
                    </main>
                    
                    <footer className="w-full bg-gray-200 p-4 text-center text-sm text-gray-600 mt-8">
                        <p>&copy; 2025 Smart Health Initiative. All rights reserved.</p>
                    </footer>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;