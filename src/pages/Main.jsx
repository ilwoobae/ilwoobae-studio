import { useEffect, useState } from 'react';

function Main() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // 서버(api.js)에서 데이터 가져오기
    fetch('/api')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>ilwoobae studio</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {projects.map((p) => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '15px', width: '100%', maxWidth: '500px' }}>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
            {p.image_url && (
              <img src={p.image_url} alt={p.title} style={{ width: '100%', borderRadius: '10px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Main;