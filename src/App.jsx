import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Main from './pages/Main';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '20px', textAlign: 'right' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;