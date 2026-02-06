import { useState, useEffect } from 'react';

function Admin() {
  const [view, setView] = useState('posts'); // 현재 볼 목록 (groups, categories, posts)
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 폼 상태 관리
  const [groups, setGroups] = useState([]); // 카테고리 등록 시 선택용
  const [categories, setCategories] = useState([]); // 포스트 등록 시 선택용

  // 데이터 불러오기
  const fetchData = async () => {
    const res = await fetch(`/api?type=${view}`);
    const result = await res.json();
    setData(result);

    // 등록 창을 위해 그룹과 카테고리 목록도 미리 가져옴
    const gRes = await fetch('/api?type=groups');
    setGroups(await gRes.json());
    const cRes = await fetch('/api?type=categories');
    setCategories(await cRes.json());
  };

  useEffect(() => { fetchData(); }, [view]);

  // 삭제 함수
  const onDelete = async (id) => {
    if(!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api?id=${id}&target=${view}`, { method: 'DELETE' });
    fetchData();
  };

  // 등록 제출 함수
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 어떤 작업인지 구분 (add_group, add_category, add_post)
    if (view === 'groups') formData.append('action', 'add_group');
    else if (view === 'categories') formData.append('action', 'add_category');
    else formData.append('action', 'add_post');

    await fetch('/api', { method: 'POST', body: formData });
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>ilwoobae studio 관리자</h1>
      
      {/* 상단 탭 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setView('groups')}>그룹 관리</button>
        <button onClick={() => setView('categories')}>카테고리 관리</button>
        <button onClick={() => setView('posts')}>포스트 관리</button>
      </div>

      <button 
        style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        onClick={() => setIsModalOpen(true)}
      >
        + 새 {view === 'groups' ? '그룹' : view === 'categories' ? '카테고리' : '포스트'} 등록
      </button>

      {/* 목록 출력 */}
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>ID / 제목</th>
            <th style={{ border: '1px solid #ddd', padding: '10px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.name || item.title}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                <button onClick={() => onDelete(item.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 등록 모달창 (팝업) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>새 {view} 추가</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* 그룹 등록 시 */}
              {view === 'groups' && (
                <input name="name" placeholder="그룹 이름" required />
              )}

              {/* 카테고리 등록 시 */}
              {view === 'categories' && (
                <>
                  <select name="group_id" required>
                    <option value="">그룹 선택</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <input name="name" placeholder="카테고리 이름" required />
                  <textarea name="description" placeholder="카테고리 설명" />
                </>
              )}

              {/* 포스트 등록 시 */}
              {view === 'posts' && (
                <>
                  <select name="category_id" required>
                    <option value="">카테고리 선택</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input name="title" placeholder="포스트 제목" required />
                  <input type="file" name="file" />
                  <textarea name="description" placeholder="포스트 설명" />
                  <input name="info1" placeholder="Info 1 (예: Date)" />
                  <input name="info2" placeholder="Info 2 (예: Client)" />
                  <input name="info3" placeholder="Info 3 (예: Tools)" />
                </>
              )}

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none' }}>저장</button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none' }}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;