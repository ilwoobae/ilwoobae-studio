import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Main from './pages/Main';
import Admin from './pages/Admin';
import Editor from './pages/Editor';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      {/* 네비게이션 바: 필요에 따라 디자인을 유지하거나 수정하세요 */}
      <nav style={{ padding: '20px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Home</Link>
        <Link to="/admin" style={{ textDecoration: 'none', color: '#333' }}>Admin</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/admin" element={<Admin />} />
        {/* 2. Editor 경로 추가 (등록/수정 공용) */}
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;