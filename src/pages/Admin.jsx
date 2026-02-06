import { useState } from 'react';

function Admin() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !file) return alert("제목과 파일을 확인해주세요!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('file', file);

    try {
      const res = await fetch('/api', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert("업로드 성공!");
        window.location.href = "/"; // 메인 페이지로 이동
      } else {
        alert("업로드 실패");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Work Upload</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="작품 제목" value={title} onChange={e => setTitle(e.target.value)} style={{padding: '10px'}} />
        <textarea placeholder="작품 설명" value={desc} onChange={e => setDesc(e.target.value)} style={{padding: '10px', height: '100px'}} />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button 
          onClick={handleUpload} 
          disabled={loading}
          style={{ padding: '15px', backgroundColor: '#000', color: '#fff', cursor: 'pointer' }}
        >
          {loading ? "업로드 중..." : "프로젝트 등록하기"}
        </button>
      </div>
    </div>
  );
}

export default Admin;