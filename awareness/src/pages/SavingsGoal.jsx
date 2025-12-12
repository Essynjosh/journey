import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SavingsGoal.css'; 
import { useAuth } from '../context/AuthContext'; // Assuming you use auth context for user ID

const TARGET_MONTHS_SHORT = 3; 
const MIN_TARGET_AMOUNT = 1000;

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
    }).format(amount);
};

// --- MOCK STORAGE KEY ---
// In a real app, this would be fetched/stored in a database associated with the userId
const getSavingsKey = (userId) => `savings_plan_${userId}`;


const SavingsGoal = () => {
    // Get user ID for mock storage key
    const { authState } = useAuth();
    const userId = authState.user?.id || 'guest';
    const SAVINGS_KEY = getSavingsKey(userId);

    // --- State for Calculator Inputs ---
    const [targetAmount, setTargetAmount] = useState('');
    const [timeframe, setTimeframe] = useState(''); 
    const [customGoalAmount, setCustomGoalAmount] = useState(''); 
    const [calculationMode, setCalculationMode] = useState('flexible_plan'); 

    // --- State for Plan Tracking ---
    const [planDetails, setPlanDetails] = useState(null);
    const [result, setResult] = useState(null); // Used for new calculation results
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    // Load saved plan details on mount
    useEffect(() => {
        const savedPlan = localStorage.getItem(SAVINGS_KEY);
        if (savedPlan) {
            setPlanDetails(JSON.parse(savedPlan));
        }
        setLoading(false);
    }, [SAVINGS_KEY]);


    // --- Core Calculation Logic ---
    const handleCalculate = (e) => {
        e.preventDefault();
        
        let finalTargetAmount, finalMonths;

        // ... (Calculation Mode logic remains the same)
        if (calculationMode === 'flexible_plan') {
            finalMonths = parseInt(timeframe, 10);
            finalTargetAmount = parseFloat(targetAmount);

            if (isNaN(finalTargetAmount) || finalTargetAmount < MIN_TARGET_AMOUNT || isNaN(finalMonths) || finalMonths <= 0 || finalMonths > 24) {
                setResult({ 
                    error: `Please enter a valid Target Amount (Min KSh ${MIN_TARGET_AMOUNT}) and a realistic Timeframe (1-24 months).`
                });
                return;
            }
        } else {
            finalMonths = TARGET_MONTHS_SHORT;
            finalTargetAmount = parseFloat(customGoalAmount);
            
            if (isNaN(finalTargetAmount) || finalTargetAmount < MIN_TARGET_AMOUNT) {
                 setResult({ 
                    error: `Please enter a valid Target Amount (Min KSh ${MIN_TARGET_AMOUNT}) you wish to save in ${TARGET_MONTHS_SHORT} months.`
                });
                return;
            }
        }
        
        const requiredMonthly = Math.ceil(finalTargetAmount / finalMonths);
        
        setResult({
            target: finalTargetAmount,
            months: finalMonths,
            requiredMonthly,
            error: null
        });
    };
    
    // --- Start Saving Logic (Button on Calculation Result) ---
    const handleStartSaving = () => {
        if (!result || result.error) return;

        const newPlan = {
            target: result.target,
            months: result.months,
            requiredMonthly: result.requiredMonthly,
            totalSaved: 0, // Initial saved amount
            lastPaymentDate: null,
            isGoalAchieved: false,
        };
        
        localStorage.setItem(SAVINGS_KEY, JSON.stringify(newPlan));
        setPlanDetails(newPlan);
        setResult(null); // Clear calculation view
        setStatusMessage('Congratulations! Your savings plan has started.');
    };

    // --- Make Payment Logic (Tracker View Button) ---
    const handleMakePayment = () => {
        if (!planDetails || planDetails.isGoalAchieved) return;

        setStatusMessage(`Requesting M-Pesa PIN prompt for ${formatCurrency(planDetails.requiredMonthly)}...`);
        
        // --- M-PESA PROMPT SIMULATION ---
        setTimeout(() => {
            const confirmed = window.confirm(`M-Pesa Simulation: Confirm payment of ${formatCurrency(planDetails.requiredMonthly)}? (Press OK to simulate success)`);
            
            if (confirmed) {
                const newTotalSaved = planDetails.totalSaved + planDetails.requiredMonthly;
                const isAchieved = newTotalSaved >= planDetails.target;

                const updatedPlan = {
                    ...planDetails,
                    totalSaved: newTotalSaved,
                    lastPaymentDate: new Date().toISOString(),
                    isGoalAchieved: isAchieved,
                };

                localStorage.setItem(SAVINGS_KEY, JSON.stringify(updatedPlan));
                setPlanDetails(updatedPlan);
                setStatusMessage(
                    isAchieved 
                    ? `SUCCESS! Goal Achieved! You have saved ${formatCurrency(newTotalSaved)}.`
                    : `SUCCESS! ${formatCurrency(planDetails.requiredMonthly)} saved. Total saved: ${formatCurrency(newTotalSaved)}.`
                );
            } else {
                setStatusMessage('M-Pesa payment cancelled.');
            }
        }, 1000); // Simulate network delay
    };
    
    // --- Reset Plan Logic ---
    const handleResetPlan = () => {
        localStorage.removeItem(SAVINGS_KEY);
        setPlanDetails(null);
        setResult(null);
        setStatusMessage('Your savings plan has been reset.');
        // Reset input fields
        setTargetAmount('');
        setTimeframe('');
        setCustomGoalAmount('');
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="loading-spinner">Loading Savings Plan...</div>;
    }

    // --- TRACKER VIEW ---
    if (planDetails) {
        const remaining = Math.max(0, planDetails.target - planDetails.totalSaved);
        const progressPercent = (planDetails.totalSaved / planDetails.target) * 100;
        const paymentsMade = Math.floor(planDetails.totalSaved / planDetails.requiredMonthly);
        
        return (
            <div className="savings-goal-page container tracker-view">
                <h1 className="page-title">📈 Your Active Savings Tracker</h1>
                <p className="page-subtitle">
                    Keep making your monthly contribution to fund your screening session!
                </p>
                
                {statusMessage && <div className="status-box success">{statusMessage}</div>}

                <div className="tracker-summary">
                    <div className="summary-item">
                        <h3>Monthly Goal</h3>
                        <p className="value-large">{formatCurrency(planDetails.requiredMonthly)}</p>
                    </div>
                    <div className="summary-item">
                        <h3>Total Saved</h3>
                        <p className="value-large saved">{formatCurrency(planDetails.totalSaved)}</p>
                    </div>
                    <div className="summary-item">
                        <h3>Target Goal</h3>
                        <p className="value-large">{formatCurrency(planDetails.target)}</p>
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${Math.min(100, progressPercent)}%` }}>
                        {Math.round(progressPercent)}%
                    </div>
                </div>

                <div className="tracker-actions">
                    {planDetails.isGoalAchieved ? (
                        <div className="achievement-message">
                            <h2>Goal Achieved! 🎉</h2>
                            <p>You have enough funds to book your screening session. Total saved: {formatCurrency(planDetails.totalSaved)}</p>
                        </div>
                    ) : (
                        <>
                            <p className="next-payment-info">
                                You need to save {formatCurrency(remaining)} more over {planDetails.months - paymentsMade} months.
                            </p>
                            <button 
                                onClick={handleMakePayment} 
                                className="btn btn-primary btn-large btn-payment"
                            >
                                Make Payment ({formatCurrency(planDetails.requiredMonthly)})
                            </button>
                        </>
                    )}
                    
                    <button onClick={handleResetPlan} className="btn btn-danger-link">
                        Start New Plan
                    </button>
                </div>
            </div>
        );
    }
    // --- END TRACKER VIEW ---


    // --- CALCULATOR VIEW (Renders if planDetails is null) ---
    const handleModeSwitch = (mode) => {
        setCalculationMode(mode);
        setResult(null); 
        setTargetAmount('');
        setTimeframe('');
        setCustomGoalAmount('');
    };

    return (
        <div className="savings-goal-page container">
            <h1 className="page-title">🎯 Personalized Screening Savings Plan</h1>
            <p className="page-subtitle">
                Set your financial goal and desired savings period based on your specific screening cost.
            </p>
            
            {statusMessage && <div className="status-box">{statusMessage}</div>}

            <div className="calculator-wrapper">
                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button 
                        className={`tab-btn ${calculationMode === 'flexible_plan' ? 'active-tab' : ''}`}
                        onClick={() => handleModeSwitch('flexible_plan')}
                    >
                        Flexible Plan (Set Your Months)
                    </button>
                    <button 
                        className={`tab-btn ${calculationMode === 'three_month_express' ? 'active-tab' : ''}`}
                        onClick={() => handleModeSwitch('three_month_express')}
                    >
                        3-Month Express Plan
                    </button>
                </div>
                
                <form onSubmit={handleCalculate} className="input-form">
                    
                    {/* Input Fields based on Mode */}
                    {/* ... (Existing input field logic remains here, unchanged) ... */}
                    {calculationMode === 'flexible_plan' ? (
                        <>
                            <p className="goal-status-text">Define both your target amount and the time you need to save.</p>
                            
                            <div className="input-group">
                                <label htmlFor="targetAmount">
                                    Specific Screening Cost / Target Amount (KSh)
                                </label>
                                <input
                                    type="number"
                                    id="targetAmount"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    placeholder="e.g., 7500 (Check with your clinic)"
                                    min={MIN_TARGET_AMOUNT}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="timeframe">
                                    Desired Savings Timeframe (in Months, max 24)
                                </label>
                                <input
                                    type="number"
                                    id="timeframe"
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    placeholder="e.g., 6 months"
                                    min="1"
                                    max="24"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="goal-status-text">You are saving over a fixed period of **{TARGET_MONTHS_SHORT} months**.</p>
                            <div className="input-group">
                                <label htmlFor="customGoalAmount">
                                    Specific Screening Cost / Target Amount (KSh)
                                </label>
                                <input
                                    type="number"
                                    id="customGoalAmount"
                                    value={customGoalAmount}
                                    onChange={(e) => setCustomGoalAmount(e.target.value)}
                                    placeholder="e.g., 12000 (Check with your clinic)"
                                    min={MIN_TARGET_AMOUNT}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-calculate">
                        Calculate Monthly Contribution
                    </button>
                </form>

                {result && (
                    <div className="results-panel">
                        {result.error ? (
                            <p className="error-message">{result.error}</p>
                        ) : (
                            <>
                                <h2 className="results-title">Your {result.months}-Month Plan</h2>
                                
                                <p className="summary-text">
                                    To reach your goal of **{formatCurrency(result.target)}** in **{result.months}** months, you must save:
                                </p>

                                <div className="time-display">
                                    <span className="months-value">{formatCurrency(result.requiredMonthly)}</span>
                                    <span className="unit">per Month</span>
                                </div>
                                
                                {/* --- NEW BUTTON TO START SAVING --- */}
                                <button 
                                    onClick={handleStartSaving} 
                                    className="btn btn-secondary btn-large"
                                    style={{ marginTop: '20px' }}
                                >
                                    Start Saving for Screening
                                </button>

                                <div className="mpesa-criteria-box">
                                    <h3>M-Pesa Deposit Instructions:</h3>
                                    <ol>
                                        <li>Go to **Lipa na M-Pesa** (Pay Bill)</li>
                                        <li>**Business No.:** [Your Partner Bank/SACCO Pay Bill Number]</li>
                                        <li>**Account No.:** Your **National ID** or Unique **Savings Plan ID**</li>
                                        <li>**Amount:** **{formatCurrency(result.requiredMonthly)}**</li>
                                        <li>**Criteria:** Complete the deposit on or before the **5th of every month** for **{result.months}** months.</li>
                                    </ol>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <Link to="/" className="btn btn-secondary">← Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default SavingsGoal;