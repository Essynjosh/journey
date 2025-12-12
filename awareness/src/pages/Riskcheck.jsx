import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RiskCheck.css';

// The comprehensive list of questions (unchanged from initial plan)
const QUESTIONS = [
    { id: 'q_age', label: '1. What is your age?', type: 'number', required: true, min: 10, max: 100 },
    { id: 'q_sex', label: '2. What is your biological sex?', type: 'select', options: ['Female', 'Male'], required: true },
    { id: 'q_lump', label: '3. Have you noticed any unexplained lump, swelling, or mass anywhere on your body?', type: 'radio', options: ['No', 'Yes'], required: true, riskWeight: 25 },
    { id: 'q_pain', label: '4. Do you have unexplained persistent pain in one area (e.g., chest, abdomen, back)?', type: 'radio', options: ['No', 'Yes'], required: true, riskWeight: 10 },
    { id: 'q_family', label: '5. Do you have a first-degree relative (parent, sibling, child) who has had cancer?', type: 'radio', options: ['No', 'Yes'], required: true, riskWeight: 20 },
    // Female Specific (Cervical/Breast)
    { id: 'q_bleeding', label: '6. (Female) Have you experienced unusual vaginal bleeding or post-menopausal bleeding?', type: 'radio', options: ['No', 'Yes'], required: false, appliesTo: 'Female', riskWeight: 15 },
    // Male Specific (Prostate)
    { id: 'q_urine_issue', label: '7. (Male) Have you had difficulty passing urine or noticed blood in your urine?', type: 'radio', options: ['No', 'Yes'], required: false, appliesTo: 'Male', riskWeight: 10 },
];

const RiskCheck = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // Stores the full response from the backend
    const [validationError, setValidationError] = useState('');

    const currentQuestion = QUESTIONS[step];

    // Filtered list of questions based on sex
    const filteredQuestions = QUESTIONS.filter(q => 
        !q.appliesTo || q.appliesTo === answers.q_sex
    );

    // --- Handlers for Navigation and Input ---

    const handleAnswerChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        setValidationError('');
    };

    const handleNext = () => {
        if (currentQuestion.required && !answers[currentQuestion.id]) {
            setValidationError(`Please answer question ${step + 1}.`);
            return;
        }

        // Find the index of the current question in the filtered list
        const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestion.id);
        if (currentIndex < filteredQuestions.length - 1) {
            setStep(step => step + 1);
        } else {
            submitRiskCheck();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step => step - 1);
        }
    };

    // --- CRITICAL API INTEGRATION FUNCTION ---
    const submitRiskCheck = async () => {
        setLoading(true);
        setValidationError('');

        // 1. Validate required fields (already done in handleNext, but good to double check)
        if (!answers.q_age || !answers.q_sex) {
            setValidationError("Age and sex are required fields.");
            setLoading(false);
            return;
        }

        // 2. API Call
        try {
            const response = await fetch('/api/risk-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers), // Send all collected answers to the backend
            });

            if (!response.ok) {
                // Read error message from backend if available
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data); // Store the full result (riskLevel, recommendation, score)

        } catch (error) {
            console.error('Risk Check submission failed:', error);
            setValidationError('Failed to get risk result from server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Result Renderer ---
    const renderResult = () => {
        if (!result) return null;

        const { riskLevel, score, recommendation } = result;

        let resultClass = '';
        let resultTitle = 'Low Risk';

        if (riskLevel === 'HIGH') {
            resultClass = 'risk-high';
            resultTitle = 'High Risk';
        } else if (riskLevel === 'MEDIUM') {
            resultClass = 'risk-medium';
            resultTitle = 'Moderate Risk';
        } else {
            resultClass = 'risk-low';
        }

        return (
            <div className={`risk-result-card ${resultClass}`}>
                <h2 className={`result-title`}>Assessment Complete</h2>
                <div className="result-score-block">
                    <p>Calculated Score: <span>{score}</span></p>
                    <h3 className={resultClass}>{resultTitle}</h3>
                </div>
                
                <p className="recommendation-text">{recommendation}</p>

                <div className="result-actions">
                    <Link to="/clinic-locator" className="btn btn-primary">
                        Find Screening Clinics →
                    </Link>
                    <button onClick={() => navigate('/progress')} className="btn btn-secondary">
                        View Past Checks
                    </button>
                    <button onClick={() => { setStep(0); setResult(null); setAnswers({}); }} className="btn btn-link">
                        Start New Check
                    </button>
                </div>
            </div>
        );
    };

    // --- Question Renderer ---
    const renderQuestion = (q) => {
        const questionIndex = filteredQuestions.findIndex(item => item.id === q.id);
        const totalQuestions = filteredQuestions.length;

        if (q.type === 'number') {
            // Renders the age input
            return (
                <div className="input-group">
                    <input
                        type="number"
                        min={q.min}
                        max={q.max}
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="input-field large-input"
                        placeholder="Enter Age"
                    />
                </div>
            );
        } else if (q.type === 'select') {
             // Renders the sex selection
            return (
                <div className="input-group">
                    <select
                        value={answers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="select-field large-select"
                    >
                        <option value="" disabled>Select an option</option>
                        {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            );
        } else if (q.type === 'radio') {
            // Renders Yes/No radio buttons
            return (
                <div className="radio-group">
                    {q.options.map(opt => (
                        <label key={opt} className="radio-label">
                            <input
                                type="radio"
                                name={q.id}
                                value={opt}
                                checked={answers[q.id] === opt}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            );
        }
    };


    // --- Main Component Render ---
    return (
        <div className="risk-check-page container">
            <h1 className="page-title">Cancer Risk Assessment</h1>
            <p className="page-subtitle">Answer these questions to understand your personal risk level.</p>

            {/* Display Result or Questions */}
            {result ? (
                renderResult()
            ) : (
                <div className="quiz-container">
                    {/* Progress Indicator */}
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${((step + 1) / filteredQuestions.length) * 100}%` }}></div>
                        <span className="progress-text">
                            Question {filteredQuestions.findIndex(q => q.id === currentQuestion.id) + 1} of {filteredQuestions.length}
                        </span>
                    </div>

                    {/* Question Card */}
                    <div className="question-card">
                        <h2>{currentQuestion.label}</h2>
                        
                        {renderQuestion(currentQuestion)}

                        {validationError && <p className="error-message">{validationError}</p>}
                        
                        <div className="navigation-buttons">
                            <button 
                                onClick={handlePrev} 
                                disabled={step === 0} 
                                className="btn btn-secondary"
                            >
                                ← Previous
                            </button>
                            
                            <button 
                                onClick={handleNext} 
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading 
                                    ? 'Calculating...' 
                                    : (step === filteredQuestions.length - 1 ? 'Get Results' : 'Next →')
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskCheck;