import { useState } from 'react';

function Admin() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleUpload = () => {
    // 여기서 나중에 D1과 R2로 데이터를 보내는 마법을 부릴 겁니다!
    alert(`${title} 등록 시도!`);
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Studio 관리자 전용</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input placeholder="작품 제목" onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="작품 설명" onChange={e => setDesc(e.target.value)} />
        <input type="file" />
        <button onClick={handleUpload}>등록하기</button>
      </div>
    </div>
  );
}

export default Admin;