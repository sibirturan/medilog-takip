// src/routes.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { PasswordReset } from './components/auth/PasswordReset'; // ← YENİ
import { Dashboard } from './pages/Dashboard';
// ... other imports

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<PasswordReset />} /> {/* ← YENİ */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
};
