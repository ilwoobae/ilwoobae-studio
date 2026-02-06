import React from 'react';

const Squircle = ({ children, className = "", as: Component = "div", ...props }) => {
  // 스쿼클의 매끄러운 곡률을 정의하는 SVG Path 데이터 (iOS 스타일)
  return (
    <Component 
      className={`squircle-container ${className}`} 
      style={{
        clipPath: `url(#squircle-clip)`,
        WebkitClipPath: `url(#squircle-clip)`,
      }}
      {...props}
    >
      {children}
      
      {/* 화면에는 보이지 않는 SVG 정의 */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="squircle-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.5 C 0,0.05 0.05,0 0.5,0 C 0.95,0 1,0.05 1,0.5 C 1,0.95 0.95,1 0.5,1 C 0.05,1 0,0.95 0,0.5" />
          </clipPath>
        </defs>
      </svg>
    </Component>
  );
};

export default Squircle;