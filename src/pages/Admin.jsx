import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 만약 CSS 파일 이름이 다르면 프로젝트에 맞게 수정하세요.
import './Admin.css'; 

function Admin() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  
  // 인라인 수정을 위한 상태 (현재 수정 중인 ID 저장)
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);

  // 데이터 로드
  const fetchData = async () => {
    const [gRes, cRes, pRes] = await Promise.all([
      fetch('/api?type=groups'),
      fetch('/api?type=categories'),
      fetch('/api?type=posts')
    ]);
    setGroups(await gRes.json());
    setCategories(await cRes.json());
    setPosts(await pRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  // 삭제 공통 함수
  const deleteItem = async (target, id) => {
    if (!confirm(`delete this ${target.slice(0, -1)}?`)) return;
    await fetch(`/api?id=${id}&target=${target}`, { method: 'DELETE' });
    fetchData();
  };

  // 그룹/카테고리 수정 저장 함수
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
    <div className="admin-body"> {/* 기존 body 스타일 적용용 */}
      <header>
        <h1>ilwoobae studio dashboard</h1>
        <button id="logout-btn" onClick={() => alert('Logout logic here')}>logout</button>
      </header>

      <main className="admin-container">
        {/* 1. GROUPS SECTION (20vw) */}
        <section className="admin-section" id="group-manager" style={{ width: '20vw' }}>
          <div className="section-header">
            <h2>📁 groups</h2>
            <button className="btn-add" onClick={() => navigate('/editor?type=group')}>add group</button>
          </div>
          <div className="list-scroll-area">
            <ul id="group-list" className="list-container">
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
                      <div className="edit-actions">
                        <button onClick={(e) => saveEdit('groups', group.id, { name: e.target.previousSibling.value })} className="btn-add">save</button>
                        <button onClick={() => setEditingGroupId(null)} className="btn-del">cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group-display">
                      <span onClick={() => setEditingGroupId(group.id)} style={{ cursor: 'pointer' }}>{group.name}</span>
                      <button className="btn-delete" onClick={() => deleteItem('groups', group.id)}>🗑️</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. CATEGORIES SECTION (35vw) */}
        <section className="admin-section" id="category-manager" style={{ width: '35vw' }}>
          <div className="section-header">
            <h2>🏷️ categories</h2>
            <button className="btn-add" onClick={() => navigate('/editor?type=category')}>add category</button>
          </div>
          <div className="list-scroll-area">
            <ul id="category-list" className="list-container">
              {categories.map(cat => (
                <li key={cat.id} className={`cat-item ${editingCatId === cat.id ? 'editing' : ''}`}>
                  {editingCatId === cat.id ? (
                    <div className="cat-edit-form">
                      <input type="text" id={`edit-name-${cat.id}`} defaultValue={cat.name} />
                      <textarea id={`edit-desc-${cat.id}`} defaultValue={cat.description}></textarea>
                      <div className="edit-actions">
                        <button onClick={() => saveEdit('categories', cat.id, {
                          name: document.getElementById(`edit-name-${cat.id}`).value,
                          description: document.getElementById(`edit-desc-${cat.id}`).value,
                          group_id: cat.group_id
                        })} className="btn-add">save</button>
                        <button onClick={() => setEditingCatId(null)} className="btn-del">cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="cat-info">
                      <strong onClick={() => setEditingCatId(cat.id)}>{cat.name}</strong>
                      {cat.description && <p onClick={() => setEditingCatId(cat.id)}>{cat.description}</p>}
                    </div>
                  )}
                  <button className="btn-delete" onClick={() => deleteItem('categories', cat.id)}>🗑️</button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. ARCHIVE SECTION (45vw) */}
        <section className="admin-section archive-section" id="post-archive" style={{ width: '45vw' }}>
          <div className="section-header">
            <h2>🖋️ archive</h2>
            <button className="btn-new-post" onClick={() => navigate('/editor?type=post')}>add post</button>
          </div>
          <div className="list-scroll-area">
            <table className="archive-table">
              <thead>
                <tr>
                  <th className="col-cat">cat.</th>
                  <th className="col-title">title</th>
                  <th className="col-date">date</th>
                  <th className="col-manage"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td className="col-cat">{post.category_name || '-'}</td>
                    <td className="col-title title-cell" onClick={() => navigate(`/editor?type=post&id=${post.id}`)}>
                      {post.title}
                    </td>
                    <td className="col-date">
                      {post.date ? new Date(post.date).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit' }) : '-'}
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