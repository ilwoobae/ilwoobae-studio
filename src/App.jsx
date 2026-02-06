import { useEffect, useState } from 'react';

function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>ilwoobae studio</h1>
      <p style={{ color: '#666' }}>DB와 R2가 연결된 실시간 포트폴리오입니다.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
        {projects.length > 0 ? (
          projects.map((p) => (
            <div key={p.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '15px', maxWidth: '600px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 10px 0' }}>{p.title}</h2>
              <p style={{ color: '#444' }}>{p.description}</p>
              
              {/* 핵심: 이미지 주소가 있으면 이미지를 보여줌 */}
              {p.image_url ? (
                <img 
                  src={p.image_url} 
                  alt={p.title} 
                  style={{ width: '100%', borderRadius: '10px', marginTop: '15px' }} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
                />
              ) : (
                <p style={{ fontSize: '0.8rem', color: '#999' }}>이미지가 등록되지 않았습니다.</p>
              )}
            </div>
          ))
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
      </div>
    </div>
  );
}

export default App;