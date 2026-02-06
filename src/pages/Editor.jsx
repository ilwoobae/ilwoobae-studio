import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Editor.css'; 

function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL 파라미터 추출
  const mode = searchParams.get('type') || 'post';
  const postId = searchParams.get('id');

  // 상태 관리
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // 신규 업로드 파일
  const [previewUrls, setPreviewUrls] = useState([]); // 미리보기용 주소
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    groupId: '',
    description: '',
    info1: '',
    info2: '',
    info3: ''
  });

  // 1. 초기 데이터(그룹, 카테고리) 로드
  useEffect(() => {
    const initData = async () => {
      const [gRes, cRes] = await Promise.all([
        fetch('/api?type=groups'),
        fetch('/api?type=categories')
      ]);
      setGroups(await gRes.json());
      setCategories(await cRes.json());

      // 수정 모드일 경우 기존 데이터 불러오기
      if (postId) {
        const pRes = await fetch('/api?type=posts');
        const posts = await pRes.json();
        const post = posts.find(p => p.id === parseInt(postId));
        if (post) {
          setFormData({
            title: post.title,
            categoryId: post.category_id,
            description: post.description,
            info1: post.info1,
            info2: post.info2,
            info3: post.info3
          });
          if (post.file_url) setPreviewUrls([post.file_url]);
        }
      }
    };
    initData();
  }, [postId]);

  // 2. 파일 선택 핸들러 (미리보기 포함)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  // 3. 저장 로직
  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // 모드별 액션 및 데이터 설정
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

    const method = postId ? 'PUT' : 'POST';
    const res = await fetch('/api', { method, body: data });
    
    if (res.ok) {
      alert(`${mode} saved!`);
      navigate('/admin');
    }
  };

  return (
    <div className="admin-page">
      <div className="editor-container">
        <header className="editor-header">
          <h2 id="editor-title">{postId ? `edit ${mode}` : `new ${mode}`}</h2>
        </header>

        <form id="editor-form" onSubmit={handleSave}>
          {/* 그룹 선택 (카테고리 등록 시에만 노출) */}
          {mode === 'category' && (
            <div className="editor-section">
              <select 
                value={formData.groupId} 
                onChange={e => setFormData({...formData, groupId: e.target.value})}
                required
              >
                <option value="">select group</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {/* 카테고리 선택 (포스트 등록 시에만 노출) */}
          {mode === 'post' && (
            <div className="editor-section">
              <select 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                required
              >
                <option value="">select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* 공통 제목 입력 */}
          <div className="editor-section">
            <input 
              type="text" 
              placeholder="enter title" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          {/* 파일 업로드 (포스트 모드 전용) */}
          {mode === 'post' && (
            <div className="editor-section upload-area">
              <div className="file-header">
                <span>contents</span>
                <label htmlFor="post-files" className="custom-file-btn">upload files</label>
              </div>
              <div className="file-upload-section">
                <input 
                  type="file" id="post-files" 
                  onChange={handleFileChange}
                  accept="image/*, video/*, .pdf" style={{ display: 'none' }} 
                />
                <div id="preview-container" className="preview-grid">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="preview-item">
                      {url.includes('pdf') ? (
                        <div className="file-icon">📄 pdf</div>
                      ) : (
                        <img src={url} alt="preview" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 설명 입력 (그룹 제외) */}
          {mode !== 'group' && (
            <div className="editor-section">
              <textarea 
                placeholder="enter description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          )}

          {/* 상세 정보 (포스트 전용) */}
          {mode === 'post' && (
            <div className="info-fields">
              <div className="info-input-wrapper">
                <input type="text" placeholder="materials" value={formData.info1} onChange={e => setFormData({...formData, info1: e.target.value})} />
              </div>
              <div className="info-input-wrapper">
                <input type="text" placeholder="size" value={formData.info2} onChange={e => setFormData({...formData, info2: e.target.value})} />
              </div>
              <div className="info-input-wrapper">
                <input type="text" placeholder="date / year" value={formData.info3} onChange={e => setFormData({...formData, info3: e.target.value})} />
              </div>
            </div>
          )}

          <div className="editor-buttons">
            <button type="submit" className="btn-primary">save</button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Editor;