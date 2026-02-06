import { useEffect, useState } from 'react';

function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.log("아직 배포 전이라 로컬에선 에러가 날 수 있어요:", err));
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>ilwoobae studio</h1>
      <p>현재 DB 연결 테스트 중입니다.</p>
      {projects.length > 0 ? (
        projects.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', margin: '10px', padding: '10px' }}>
            <h2>{p.title}</h2>
            <p>{p.description}</p>
          </div>
        ))
      ) : (
        <p>데이터를 불러오는 중이거나, 로컬 환경이라 API를 찾지 못하고 있습니다.</p>
      )}
    </div>
  );
}

export default App;