import { useState, useEffect } from 'react';

function Admin() {
  const [view, setView] = useState('posts'); 
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // 수정 중인 아이템 저장
  
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    const res = await fetch(`/api?type=${view}`);
    setData(await res.json());
    const gRes = await fetch('/api?type=groups');
    setGroups(await gRes.json());
    const cRes = await fetch('/api?type=categories');
    setCategories(await cRes.json());
  };

  useEffect(() => { fetchData(); }, [view]);

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const method = editingItem ? 'PUT' : 'POST';
    
    // 액션 결정 logic
    let actionPrefix = editingItem ? 'edit_' : 'add_';
    let actionType = view === 'groups' ? 'group' : view === 'categories' ? 'category' : 'post';
    formData.append('action', actionPrefix + actionType);
    if(editingItem) formData.append('id', editingItem.id);

    await fetch('/api', { method, body: formData });
    closeModal();
    fetchData();
  };

  const onDelete = async (id) => {
    if(!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api?id=${id}&target=${view}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>ilwoobae studio 관리자</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {['groups', 'categories', 'posts'].map(type => (
          <button key={type} onClick={() => setView(type)} style={{ padding: '8px 16px', cursor: 'pointer', background: view === type ? '#333' : '#eee', color: view === type ? '#fff' : '#000' }}>
            {type.toUpperCase()} 관리
          </button>
        ))}
      </div>

      <button onClick={() => openModal()} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        + 새 {view.slice(0, -1)} 등록
      </button>

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>내용</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', width: '150px' }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.name || item.title}</td>
              <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                <button onClick={() => openModal(item)} style={{ marginRight: '5px' }}>수정</button>
                <button onClick={() => onDelete(item.id)} style={{ color: 'red' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingItem ? '수정하기' : '새로 등록'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {view === 'groups' && (
                <input name="name" placeholder="그룹 이름" defaultValue={editingItem?.name} required />
              )}

              {view === 'categories' && (
                <>
                  <select name="group_id" defaultValue={editingItem?.group_id} required>
                    <option value="">그룹 선택</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  <input name="name" placeholder="카테고리 이름" defaultValue={editingItem?.name} required />
                  <textarea name="description" placeholder="설명" defaultValue={editingItem?.description} />
                </>
              )}

              {view === 'posts' && (
                <>
                  <select name="category_id" defaultValue={editingItem?.category_id} required>
                    <option value="">카테고리 선택</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input name="title" placeholder="제목" defaultValue={editingItem?.title} required />
                  {!editingItem && <input type="file" name="file" />}
                  <textarea name="description" placeholder="설명" defaultValue={editingItem?.description} />
                  <input name="info1" placeholder="Info 1" defaultValue={editingItem?.info1} />
                  <input name="info2" placeholder="Info 2" defaultValue={editingItem?.info2} />
                  <input name="info3" placeholder="Info 3" defaultValue={editingItem?.info3} />
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none' }}>저장</button>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none' }}>취on취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;