// src/components/dashboard/Dashboard.jsx

import { useAuth } from '../../hooks/useAuth';
import { EmailVerification } from '../auth/EmailVerification';
import { TrialCountdown } from './TrialCountdown';

export const Dashboard = () => {
  const { user, userData } = useAuth();

  return (
    <div className="dashboard">
      {/* Email doğrulanmadıysa banner göster */}
      {!user.emailVerified && <EmailVerification user={user} />}
      
      {/* Trial countdown */}
      {userData?.isPremium && userData?.trialEndsAt && (
        <TrialCountdown trialEndsAt={userData.trialEndsAt} />
      )}
      
      {/* Rest of dashboard */}
      <div className="stats-grid">
        {/* ... existing code ... */}
      </div>
    </div>
  );
};
