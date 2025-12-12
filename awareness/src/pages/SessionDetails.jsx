import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SessionDetails.css'; // We'll define this CSS next

const SessionDetails = () => {
    const { id } = useParams(); // Get the session ID from the URL parameter
    const navigate = useNavigate();
    const { authState } = useAuth();
    
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSessionDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const token = authState.token;
        
        if (!token) {
            setError('You must be logged in to view session details.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        try {
            const response = await fetch(`/api/risk-check/session/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (response.status === 401) {
                // Session expired or token invalid
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/login'), 2000); 
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setSession(data.session);

        } catch (err) {
            console.error('Failed to fetch session details:', err);
            setError(err.message || 'Could not retrieve session details.');
        } finally {
            setLoading(false);
        }
    }, [id, authState.token, navigate]);

    useEffect(() => {
        fetchSessionDetails();
    }, [fetchSessionDetails]);

    // Helper functions
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getRiskClass = (risk) => {
        switch (risk) {
            case 'HIGH': return 'risk-high';
            case 'MEDIUM': return 'risk-medium';
            case 'LOW': default: return 'risk-low';
        }
    };


    if (loading) {
        return <div className="container p-8 loading-message">Loading session details...</div>;
    }

    if (error) {
        return <div className="container p-8 error-message">{error}</div>;
    }

    if (!session) {
        return <div className="container p-8 error-message">Session data could not be loaded.</div>;
    }

    return (
        <div className="session-details-page container">
            <h1 className="page-title">Detailed Assessment Summary</h1>
            <p className="page-subtitle">Session Date: **{formatDate(session.date)}**</p>

            {/* --- Overview Card --- */}
            <div className={`overview-card ${getRiskClass(session.riskLevel)}`}>
                <div className="score-box">
                    <span className="label">Risk Score</span>
                    <span className="score-value">{session.score}</span>
                </div>
                <div className="risk-box">
                    <span className="label">Assessed Risk Level</span>
                    <span className="risk-level">{session.riskLevel}</span>
                </div>
            </div>

            {/* --- Recommendations Section --- */}
            <section className="recommendations-section">
                <h2>📋 Next Steps & Recommendations</h2>
                <ul className="recommendation-list">
                    {/* Recommendations is expected to be an array of strings from the risk engine */}
                    {session.recommendations && session.recommendations.map((rec, index) => (
                        <li key={index} className="recommendation-item">
                            {rec}
                        </li>
                    ))}
                    {session.riskLevel === 'HIGH' && (
                        <li className="recommendation-item urgent-action">
                            <span className="font-bold text-red-700">URGENT ACTION:</span> Given your high score, please utilize the <Link to="/clinic-locator">Clinic Locator</Link> immediately to schedule a professional consultation.
                        </li>
                    )}
                </ul>
            </section>

            {/* --- Detailed Answers Section --- */}
            <section className="answers-section">
                <h2>🔎 Your Responses</h2>
                <div className="answers-grid">
                    {/* Answers is expected to be an array of { question: "...", answer: "...", value: N } */}
                    {session.answers && session.answers.map((qa, index) => (
                        <div key={index} className="answer-card">
                            <p className="question-text">Q: {qa.question}</p>
                            <p className="answer-text">A: **{qa.answer}**</p>
                            <span className="answer-value">Value: {qa.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <div className="mt-8 text-center">
                <Link to="/progress" className="btn btn-secondary">← Back to History</Link>
            </div>
        </div>
    );
};

export default SessionDetails;