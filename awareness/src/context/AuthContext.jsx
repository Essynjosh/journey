import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Define and Export the Context
export const AuthContext = createContext();

// 2. Define the Provider Component
export const AuthProvider = ({ children }) => {
    // State to hold the authentication token and user ID
    const [authState, setAuthState] = useState({
        token: null,
        userId: null,
        isAuthenticated: false,
    });
    const [loading, setLoading] = useState(true);

    // Runs once on component mount to check local storage for existing session
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
            setAuthState({
                token,
                userId,
                isAuthenticated: true,
            });
        }
        setLoading(false);
    }, []);

    // Function called after successful login or registration
    const login = (token, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        setAuthState({
            token,
            userId,
            isAuthenticated: true,
        });
    };

    // Function called on logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setAuthState({
            token: null,
            userId: null,
            isAuthenticated: false,
        });
    };

    // If loading, you might want to render a loading spinner or null
    if (loading) {
        return null; // Or <LoadingSpinner />
    }

    return (
        <AuthContext.Provider value={{ authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Define a Custom Hook for easy use
export const useAuth = () => {
    return useContext(AuthContext);
};