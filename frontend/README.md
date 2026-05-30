# NewsDoc Frontend (NewsDocFe)

NewsDoc 프로젝트의 프론트엔드 레포지토리입니다.

## 🚀 Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **HTTP Client**: Axios (with JWT Interceptors)
- **Icons**: Lucide React

## ⚙️ Prerequisites

- Node.js (v18 이상 권장)
- 백엔드 서버 (FastAPI 등, 기본 API 주소: `http://localhost:8000`)

## 🛠️ Installation & Setup

1. 레포지토리를 클론합니다.
   ```bash
   git clone https://github.com/DMU-Mecro/NewsDocFe.git
   cd NewsDocFe
   ```

2. 의존성 패키지를 설치합니다.
   ```bash
   npm install
   ```

3. 개발 서버를 실행합니다.
   ```bash
   npm run dev
   ```
   개발 서버는 기본적으로 `http://localhost:4000` 에서 실행됩니다. (vite.config.js 기준)

## 🔑 Key Features

- **자동 토큰 주입**: Axios 인터셉터를 통해 백엔드로 요청 시 `localStorage`에 저장된 JWT 토큰을 자동으로 `Bearer` 헤더에 주입합니다.
- **자동 세션 관리**: 401(권한 없음) 에러 발생 시 자동으로 스토리지를 비우고 로그인 페이지(`/auth`)로 리다이렉트 처리합니다.
- **데이터 시각화**: `Recharts` 라이브러리를 통해 직관적인 차트 UI를 제공합니다.
- **전역 상태 관리**: `Zustand`를 활용하여 복잡하지 않고 직관적으로 상태를 관리합니다.

## 🤝 Contributing & Conventions

우리 프로젝트는 일관된 코드 품질과 Git 히스토리 관리를 위해 브랜치 및 커밋 컨벤션을 사용합니다.
또한 AI 보조 도구를 활용하기 위한 지시사항을 포함하고 있습니다. 자세한 내용은 AGENTS.md를 참고해 주세요.
