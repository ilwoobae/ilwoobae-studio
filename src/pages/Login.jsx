import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      navigate('/admin');
    } else {
      alert('incorrect password.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login-title">ilwoobae studio admin</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" id="login-btn">login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;