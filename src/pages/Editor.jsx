import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Squircle } from '@squircle-js/react'; // 공식 라이브러리 임포트
import './Editor.css'; 

function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('type') || 'post';
  const postId = searchParams.get('id');

  // --- ilwoobae studio 스쿼클 설정 ---
  // 너무 둥글지 않으면서도 쫀득한 느낌의 수치입니다.
  const SQ_RADIUS = 14; 
  const SQ_SMOOTH = 0.8; // 0.6~0.8 사이가 가장 세련되어 보입니다.

  // ... (기존 데이터 로드 및 핸들러 로직은 동일) ...
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

  return (
    <div className="admin-page">
      <div className="editor-container">
        <header className="editor-header">
          <h2 id="editor-title">{postId ? `edit ${mode}` : `new ${mode}`}</h2>
        </header>

        <form id="editor-form" onSubmit={handleSave}>
          {/* 그룹/카테고리 선택 */}
          {(mode === 'category' || mode === 'post') && (
            <div className="editor-section">
            <Squircle
              as="input"
              type="text"
              id="post-title"
              cornerRadius={SQ_RADIUS}
              cornerSmoothing={SQ_SMOOTH}
              placeholder="enter title" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          )}

          {/* 제목 입력 - 라인 스타일 유지 */}
          <div className="editor-section">
            <input type="text" id="post-title" placeholder="enter title" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
            />
          </div>

          {/* 파일 업로드 섹션 */}
          {mode === 'post' && (
            <div className="editor-section upload-area">
              <div className="file-header">
                <span>contents</span>
                <Squircle as="label" htmlFor="post-files" cornerRadius={8} cornerSmoothing={SQ_SMOOTH} className="custom-file-btn">
                  upload files
                </Squircle>
              </div>
              <Squircle cornerRadius={20} cornerSmoothing={SQ_SMOOTH} className="file-upload-section">
                <input type="file" id="post-files" onChange={handleFileChange} accept="image/*, video/*, .pdf" style={{ display: 'none' }} />
                <div id="preview-container" className="preview-grid">
                  {previewUrls.map((url, idx) => (
                    <Squircle key={idx} cornerRadius={10} cornerSmoothing={SQ_SMOOTH} className="preview-item">
                      {url.includes('pdf') ? <div className="file-icon">📄 pdf</div> : <img src={url} alt="preview" />}
                    </Squircle>
                  ))}
                </div>
              </Squircle>
            </div>
          )}

          {/* 설명 입력 */}
          {mode !== 'group' && (
            <div className="editor-section">
              <Squircle as="textarea" cornerRadius={SQ_RADIUS} cornerSmoothing={SQ_SMOOTH}
                placeholder="enter description" value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          )}

          {/* 상세 정보 */}
          {mode === 'post' && (
            <div className="info-fields">
              {['info1', 'info2', 'info3'].map((key, i) => (
                <Squircle key={key} as="input" type="text" cornerRadius={10} cornerSmoothing={SQ_SMOOTH}
                  placeholder={['materials', 'size', 'date / year'][i]}
                  value={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.value})}
                />
              ))}
            </div>
          )}

          <div className="editor-buttons">
            <Squircle as="button" type="submit" cornerRadius={14} cornerSmoothing={SQ_SMOOTH} className="btn-primary">save</Squircle>
            <Squircle as="button" type="button" cornerRadius={14} cornerSmoothing={SQ_SMOOTH} className="btn-secondary" onClick={() => navigate(-1)}>cancel</Squircle>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Editor;