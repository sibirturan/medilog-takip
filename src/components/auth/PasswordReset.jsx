// src/components/auth/PasswordReset.jsx

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import './PasswordReset.css';

export const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="password-reset-container">
        <div className="success-message">
          <span className="icon">✅</span>
          <h2>Email Sent!</h2>
          <p>Check your inbox for password reset instructions.</p>
          <a href="/login" className="back-link">← Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <h2>🔐 Reset Password</h2>
        <p>Enter your email to receive reset instructions</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
          </button>
        </form>
        
        <a href="/login" className="back-link">← Back to Login</a>
      </div>
    </div>
  );
};
