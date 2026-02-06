import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css'; 

function Admin() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);

  // --- 1. 데이터 불러오기 함수 (re-usable) ---
  const fetchData = useCallback(async () => {
    try {
      const [gRes, cRes, pRes] = await Promise.all([
        fetch('/api?type=groups'),
        fetch('/api?type=categories'),
        fetch('/api?type=posts')
      ]);

      // 만약 하나라도 401이면 로그인 페이지로 튕김
      if (gRes.status === 401) {
        navigate('/login');
        return;
      }

      setGroups(await gRes.json());
      setCategories(await cRes.json());
      setPosts(await pRes.json());
    } catch (err) {
      console.error("Data load failed:", err);
    }
  }, [navigate]);

  // --- 2. 초기 로드 시 실행 ---
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 3. 로그아웃 함수 ---
  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    try {
      const res = await fetch('/api?action=logout');
      if (res.ok) {
        alert("로그아웃 되었습니다.");
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- 4. 삭제 및 수정 함수 ---
  const deleteItem = async (target, id) => {
    if (!confirm(`Delete this ${target.slice(0, -1)}?`)) return;
    await fetch(`/api?id=${id}&target=${target}`, { method: 'DELETE' });
    fetchData();
  };

  const saveEdit = async (target, id, payload) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('action', `edit_${target.slice(0, -1)}`);
    Object.entries(payload).forEach(([key, val]) => formData.append(key, val));

    await fetch('/api', { method: 'PUT', body: formData });
    setEditingGroupId(null);
    setEditingCatId(null);
    fetchData();
  };

  return (
    <div className="admin-body">
      <header>
        <h1>ilwoobae studio dashboard</h1>
        {/* ✅ 로그아웃 함수 연결 */}
        <button id="logout-btn" onClick={handleLogout}>logout</button>
      </header>

      <main className="admin-container">
        {/* GROUPS */}
        <section className="admin-section" id="group-manager" style={{ width: '20vw' }}>
          <div className="section-header">
            <h2>📁 groups</h2>
            <button className="btn-add" onClick={() => navigate('/editor?type=group')}>add</button>
          </div>
          <div className="list-scroll-area">
            <ul className="list-container">
              {groups.map(group => (
                <li key={group.id} className="group-item">
                  {editingGroupId === group.id ? (
                    <div className="group-edit-form">
                      <input 
                        type="text" 
                        defaultValue={group.name} 
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit('groups', group.id, { name: e.target.value })}
                        autoFocus
                      />
                      <button onClick={(e) => saveEdit('groups', group.id, { name: e.target.previousSibling.value })}>save</button>
                    </div>
                  ) : (
                    <div className="group-display">
                      <span onClick={() => setEditingGroupId(group.id)}>{group.name}</span>
                      <button className="btn-delete" onClick={() => deleteItem('groups', group.id)}>🗑️</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="admin-section" id="category-manager" style={{ width: '30vw' }}>
          <div className="section-header">
            <h2>🏷️ categories</h2>
            <button className="btn-add" onClick={() => navigate('/editor?type=category')}>add</button>
          </div>
          <div className="list-scroll-area">
            <ul className="list-container">
              {categories.map(cat => (
                <li key={cat.id} className="cat-item">
                  {editingCatId === cat.id ? (
                    <div className="cat-edit-form">
                      <input id={`edit-name-${cat.id}`} defaultValue={cat.name} />
                      <textarea id={`edit-desc-${cat.id}`} defaultValue={cat.description}></textarea>
                      <button onClick={() => saveEdit('categories', cat.id, {
                        name: document.getElementById(`edit-name-${cat.id}`).value,
                        description: document.getElementById(`edit-desc-${cat.id}`).value,
                        group_id: cat.group_id
                      })}>save</button>
                    </div>
                  ) : (
                    <div className="cat-info" onClick={() => setEditingCatId(cat.id)}>
                      <strong>{cat.name}</strong>
                      <p>{cat.description}</p>
                    </div>
                  )}
                  <button className="btn-delete" onClick={() => deleteItem('categories', cat.id)}>🗑️</button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ARCHIVE (POSTS) */}
        <section className="admin-section archive-section" id="post-archive" style={{ width: '45vw' }}>
          <div className="section-header">
            <h2>🖋️ archive</h2>
            <button className="btn-new-post" onClick={() => navigate('/editor?type=post')}>new post</button>
          </div>
          <div className="list-scroll-area">
            <table className="archive-table">
              <thead>
                <tr>
                  <th className="col-cat">cat.</th>
                  <th className="col-title">title</th>
                  <th className="col-manage"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td className="col-cat">{post.category_name || '-'}</td>
                    <td className="col-title" onClick={() => navigate(`/editor?type=post&id=${post.id}`)}>
                      {post.title}
                    </td>
                    <td className="col-manage">
                      <button className="btn-delete" onClick={() => deleteItem('posts', post.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;