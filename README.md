# 🍱 점심파티 — 오늘 점심, 같이 먹을 사람?

> 회사 동료와 점심 파티를 만들고 참여하는 실시간 웹앱

**🔗 Live Demo**: [msb741852.github.io/lunch-party](https://msb741852.github.io/lunch-party/)

---

## 왜 만들었나

점심시간마다 반복되는 장면이 있습니다.

*"오늘 점심 뭐 먹지?" → 단톡방에 물어봄 → 답장 없음 → 결국 혼밥*

슬랙이나 카톡에 던지는 점심 메시지는 흘러가고, 누가 갈 건지 모으기 어렵고, 인원이 차면 마감이라는 개념도 없습니다. **점심파티**는 이 문제를 해결합니다.

- 파티를 만들면 **실시간으로** 동료들이 보고 참여합니다
- 인원이 차면 **자동 마감**, 시간이 지나면 **자동 종료**
- 새로고침 필요 없이, 누가 들어오고 나갔는지 **즉시** 반영됩니다

---

## 핵심 기능

### 🏠 오늘의 점심 파티 (메인 화면)

오늘 등록된 파티만 한눈에 보여줍니다. 내일 파티, 어제 파티는 안 보입니다. **오늘, 지금, 이 점심**에 집중합니다.

- **상태 필터** — 모집중 / 마감 / 전체
- **카테고리 필터** — 한식, 중식, 일식, 양식, 분식, 기타
- 카드에 식당명, 시간, 모집 현황이 프로그레스 바로 표시됩니다

### ✏️ 파티 만들기

모달 폼에서 간단히 생성합니다.

| 항목 | 설명 |
|------|------|
| 파티 제목 | "오늘 혼밥탈출! 김치찌개 같이 가요" (최대 40자) |
| 식당 이름 + 카테고리 | 6종 카테고리 중 선택 |
| 위치 | "본관 1층", "사거리 편의점 앞" |
| 만남 시각 | 현재 이후 시각만 선택 가능 |
| 최대 인원 | 2~8명 |
| 설명 | 분위기, 예산, 주의사항 (선택, 최대 200자) |

### 👥 참여 & 취소

- **참여하기** — 빈자리가 있으면 버튼 한 번으로 참여
- **참여 취소** — 마음이 바뀌면 언제든 취소
- 동시에 여러 명이 참여해도 정원 초과 없이 안전하게 처리됩니다 (트랜잭션 기반)

### 🔄 실시간 상태 관리

파티 상태는 저장하지 않고 **매번 계산**합니다.

```
만남 시각이 지남  →  🔘 종료
정원이 가득 참    →  🔴 마감
그 외             →  🟢 모집중
```

별도 배치작업 없이, 시간이 지나면 자동으로 종료 상태가 됩니다.

---

## 사용자 흐름

```
Google 로그인 → 메인 화면 (오늘의 파티 목록)
                  ├── 파티 카드 클릭 → 상세 페이지 → 참여 / 취소 / 삭제(호스트)
                  └── "+ 파티 만들기" → 모달 폼 → 생성 완료
```

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18, Vite, React Router v6 |
| 상태 관리 | Zustand (인증), Firestore onSnapshot (데이터) |
| 스타일링 | Tailwind CSS v3 (커스텀 brand 컬러) |
| 인증 | Firebase Authentication (Google OAuth) |
| 데이터베이스 | Cloud Firestore (실시간 구독) |
| 배포 | GitHub Pages + GitHub Actions (push → 자동 배포) |

---

## 프로젝트 구조

```
src/
├── firebase.js                # Firebase 초기화
├── store/useAuthStore.js      # Zustand 인증 스토어
├── hooks/
│   ├── useParties.js          # 오늘의 파티 목록 실시간 구독
│   └── usePartyDetail.js      # 파티 상세 실시간 구독
├── pages/
│   ├── LoginPage.jsx          # Google 로그인
│   ├── HomePage.jsx           # 파티 목록 + 필터
│   └── PartyDetailPage.jsx    # 파티 상세
├── components/
│   ├── layout/Navbar.jsx      # 상단 네비게이션
│   ├── party/
│   │   ├── PartyCard.jsx      # 파티 카드 (목록용)
│   │   ├── PartyDetail.jsx    # 파티 상세 (참여/취소/삭제)
│   │   └── PartyForm.jsx      # 파티 생성 모달
│   └── common/
│       ├── Avatar.jsx         # 프로필 이미지
│       └── Badge.jsx          # 상태/카테고리 뱃지
└── utils/partyHelpers.js      # 상태 계산, 시간 포맷, 카테고리 목록
```

---

## 시작하기

### 사전 준비

- Node.js 18+
- Firebase 프로젝트 ([Firebase Console](https://console.firebase.google.com)에서 생성)

### 1. Firebase 설정

1. Firebase Console → **Authentication** → Sign-in method에서 **Google** 활성화
2. **Firestore Database** 생성 (리전: `asia-northeast3` 권장)
3. 프로젝트 설정 → 내 앱 → **웹 앱 추가** → `firebaseConfig` 값 복사
4. Firestore Rules 탭에서 `firestore.rules` 내용을 붙여넣고 게시

### 2. 로컬 실행

```bash
cd lunch-party
cp .env.example .env
# .env 파일에 Firebase 콘솔의 값을 채워넣습니다
```

| 환경변수 | Firebase Config 키 |
|----------|-------------------|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

```bash
npm install
npm run dev        # http://localhost:5173
```

### 3. 배포 (GitHub Pages)

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 → 배포합니다.

Firebase 환경변수는 GitHub Repository Settings → Secrets에 등록되어 있어야 합니다.

> ⚠️ 배포 후 Firebase Console → Authentication → Settings → **Authorized domains**에 `{username}.github.io`를 추가해야 Google 로그인이 동작합니다.

---

## Firestore 데이터 모델

### `parties` 컬렉션

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | string | 파티 제목 (최대 40자) |
| `restaurantName` | string | 식당 이름 |
| `restaurantCategory` | string | 한식 · 중식 · 일식 · 양식 · 분식 · 기타 |
| `location` | string | 만남 장소 |
| `meetingTime` | Timestamp | 만남 시각 |
| `maxMembers` | number | 최대 인원 (2~8) |
| `currentMembers` | array | `[{ uid, displayName, photoURL }]` |
| `hostUid` / `hostName` | string | 파티 개설자 정보 |
| `description` | string | 설명 (선택) |
| `status` | string | `"open"` · `"full"` · `"closed"` |
| `createdAt` | Timestamp | 생성 시각 |

### `users` 컬렉션

Google 로그인 시 자동 생성(upsert). `uid`, `displayName`, `email`, `photoURL`, `lastLogin`.

---

## 설계 원칙

| 원칙 | 적용 |
|------|------|
| **실시간 우선** | 모든 화면이 `onSnapshot` 구독. 새로고침 불필요 |
| **상태는 계산** | 파티 상태를 DB에 의존하지 않고 매 렌더링 시 계산 |
| **트랜잭션 보호** | 참여/취소를 `runTransaction`으로 처리해 동시성 안전 |
| **규칙 기반 보안** | Firestore Rules로 정원 초과, 타인 데이터 수정 차단 |
| **오늘에 집중** | 홈 화면은 오늘 파티만 표시. 과거/미래 데이터 노출 없음 |
