# RnAiCamera

음식 사진을 촬영한 뒤 Firebase AI로 음식명과 영양 정보를 추정하고, 결과를 기록으로 저장하는 React Native 앱입니다.  
촬영 이미지 업로드, AI 분석, 로컬 기록 관리, AdMob 광고 표시까지 하나의 흐름으로 구성되어 있습니다.

## 주요 기능

- 음식 사진 촬영
- Firebase AI 기반 음식 분석
- 칼로리 및 영양소(탄수화물, 단백질, 지방) 추정
- Firebase Storage 이미지 업로드
- AsyncStorage 기반 분석 기록 저장/조회/삭제
- AdMob 배너 광고 및 전면 광고 표시

## 기술 스택

- React Native 0.81.5
- React 19
- TypeScript
- React Navigation
- React Native Vision Camera
- React Native Firebase
  - App
  - AI
  - Storage
- React Native Google Mobile Ads
- AsyncStorage

## 동작 흐름

1. 홈 화면에서 저장된 음식 분석 기록을 확인합니다.
2. 카메라 화면으로 이동해 음식 사진을 촬영합니다.
3. 촬영한 이미지를 Firebase Storage에 업로드합니다.
4. 이미지를 Base64로 읽어 Firebase AI로 분석합니다.
5. 분석 결과를 로컬 저장소에 기록합니다.
6. 홈 화면에서 상세 정보를 확인하거나 길게 눌러 기록을 삭제할 수 있습니다.

## 프로젝트 구조

```text
.
├── components/   # 기록 아이템, 상세 모달 등 UI 컴포넌트
├── constants/    # AI 분석 프롬프트
├── hooks/        # 기록 관리, AI 분석, 광고 로딩 훅
├── screens/      # 홈 화면, 카메라 화면
├── services/     # Firebase AI, Storage, AsyncStorage 서비스
├── types/        # 네비게이션/기록/영양 정보 타입
├── android/      # Android 네이티브 설정
└── ios/          # iOS 네이티브 설정
```

## 요구 사항

- Node.js 20 이상
- Yarn 4
- Xcode / CocoaPods
- Android Studio
- iOS Simulator 또는 Android Emulator / 실제 기기

## 설치 및 실행

### 1. 의존성 설치

```sh
yarn install
```

### 2. iOS Pod 설치

```sh
bundle install
bundle exec pod install
```

### 3. Metro 실행

```sh
yarn start
```

### 4. 앱 실행

Android:

```sh
yarn android
```

iOS:

```sh
yarn ios
```

## 환경 설정

### Firebase

이 프로젝트는 Firebase App, Firebase AI, Firebase Storage 설정이 필요합니다.

- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

위 파일들은 민감 설정 파일이므로 Git에 커밋하지 않고, 로컬 환경에서 직접 추가하는 것을 전제로 합니다.  
다른 Firebase 프로젝트를 사용할 경우 각 플랫폼 설정 파일을 해당 프로젝트 값으로 교체해야 합니다.

또한 Firebase Console에서 최소한 아래 서비스가 활성화되어 있어야 합니다.

- Firebase Storage
- Firebase AI 관련 설정

### AdMob

`app.json`의 AdMob 앱 ID는 현재 더미 값으로 설정되어 있습니다.  
운영 또는 실제 테스트 환경에서는 앱 ID와 광고 unit id를 모두 직접 교체해야 합니다.

교체 대상:

- `app.json`

- `screens/HomeScreen.tsx`
- `hooks/useIntersitial.ts`

개발 환경에서는 Google Mobile Ads 테스트 ID를 사용합니다.

### 권한

현재 앱은 다음 권한을 사용합니다.

- 카메라 권한
- iOS App Tracking Transparency 권한

iOS는 `Info.plist`, Android는 `AndroidManifest.xml`에 필요한 설정이 반영되어 있습니다.

## 데이터 형식

AI 분석 결과는 아래 구조를 기준으로 저장됩니다.

```ts
interface FoodAnalysisResult {
  food_name: string;
  calories: number;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence: number;
}
```

기록 데이터는 아래 형태로 관리됩니다.

```ts
interface FoodRecord {
  id: string;
  createdAt: string;
  imageUri: string;
  analysisResult: FoodAnalysisResult;
}
```

## 스크립트

```sh
yarn start
yarn android
yarn ios
yarn test
yarn lint
```

## 테스트

기본 테스트 실행:

```sh
yarn test
```

정적 검사:

```sh
yarn lint
```

현재 테스트 구성은 기본 수준이며, AI 분석 흐름이나 Firebase 연동에 대한 통합 테스트는 포함되어 있지 않습니다.

## 구현 메모

- AI 모델은 `gemini-2.5-flash`를 사용합니다.
- AI 응답은 JSON 문자열만 반환하도록 프롬프트가 구성되어 있습니다.
- 분석 결과는 AsyncStorage 키 `@food_records`에 저장됩니다.
- 이미지 파일은 Firebase Storage의 `food_images/` 경로 아래에 업로드됩니다.

## 주의 사항

- 영양 정보와 칼로리는 AI 추정치이므로 실제 수치와 다를 수 있습니다.
- 음식이 아닌 이미지가 들어오면 정확한 결과를 보장하지 않습니다.
- `google-services.json`, `GoogleService-Info.plist`, 실제 광고 ID 같은 민감 설정값은 저장소에 포함하지 않는 것을 권장합니다.
- 실제 배포 전에는 Firebase 프로젝트, 광고 unit id, 릴리스 서명, 개인정보 처리 정책을 별도로 점검해야 합니다.
