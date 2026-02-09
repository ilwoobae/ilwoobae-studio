# Portfolio Base

React + Vite 기반 개인 포트폴리오 템플릿입니다. 다국어(i18n)와 블로그 섹션(그룹/카테고리/포스트)을 기본 포함합니다.

## 포함 기능
- React + Vite
- React Router
- i18n (영어/한국어)
- 블로그 데이터 모델 (Group → Category → Post)
- Cloudflare Pages 배포를 고려한 구조

## 시작하기

```bash
npm install
npm run dev
```

## Cloudflare 로컬 개발
Pages Functions를 포함해서 테스트하려면 Vite를 켜고, 별도 터미널에서 아래를 실행하세요.

```bash
npm run dev
npm run dev:cf
```

`wrangler.toml`의 `ADMIN_PASSWORD`, `ADMIN_SECRET`, `R2_BUCKET`을 실제 값으로 바꾼 뒤 사용하세요.

## 블로그 데이터 구조
- 파일: `src/data/blog.js`
- 그룹/카테고리/포스트를 데이터로 정의해두었고, D1/R2로 옮길 때 스키마로 재사용 가능합니다.

## 다국어
- 번역 파일: `src/locales/en/translation.json`, `src/locales/ko/translation.json`
- 언어 선택은 `localStorage`에 저장됩니다.

## Cloudflare 배포(후속 확장)
- 추후 Cloudflare Pages + Functions로 확장 가능하도록 구성했습니다.
- D1/R2 연동 시 권장 방향:
  - D1: 블로그/프로필 데이터 저장
  - R2: 이미지/에셋 저장
  - Pages Functions 또는 Workers로 API 라우팅

필요하면 `wrangler.toml`과 API 스켈레톤을 바로 추가할 수 있습니다.

## Admin 업로드 (R2)
- 관리자 페이지: `/admin`
- 로그인: `/admin/login`

Cloudflare Pages 환경 변수:
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `ADMIN_SECRET`: 토큰 생성용 시크릿
- `R2_BUCKET`: R2 바인딩 이름
- `R2_PUBLIC_BASE`: (선택) 공개 URL 베이스 예: `https://assets.example.com`

업로드 API:
- `POST /api/upload` (multipart/form-data, `file`, `folder`)


