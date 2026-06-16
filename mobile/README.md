# Times Edu — Unified Mobile App

One Expo / React Native binary serving **both** audiences. A role gate at login
mounts the matching feature module — no second app to maintain.

```
App.tsx                      Fonts + providers + NavigationContainer
src/
  app/AuthContext.tsx        Session + role gate (student | tutor)
  navigation/RootNavigator   Login ↔ role module switch
  screens/RoleLoginScreen    Unified "choose your space" login
  theme/brand.ts             Shared brand tokens (navy/gold)
  student/                   Học viên module (Home · Subjects · Practice · AI Tutor · Progress)
  tutor/                     Gia sư module (Dashboard · Schedule · Students · Resources · Earnings)
```

Each module keeps its own `theme/`, `components/`, `screens/`, `data/`, so the two
worlds never collide. They share one design language (Spectral + Hanken Grotesk,
navy `#1D3557` / gold `#B38B4D`) and one API boundary.

## Run

```bash
npm install
cp .env.example .env       # set EXPO_PUBLIC_API_BASE_URL to your backend
npm start                  # then press i (iOS) / a (Android), or scan the QR
```

## Wire the backend

- `src/app/AuthContext.tsx` → replace mock `signIn` with `POST /v1/auth/login` returning `{ token, role, name }`.
- `src/student/api/` → AI tutor + content endpoints (the Anthropic key stays server-side).
- `src/*/data/mockData.ts` → swap each export for the matching API call; shapes are the contract.

Never ship the Anthropic key in the client — the app talks only to your backend.
