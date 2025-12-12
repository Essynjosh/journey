import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Progress.css'; 

const Progress = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgressHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        // 1. Retrieve the token from localStorage
        // NOTE: In a real app, you would use a dedicated Auth Context/Hook for this
        const token = localStorage.getItem('token'); 

        if (!token) {
            // User is not logged in. Redirect to login.
            setLoading(false);
            setError('Please log in to view your progress history.');
            // Add a timeout before navigation for a better UX
            setTimeout(() => navigate('/login'), 2000); 
            return;
        }

        try {
            const response = await fetch('/api/risk-check/progress', {
                method: 'GET',
                // 2. Add the Authorization header with the token
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });

            // 3. Handle Unauthorized Access (401)
            if (response.status === 401) {
                // Token is invalid, expired, or missing. Clear token and redirect.
                localStorage.removeItem('token');
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/login'), 2000); 
                return;
            }

            if (response.status === 404) {
                setHistory([]); 
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setHistory(data.progress || []);

        } catch (err) {
            console.error('Failed to fetch history:', err);
            setError('Could not retrieve your assessment history. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [navigate]); // navigate hook is a dependency

    useEffect(() => {
        fetchProgressHistory();
    }, [fetchProgressHistory]);

    // Helper functions (remain unchanged)
    const getRiskClass = (risk) => {
        switch (risk) {
            case 'HIGH': return 'risk-high';
            case 'MEDIUM': return 'risk-medium';
            case 'LOW': default: return 'risk-low';
        }
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // --- Component Render ---
    return (
        <div className="progress-page container">
            <h1 className="page-title">Assessment History & Progress</h1>
            <p className="page-subtitle">Track your risk levels over time to monitor changes.</p>

            {loading && <p className="loading-message">Loading history...</p>}
            
            {/* Show error message */}
            {error && <p className="error-message text-red-600 font-bold">{error}</p>}

            {!loading && !error && history.length === 0 && (
                <div className="empty-state">
                    <p>You have not completed any risk assessments yet.</p>
                    <Link to="/risk-check" className="btn btn-primary">Start Your First Check →</Link>
                </div>
            )}

            {!loading && history.length > 0 && (
                <div className="history-list">
                    {/* Optional: Add a simple chart here for visual representation of progress */}
                    <div className="chart-placeholder p-4 bg-white rounded-lg shadow-inner mb-6">
                        [Risk Score Trend Chart Placeholder - Integration required]
                    </div>
                    
                    {history.map((session, index) => (
                        <div key={session.id || index} className="session-card">
                            <div className="session-header">
                                <span className="session-date">{formatDate(session.createdAt)}</span> {/* Use createdAt field */}
                                <span className={`risk-tag ${getRiskClass(session.riskLevel)}`}> {/* Use riskLevel field */}
                                    {session.riskLevel} RISK
                                </span>
                            </div>
                            <div className="session-details">
                                <p>Score: **{session.score}**</p>
                                <Link to={`/session/${session.id}`} className="view-details-link">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-6">
                <Link to="/" className="btn btn-secondary">← Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default Progress;