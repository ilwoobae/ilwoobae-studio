import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // CSS 파일이 있다면 임포트

function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- 1. 이미 로그인된 상태인지 체크 ---
  useEffect(() => {
    const checkAlreadyLoggedIn = async () => {
      // 아무 관리자 전용 API나 호출해봅니다.
      const res = await fetch('/api?type=groups');
      if (res.ok) {
        // 성공(200)하면 이미 쿠키가 있는 것이므로 대시보드로 보냅니다.
        navigate('/admin');
      }
    };
    checkAlreadyLoggedIn();
  }, [navigate]);

  // --- 2. 로그인 시도 함수 ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api?action=login', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' }
      });
        
      if (res.ok) {
        navigate('/admin');
      } else {
        alert('incorrect password.');
        setPassword(''); // 틀렸을 때 입력창 비워주기
      }
    } catch (err) {
      console.error("Login request failed:", err);
      alert("서버 연결에 실패했습니다.");
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
            required
          />
          <button type="submit" id="login-btn">login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;