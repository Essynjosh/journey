import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <--- Correct import for hook
import '../styles/Auth.css'; 

const Register = () => {
    // 1. Hook usage MUST be inside the functional component body
    const { login } = useAuth(); // <--- Use the context hook
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // We only need one instance of navigate, removed the duplicate declaration
    
    const { firstName, lastName, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed due to server error.');
            }

            // --- CRITICAL UPDATE: Use context login function ---
            // The context handles storing the token/userId in localStorage and updates the app state.
            login(data.token, data.userId);
            // --- END CRITICAL UPDATE ---
            
            alert('Registration successful! Welcome to Smart Health.');
            navigate('/risk-check');

        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'An unexpected error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h1 className="auth-title">Create Your Account</h1>
                <p className="auth-subtitle">Get personalized health tracking and local clinic access.</p>

                {error && <div className="error-box">{error}</div>}

                <div className="input-group-row">
                    <input
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                        className="input-field"
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                        className="input-field"
                    />
                </div>
                
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
                    placeholder="Password (Min 6 characters)"
                    required
                    minLength="6"
                    className="input-field"
                />
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                    className="input-field"
                />
                
                <button type="submit" disabled={loading} className="btn btn-primary btn-auth">
                    {loading ? 'Signing Up...' : 'Register'}
                </button>
                
                <p className="auth-link-text">
                    Already have an account? <Link to="/login" className="link-secondary">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;