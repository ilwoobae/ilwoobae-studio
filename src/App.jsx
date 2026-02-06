import { useEffect, useState } from 'react';
import './App.css'; // 기본 스타일 유지를 위해 추가

function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cloudflare Pages Functions로 만든 /api 주소 호출
    fetch('/api')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>ilwoobae studio</h1>
        <p>Status: {loading ? "데이터 불러오는 중..." : "D1 DB 연결 완료"}</p>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {projects.length > 0 ? (
          projects.map((p) => (
            <div key={p.id} className="card" style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              {p.image_url && <img src={p.image_url} alt={p.title} style={{ maxWidth: '100%' }} />}
            </div>
          ))
        ) : (
          !loading && <p>등록된 프로젝트가 없습니다. DB에 데이터를 추가해 보세요!</p>
        )}
      </main>
    </div>
  );
}

export default App;