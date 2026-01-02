// src/pages/Settings.jsx

import { CustomerPortal } from '../components/payment/CustomerPortal';

export const Settings = () => {
  return (
    <div className="settings-page">
      <h1>⚙️ Settings</h1>
      
      {/* Subscription Management */}
      <CustomerPortal />
      
      {/* Other settings */}
      <div className="settings-section">
        {/* ... existing settings ... */}
      </div>
    </div>
  );
};
