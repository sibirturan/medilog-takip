// src/components/payment/CustomerPortal.jsx

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './CustomerPortal.css';

export const CustomerPortal = () => {
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: userData.stripeCustomerId,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open customer portal');
    } finally {
      setLoading(false);
    }
  };

  if (!userData?.isPremium) {
    return null;
  }

  return (
    <div className="customer-portal-card">
      <h3>💳 Subscription Management</h3>
      <p>Manage your billing, payment method, and subscription</p>
      
      <button 
        onClick={handleManageSubscription}
        disabled={loading}
        className="portal-btn"
      >
        {loading ? '⏳ Loading...' : '⚙️ Manage Subscription'}
      </button>
    </div>
  );
};
