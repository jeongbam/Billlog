# Billlog

모임 생성 → 계획(Pre-log) → 정산(Bill-log) → 기록(Post-log)을 하나의 흐름으로 담은 모임 정산/기록 앱입니다.

- **Frontend**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand
- **Backend**: Firebase (Auth, Firestore, Storage) → 추후 node.js로 서버 구축 예정
- **로그인**: 이메일/비밀번호 자체 회원가입 + 구글 로그인

## 1. 설치

```bash
npm install
```

## 2. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 폴더 구조

```
src/
  app/                        라우트 (App Router)
    page.tsx                  온보딩 인트로 (0-1)
    login/ signup/            자체 로그인 / 회원가입 + 구글 로그인
    onboarding/                가입 직후 모임 스타일 선택
    home/                      홈 (진행중/종료된 모임)
    mypage/                    마이페이지
    notifications/             알림 (벨 아이콘으로 진입, 하단 탭 아님)
    meetings/new/               모임 생성 1~2단계
    meetings/[id]/               모임 상세 허브
      pre-log/                   Pre-log
      bill-log/                   Bill-log 대시보드
      bill-log/new/                 영수증 등록 4단계 위저드
      post-log/                   Post-log (사진/후기)
      summary/                     모임 종료 + 요약 카드
    join/[code]/                초대 코드로 모임 참여
  components/                  UI 컴포넌트 (AppShell, ui.tsx, icons.tsx ...)
  lib/                         Firebase 데이터 접근 함수
  store/                       Zustand 스토어 (인증 상태)
  types/                       도메인 타입
```
