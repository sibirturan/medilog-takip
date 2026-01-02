// src/components/auth/EmailVerification.jsx

import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import './EmailVerification.css';

export const EmailVerification = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-verification-banner">
      <div className="banner-content">
        <span className="icon">📧</span>
        <div className="text">
          <strong>Verify your email</strong>
          <p>Please check your inbox and verify your email to access all features.</p>
        </div>
        <button 
          onClick={handleResendEmail}
          disabled={loading || sent}
          className="resend-btn"
        >
          {loading ? '⏳ Sending...' : sent ? '✅ Sent!' : '📨 Resend Email'}
        </button>
      </div>
    </div>
  );
};
