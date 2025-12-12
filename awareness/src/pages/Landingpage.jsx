import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            
            {/* --- 1. Hero Section (Deep Blue Background with Wave) --- */}
            <header className="hero-section">
                
                {/* --- Hero Content & Risk Check Card Layout --- */}
                <div className="hero-layout">
                    
                    {/* Left Side: Text and Primary CTA */}
                    <div className="hero-text-container">
                        <h1>Your Journey to Better Health Starts Here</h1>
                        <p>Smart Health provides personalized risk assessment and tools to help you manage your wellness proactively.</p>
                        
                        {/* Primary Action Button (Orange in the mock-up) */}
                        <Link to="/risk-check" className="btn-primary-orange">
                            Learn More → 
                        </Link>
                    </div>

                    {/* Right Side: Risk Check Callout Card (Floating White Card) */}
                    <div className="risk-check-card">
                        <h3>Smaic Health Risk Check</h3>
                        <p>Receive your health Polk and jar ipsemto sibo opochum war lit. Take the assessment now to begin managing your health.</p>
                        
                        {/* Secondary Action Button (Blue Fill/Outline in the mock-up) */}
                        <Link to="/risk-check" className="btn-secondary-blue">
                            Learn More →
                        </Link>
                    </div>
                </div>
                
                {/* The wave structure is handled purely by CSS using the selector .hero-wave-separator */}
                <div className="hero-wave-separator"></div>
            </header>

            {/* --- 2. Core Features Section (Light Background) --- */}
            <section className="features-section">
                <h2>Key Features</h2>
                
                {/* The features grid is expanded to 3 columns to match the image */}
                <div className="features-grid">
                    
                    {/* Feature 1: Personalized Risk Check */}
                    <div className="feature-card">
                        <h3>Personalized Risk Check</h3>
                        <p>Evaluate your risk level for common conditions based on your lifestyle and health history.</p>
                        <Link to="/risk-check" className="feature-link">Learn More →</Link>
                    </div>

                    {/* Feature 2: Clinic Locator */}
                    <div className="feature-card">
                        <h3>Clinic Locator</h3>
                        <p>Easily locate verified health clinics and facilities in your area.</p>
                        <Link to="/clinic-locator" className="feature-link">Locate Clinics →</Link>
                    </div>

                    {/* Feature 3: Find Magify Clinic (Placeholder from image) */}
                    <div className="feature-card">
                        <h3>Lind Magify Clinic</h3>
                        <p>Find specialized clinics for advanced screenings and care.</p>
                        <Link to="/clinic-locator" className="feature-link">Learn More →</Link>
                    </div>
                    
                    {/* Feature 4: Progress Tracker */}
                    <div className="feature-card">
                        <h3>Progress Tracker</h3>
                        <p>Log in to view your assessment history, track changes in your risk score.</p>
                        <Link to="/progress" className="feature-link">View History →</Link>
                    </div>
                    
                    {/* Feature 5: Savings Goal (The one that takes the user to SavingsGoal) */}
                    <div className="feature-card">
                        <h3>Savings Goal</h3>
                        <p>Plan ahead by calculating the monthly savings needed for your next screening session.</p>
                        <Link to="/savings-goal" className="feature-link">Plan Finances →</Link>
                    </div>
                    
                    {/* Feature 6: Other placeholder feature for layout consistency */}
                    <div className="feature-card">
                        <h3>Track Health Progress</h3>
                        <p>Monitor key health metrics over time to visualize your improvement.</p>
                        <Link to="/progress" className="feature-link">Learn More →</Link>
                    </div>
                    
                </div>
            </section>
            
            {/* --- 3. Savings Goal Call-to-Action (Dual Card Section) --- */}
            <section className="savings-cta-section">
                <h2>Risk-Check CTA Section</h2>
                
                <div className="cta-cards-container">
                    
                    {/* CTA Card 1: SET A SAVINGS GOAL (Left Card) */}
                    <div className="cta-card">
                        <h3>TClinic Chee</h3>
                        <p>Start saving for your future screening sessions financial plan.</p>
                        
                        {/* Button Link to Savings Goal (Orange Button from image) */}
                        <Link to="/savings-goal" className="btn-primary-orange">
                            SET A SAVINGS GOAL
                        </Link>
                    </div>
                    
                    {/* CTA Card 2: Plan Ahead / Bbr Ae roy Soluse (Right Card) */}
                    <div className="cta-card">
                        <h3>Plan Ahead for Your Health</h3>
                        <p>Start saving for your future screening sessions financial plan.</p>
                        
                        {/* Button Link (Blue Button from image) */}
                        <Link to="/risk-check" className="btn-secondary-blue">
                            Bbr Ae roy Soluse 
                        </Link>
                    </div>
                    
                </div>
            </section>
            
        </div>
    );
};

export default LandingPage;