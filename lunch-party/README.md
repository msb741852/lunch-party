# 점심파티 (Lunch Party)

회사 동료들이 점심식사 파티원을 실시간으로 모집하고 참여할 수 있는 웹앱입니다.
React + Firebase(Firestore + Auth) 기반이며, 파티 생성/참여/취소가 실시간으로 반영됩니다.

## 기술 스택

- React 18 + Vite
- React Router v6
- Zustand (전역 상태 관리)
- Tailwind CSS v3
- Firebase v10 (Firestore, Authentication)
- date-fns, react-hot-toast

## 디렉토리 구조

```
src/
├── firebase.js              # Firebase 초기화
├── store/useAuthStore.js    # Zustand 인증 스토어
├── hooks/                   # Firestore 실시간 구독 훅
├── pages/                   # Login / Home / PartyDetail
├── components/
│   ├── layout/              # Navbar 등 레이아웃
│   ├── party/               # 파티 카드/폼/상세
│   └── common/              # Badge, Avatar
└── utils/partyHelpers.js    # 파티 상태 계산 등
```

## 로컬 실행 방법

1. 의존성 설치

   ```bash
   npm install
   ```

2. Firebase 프로젝트 생성 및 설정 (아래 "Firebase 프로젝트 연결" 참고)

3. 프로젝트 루트에 `.env` 파일을 만들고 `.env.example`의 키를 채워넣습니다.

   ```bash
   cp .env.example .env
   # .env 파일의 각 값을 Firebase 콘솔의 값으로 교체
   ```

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

   브라우저에서 `http://localhost:5173` 을 엽니다.

5. 프로덕션 빌드

   ```bash
   npm run build
   npm run preview
   ```

## Firebase 프로젝트 연결

1. [Firebase Console](https://console.firebase.google.com) 에서 새 프로젝트를 생성합니다.
2. **Authentication** → **Sign-in method** 에서 **Google** 제공업체를 활성화합니다.
3. **Firestore Database** 를 생성합니다 (위치: `asia-northeast3` 등 원하는 리전).
4. 프로젝트 설정 → **내 앱** → **웹 앱 추가** 버튼으로 웹 앱을 등록합니다.
5. 등록 후 제공되는 `firebaseConfig` 값을 `.env` 에 아래와 같이 채워넣습니다.

   | 환경변수 | 설명 |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

6. Firestore 보안 규칙 배포 (선택, 권장):

   - Firebase CLI 를 사용하는 경우 `firestore.rules` 파일을 그대로 배포할 수 있습니다.
   - 또는 Firebase 콘솔의 Firestore Rules 탭에서 `firestore.rules` 내용을 복사해 붙여넣고 게시합니다.

## Firestore 데이터 모델

### `parties` 컬렉션

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | string | 파티 제목 |
| `restaurantName` | string | 식당 이름 |
| `restaurantCategory` | string | 음식 카테고리 |
| `location` | string | 식당 위치 |
| `meetingTime` | timestamp | 만남 시각 |
| `maxMembers` | number | 최대 인원 (2~8) |
| `currentMembers` | array<{uid, displayName, photoURL}> | 현재 참여자 |
| `hostUid` / `hostName` | string | 파티 개설자 |
| `description` | string | 설명 (선택) |
| `status` | "open" \| "full" \| "closed" | 파티 상태 |
| `createdAt` | timestamp | 생성 시각 |

### `users` 컬렉션

로그인 시 업서트됩니다. `uid`, `displayName`, `email`, `photoURL`, `lastLogin`.

## 주요 동작

- 오늘 날짜(00:00~23:59) 의 파티만 홈에서 노출됩니다.
- 파티 참여/취소는 Firestore 트랜잭션으로 처리해 동시성 문제를 방지합니다.
- 카드/상세의 상태 뱃지는 현재 시각과 인원수를 기준으로 런타임에 계산합니다.
