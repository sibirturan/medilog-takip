// src/components/auth/Login.jsx içinde "Forgot Password?" linki ekle

<form onSubmit={handleLogin}>
  {/* ... existing code ... */}
  
  <button type="submit">Login</button>
  
  {/* ← YENİ */}
  <a href="/reset-password" className="forgot-password">
    Forgot Password?
  </a>
</form>
