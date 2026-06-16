# NewsDoc_FL

NewsDoc_FL은 프론트엔드와 백엔드를 통합한 풀스택 프로젝트입니다.

## 프로젝트 개요

NewsDoc은 사용자의 포트폴리오 자산 관리, 투자 시뮬레이션, 리밸런싱 추천, AI 뉴스 인사이트 분석을 제공하는 웹 서비스입니다.

프론트엔드는 React 기반으로 구성되어 있으며, 백엔드는 FastAPI 기반으로 구성되어 있습니다.

> 💡 **Reference:** 프로젝트 시연 동영상 및 중간·최종 발표 PPT는 [최하단 리소스 섹션](#프로젝트-리소스)에 첨부되어 있습니다.

## 프로젝트 구조

```text
NewsDoc_FL
├─ frontend   React / Vite 프론트엔드
└─ backend    FastAPI 백엔드
```

## 주요 기능

- 회원가입 및 로그인
- JWT 기반 인증
- 포트폴리오 자산 등록, 조회, 삭제
- 원화 및 달러 자산 관리
- 원화 환산 기준 자산 요약
- 자산 비중 차트
- 투자 시뮬레이션
- 리밸런싱 추천
- AI 뉴스 인사이트 분석
- Gemini 기반 RAG 분석
- Gemini Pro 리포트 생성

## Frontend 실행 방법

```bash
cd frontend
npm install
npm run dev
```

기본 실행 주소는 다음과 같습니다.

```text
http://localhost:5173
```

## Backend 실행 방법

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

기본 실행 주소는 다음과 같습니다.

```text
http://127.0.0.1:8000
```

FastAPI 문서 주소는 다음과 같습니다.

```text
http://127.0.0.1:8000/docs
```

## 환경 변수

실제 `.env` 파일은 GitHub에 업로드하지 않습니다.

백엔드 실행을 위해 `backend/.env` 파일을 별도로 생성해야 합니다.

예시는 다음과 같습니다.

```env
DATABASE_URL=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=

KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=
```

프론트엔드에서 API 주소가 필요한 경우 `frontend/.env` 파일을 별도로 생성할 수 있습니다.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## GitHub 업로드 제외 항목

다음 항목은 GitHub에 업로드하지 않습니다.

```text
frontend/node_modules/
frontend/dist/
frontend/.env

backend/.venv/
backend/.env
backend/__pycache__/
```

## 기술 스택

### Frontend

- React
- Vite
- Zustand
- Axios
- Tailwind CSS
- Recharts

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- JWT Authentication

## 실행 순서

1. 백엔드 `.env` 파일 생성
2. 백엔드 패키지 설치
3. 백엔드 서버 실행
4. 프론트엔드 패키지 설치
5. 프론트엔드 서버 실행
6. 브라우저에서 프론트엔드 접속

## 프로젝트 상태

프론트엔드와 백엔드의 주요 기능 구현이 완료된 통합 프로젝트입니다.

## 프로젝트 리소스
**시연 영상:** 

[![NewsDoc 시연 영상](https://img.youtube.com/vi/ThzX9-w9zNA/0.jpg)](https://www.youtube.com/watch?v=ThzX9-w9zNA)

https://www.youtube.com/watch?v=ThzX9-w9zNA


**발표 자료**
- 중간 발표 PPT
[뉴스닥(NewsDoc)_—_AI_기반_개인_자산_관리_시스템.pptx](https://github.com/user-attachments/files/28992716/NewsDoc._._AI_._._._._.pptx)
- 최종 발표 PPT
[매크로팀_NewsDoc_지능형_자산_배분_의사결정_지원_시스템.pptx](https://github.com/user-attachments/files/28994610/_NewsDoc_._._._._._.pptx)




