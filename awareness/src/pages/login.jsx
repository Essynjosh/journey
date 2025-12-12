import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Correct import for hook
import '../styles/Auth.css'; 

const Login = () => {
    // 1. Hook usage MUST be inside the functional component body
    const { login } = useAuth(); // <--- Use the context hook
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Removed duplicate declaration of navigate

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle invalid credentials or server errors (401, 400)
                throw new Error(data.message || 'Login failed. Please check your email and password.');
            }

            // --- CRITICAL UPDATE: Use context login function ---
            // The context handles storing the token/userId in localStorage and updates the app state.
            login(data.token, data.userId);
            // --- END CRITICAL UPDATE ---

            alert('Login successful!');
            navigate('/risk-check');

        } catch (err) {
            console.error('Login Error:', err);
            setError(err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your health progress history.</p>

                {error && <div className="error-box">{error}</div>}

                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="input-field"
                />
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="input-field"
                />
                
                <button type="submit" disabled={loading} className="btn btn-primary btn-auth">
                    {loading ? 'Logging In...' : 'Login'}
                </button>
                
                <p className="auth-link-text">
                    Don't have an account? <Link to="/register" className="link-secondary">Register here</Link>
                </p>
                
                {/* Optional: Add a 'Forgot Password' link here */}
            </form>
        </div>
    );
};

export default Login;