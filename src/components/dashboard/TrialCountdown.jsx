// src/components/dashboard/TrialCountdown.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrialCountdown.css';

export const TrialCountdown = ({ trialEndsAt }) => {
  const [daysLeft, setDaysLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const calculateDaysLeft = () => {
      const now = new Date().getTime();
      const trialEnd = trialEndsAt?.toDate?.() || new Date(trialEndsAt);
      const diff = trialEnd - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Her saat güncelle

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  if (daysLeft <= 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <div className={`trial-countdown ${isUrgent ? 'urgent' : ''}`}>
      <div className="countdown-content">
        <span className="icon">{isUrgent ? '⚠️' : '⏰'}</span>
        <div className="text">
          <strong>
            {daysLeft === 1 
              ? 'Last day of your free trial!' 
              : `${daysLeft} days left in your free trial`}
          </strong>
          <p>Upgrade now to continue enjoying premium features</p>
        </div>
        <button 
          onClick={() => navigate('/pricing')}
          className="upgrade-btn"
        >
          🚀 Upgrade Now
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(daysLeft / 14) * 100}%` }}
        />
      </div>
    </div>
  );
};
