import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Squircle } from '@squircle-js/react';
import './Editor.css'; 

function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('type') || 'post';
  const postId = searchParams.get('id');

  const SQ_RADIUS = 14; 
  const SQ_SMOOTH = 0.8;

  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: '', categoryId: '', groupId: '', description: '',
    info1: '', info2: '', info3: ''
  });

  useEffect(() => {
    const initData = async () => {
      const [gRes, cRes] = await Promise.all([
        fetch('/api?type=groups'),
        fetch('/api?type=categories')
      ]);
      setGroups(await gRes.json());
      setCategories(await cRes.json());
      if (postId) {
        const pRes = await fetch('/api?type=posts');
        const posts = await pRes.json();
        const post = posts.find(p => p.id === parseInt(postId));
        if (post) {
          setFormData({
            title: post.title, categoryId: post.category_id,
            description: post.description, info1: post.info1,
            info2: post.info2, info3: post.info3
          });
          if (post.file_url) setPreviewUrls([post.file_url]);
        }
      }
    };
    initData();
  }, [postId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const action = postId ? `edit_${mode}` : `add_${mode}`;
    data.append('action', action);
    if (postId) data.append('id', postId);

    if (mode === 'group') {
        data.append('name', formData.title);
    } else if (mode === 'category') {
        data.append('group_id', formData.groupId);
        data.append('name', formData.title);
        data.append('description', formData.description);
    } else {
        data.append('category_id', formData.categoryId);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('info1', formData.info1);
        data.append('info2', formData.info2);
        data.append('info3', formData.info3);
        if (selectedFiles[0]) data.append('file', selectedFiles[0]);
    }

    const res = await fetch('/api', { method: postId ? 'PUT' : 'POST', body: data });
    if (res.ok) { alert(`${mode} saved!`); navigate('/admin'); }
  };

  // 공통 입력창 스타일 (Squircle 내부용)
  const inputBaseStyle = {
    border: 'none',
    outline: 'none',
    width: '100%',
    height: '100%',
    background: 'transparent',
    padding: '0 12px', // 요청하신 12px 패딩
    fontSize: '12px',
    letterSpacing: '-0.02em',
    position: 'relative',
    zIndex: 10,
    cursor: 'text'
  };

  return (
    <div className="admin-page">
      <div className="editor-container">
        <header className="editor-header">
          <h2 id="editor-title">{postId ? `edit ${mode}` : `new ${mode}`}</h2>
        </header>

        <form id="editor-form" onSubmit={handleSave}>
          {/* 1. 카테고리 선택 */}
          {(mode === 'category' || mode === 'post') && (
            <div className="editor-section">
              <Squircle cornerRadius={10} cornerSmoothing={0.8} className="sq-input-wrapper">
                <select
                  value={mode === 'category' ? formData.groupId : formData.categoryId}
                  onChange={e => setFormData({...formData, [mode === 'category' ? 'groupId' : 'categoryId']: e.target.value})}
                  required
                  style={{...inputBaseStyle, cursor: 'pointer'}}
                >
                  <option value="">select {mode === 'category' ? 'group' : 'category'}</option>
                  {(mode === 'category' ? groups : categories).map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </Squircle>
            </div>
          )}

          {/* 2. 제목 입력 (높이 31px) */}
          <div className="editor-section">
            <Squircle cornerRadius={10} cornerSmoothing={0.8} className="sq-input-wrapper">
              <input type="text" placeholder="enter title" value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})} required style={inputBaseStyle} />
            </Squircle>
          </div>

          {/* 3. 파일 업로드 (우측 정렬 & 다중 선택) */}
          {mode === 'post' && (
            <div className="editor-section upload-area">
              <div className="file-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', letterSpacing: '-0.02em' }}>contents</span>
                <input type="file" id="post-files" multiple onChange={handleFileChange} accept="image/*, video/*, .pdf" style={{ display: 'none' }} />
                <Squircle as="label" htmlFor="post-files" cornerRadius={8} cornerSmoothing={0.8} className="custom-file-btn">
                  upload files
                </Squircle>
              </div>
              <Squircle cornerRadius={14} cornerSmoothing={0.8} className="file-upload-section">
                <div id="preview-container" className="preview-grid">
                  {previewUrls.map((url, idx) => (
                    <Squircle key={idx} cornerRadius={6} cornerSmoothing={0.8} className="preview-item">
                      {url.includes('pdf') ? <div className="file-icon">📄</div> : <img src={url} alt="preview" />}
                    </Squircle>
                  ))}
                </div>
              </Squircle>
            </div>
          )}

          {/* 4. 설명 (Textarea) */}
          {mode !== 'group' && (
            <div className="editor-section">
              <Squircle cornerRadius={12} cornerSmoothing={0.8} className="sq-input-wrapper" style={{height: 'auto'}}>
                <textarea placeholder="enter description" value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ ...inputBaseStyle, height: '180px', padding: '12px' }}
                />
              </Squircle>
            </div>
          )}

          {/* 5. 상세 정보 (높이 31px) */}
          {mode === 'post' && (
            <div className="info-fields">
              {['materials', 'size', 'date / year'].map((label, i) => (
                <Squircle key={i} cornerRadius={10} cornerSmoothing={0.8} className="sq-input-wrapper">
                  <input type="text" placeholder={label} value={formData[`info${i+1}`]}
                    onChange={e => setFormData({...formData, [`info${i+1}`]: e.target.value})} style={inputBaseStyle} />
                </Squircle>
              ))}
            </div>
          )}

          {/* 6. 버튼 영역 */}
          <div className="editor-buttons">
            <Squircle as="button" type="submit" cornerRadius={10} cornerSmoothing={0.8} className="btn-primary">save</Squircle>
            <Squircle as="button" type="button" cornerRadius={10} cornerSmoothing={0.8} className="btn-secondary" onClick={() => navigate(-1)}>cancel</Squircle>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Editor;