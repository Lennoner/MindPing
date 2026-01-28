# 🚀 MindPing 배포 가이드

## 📋 사전 준비 사항

### 1. EAS CLI 설치
```bash
npm install -g eas-cli
eas login
```

### 2. Expo 계정 연결
```bash
eas init
```
> `app.json`의 `extra.eas.projectId`가 자동으로 설정됩니다.

---

## 🔧 빌드 명령어

### Preview APK (테스트용)
```bash
eas build --platform android --profile preview
```

### Production 빌드
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## 📱 스토어 제출

### Android (Google Play)
1. Google Play Console에서 서비스 계정 JSON 키 발급
2. `eas.json`의 `serviceAccountKeyPath` 경로 업데이트
3. 제출:
```bash
eas submit --platform android
```

### iOS (App Store)
1. Apple Developer 계정 정보 설정
2. `eas.json`의 `appleId`, `ascAppId` 업데이트
3. 제출:
```bash
eas submit --platform ios
```

---

## ✅ 배포 전 체크리스트

- [x] TypeScript 타입 체크 통과
- [x] `eas.json` 설정 완료
- [x] `app.json` 플러그인 등록 (expo-notifications)
- [ ] 앱 아이콘/스플래시 이미지 준비 (`./assets/`)
- [ ] EAS 프로젝트 초기화 (`eas init`)
- [ ] 실제 빌드 테스트
- [ ] 스토어 메타데이터 준비 (스크린샷, 설명 등)

---

## 🌐 웹 배포 (Vercel/Netlify)

```bash
npx expo export --platform web
```
생성된 `dist/` 폴더를 Vercel 또는 Netlify에 배포하세요.

---

## 📞 문의
문제가 발생하면 [Expo 문서](https://docs.expo.dev/)를 참조하세요.
