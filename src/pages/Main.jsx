import { useEffect, useState } from 'react';

function Main() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Main Page</h1>
      {/* 여기에 아까 만든 리스트 출력 코드가 들어가겠죠? */}
    </div>
  );
}

export default Main; // <--- 이 줄이 반드시 있어야 합니다!