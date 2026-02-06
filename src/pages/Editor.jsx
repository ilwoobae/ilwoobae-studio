import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SmoothCorners } from 'react-smooth-corners';
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    groupId: '',
    description: '',
    info1: '',
    info2: '',
    info3: ''
  });

  // --- 스쿼클 상수 정의 (CSS 고정 크기에 최적화) ---
  const SQ_STD = "10, 2.2";   // 44px 높이 (입력창, 메인 버튼용) - 샤프한 느낌
  const SQ_SMALL = "8, 2";    // 36px 높이 (파일 업로드 버튼용)
  const SQ_BOX = "16, 3";     // 큰 박스 (업로드 영역, 이미지 프리뷰용)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api?type=groups');
      if (res.status === 401) navigate('/login');
    };
    checkAuth();
  }, [navigate]);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
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
          
          {/* 그룹/카테고리 선택 */}
          {(mode === 'category' || mode === 'post') && (
            <div className="editor-section">
              <SmoothCorners
                as="select"
                corners={SQ_STD}
                value={mode === 'category' ? formData.groupId : formData.categoryId}
                onChange={e => setFormData({...formData, [mode === 'category' ? 'groupId' : 'categoryId']: e.target.value})}
                required
              >
                <option value="">select {mode === 'category' ? 'group' : 'category'}</option>
                {(mode === 'category' ? groups : categories).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </SmoothCorners>
            </div>
          )}

          {/* 제목 입력 (제목은 라인 스타일이므로 일반 input 유지 혹은 스쿼클 적용 가능) */}
          <div className="editor-section">
            <input 
              type="text" 
              id="post-title"
              placeholder="enter title" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          {/* 파일 업로드 섹션 */}
          {mode === 'post' && (
            <div className="editor-section upload-area">
              <div className="file-header">
                <span>contents</span>
                <SmoothCorners
                  as="label"
                  htmlFor="post-files"
                  corners={SQ_SMALL}
                  className="custom-file-btn"
                >
                  upload files
                </SmoothCorners>
              </div>
              <SmoothCorners
                corners={SQ_BOX}
                className="file-upload-section"
              >
                <input 
                  type="file" id="post-files" 
                  onChange={handleFileChange}
                  accept="image/*, video/*, .pdf" style={{ display: 'none' }} 
                />
                <div id="preview-container" className="preview-grid">
                  {previewUrls.map((url, idx) => (
                    <SmoothCorners key={idx} corners={SQ_SMALL} className="preview-item">
                      {url.includes('pdf') ? (
                        <div className="file-icon">📄 pdf</div>
                      ) : (
                        <img src={url} alt="preview" />
                      )}
                    </SmoothCorners>
                  ))}
                </div>
              </SmoothCorners>
            </div>
          )}

          {/* 설명 입력 */}
          {mode !== 'group' && (
            <div className="editor-section">
              <SmoothCorners
                as="textarea"
                corners={SQ_STD}
                placeholder="enter description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          )}

          {/* 상세 정보 (포스트 전용) */}
          {mode === 'post' && (
            <div className="info-fields">
              {['info1', 'info2', 'info3'].map((key, i) => (
                <SmoothCorners
                  key={key}
                  as="input"
                  type="text"
                  corners={SQ_STD}
                  placeholder={['materials', 'size', 'date / year'][i]}
                  value={formData[key]}
                  onChange={e => setFormData({...formData, [key]: e.target.value})}
                />
              ))}
            </div>
          )}

          <div className="editor-buttons">
            <SmoothCorners as="button" type="submit" corners={SQ_STD} className="btn-primary">
              save
            </SmoothCorners>
            <SmoothCorners as="button" type="button" corners={SQ_STD} className="btn-secondary" onClick={() => navigate(-1)}>
              cancel
            </SmoothCorners>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Editor;