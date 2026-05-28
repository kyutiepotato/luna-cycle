# 🌙 Luna — Menstrual Cycle Tracking App

A modern, privacy-first menstrual cycle tracking application built with Expo and React Native. Luna provides intelligent cycle predictions, symptom tracking, mood logging, wellness insights, and beautiful analytics — all with a soft, emotionally supportive design language.

---

## ✨ Features

### 🩸 Cycle Tracking
- Period start/end logging with one tap
- Flow intensity tracking (spotting → very heavy)
- Adaptive prediction engine that learns from your history
- Ovulation and fertile window estimation
- PMS prediction with confidence indicators
- Support for regular and irregular cycles

### 💊 Symptom Tracking
- 15 trackable symptoms with severity levels (mild/moderate/severe)
- Cramps, headache, bloating, acne, fatigue, nausea, back pain, mood swings, breast tenderness, and more
- Pattern detection across cycles

### 🎭 Mood & Wellness
- 12 emotional states with emoji representation
- Sleep, hydration, and exercise tracking
- Basal body temperature (BBT) logging
- Daily energy level tracking

### 📊 Analytics Dashboard
- Cycle length history bar chart
- Mood heatmap (30-day calendar)
- Symptom frequency analysis
- Wellness trend visualization
- Cycle regularity indicator
- Personalized AI-powered insights

### 📖 Journal
- Private wellness journal with rich text
- Mood tagging per entry
- Custom tags for organization
- Writing prompts for each cycle phase

### 🔔 Smart Notifications
- Period reminders (configurable days before)
- Ovulation window alerts
- Daily log reminders
- Discreet notification wording

### 🔒 Privacy & Security
- Supabase Row-Level Security (RLS) — your data is only accessible by you
- Encrypted local storage via Expo SecureStore
- Biometric authentication support (Face ID / Touch ID)
- Privacy mode (hides sensitive home screen details)
- No ads, no data selling, ever

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 51 + React Native |
| Language | TypeScript |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Styling | NativeWind (TailwindCSS for RN) + StyleSheet |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Storage | Expo SecureStore + AsyncStorage |
| Auth | Supabase Auth + Expo LocalAuthentication |
| Notifications | Expo Notifications |
| Animations | React Native Reanimated + Animated API |
| Gradients | Expo Linear Gradient |
| Haptics | Expo Haptics |
| Date Handling | date-fns |

---

## 📁 Project Structure

```
luna-cycle/
├── App.tsx                          # Root entry point
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel + NativeWind config
├── tailwind.config.js               # Tailwind theme extension
├── tsconfig.json                    # TypeScript paths
├── .env.example                     # Environment variables template
│
└── src/
    ├── types/
    │   └── index.ts                 # All TypeScript interfaces
    │
    ├── constants/
    │   └── theme.ts                 # Colors, typography, spacing, phase configs
    │
    ├── lib/
    │   └── supabase.ts              # Supabase client + DB schema SQL
    │
    ├── services/
    │   ├── authService.ts           # Auth operations + biometric/PIN
    │   ├── cycleService.ts          # CRUD for cycles, day logs, analytics
    │   ├── cycleEngine.ts           # Adaptive cycle prediction algorithm
    │   ├── insightsService.ts       # AI-powered insight generation
    │   └── notificationService.ts   # Push notification scheduling
    │
    ├── context/
    │   ├── AuthContext.tsx          # User auth state + profile
    │   ├── CycleContext.tsx         # Cycle data + predictions
    │   ├── ThemeContext.tsx         # Light/dark theme
    │   └── NotificationContext.tsx  # Notification listeners
    │
    ├── hooks/
    │   ├── useAnalytics.ts          # Analytics data hooks
    │   └── useStorage.ts            # Secure/async storage hooks
    │
    ├── navigation/
    │   ├── RootNavigator.tsx        # Auth/onboarding/main routing
    │   ├── AuthNavigator.tsx        # Login/Register/ForgotPassword
    │   ├── MainNavigator.tsx        # Bottom tab navigator
    │   ├── TrackNavigator.tsx       # Track stack + Onboarding stack
    │   └── OnboardingNavigator.tsx  # Re-export of onboarding
    │
    ├── components/
    │   ├── common/
    │   │   ├── UIComponents.tsx     # Button, Card, Input, Chip, etc.
    │   │   └── Screen.tsx           # Screen wrapper with safe area
    │   └── tracking/
    │       └── CycleRing.tsx        # Animated cycle phase ring
    │
    ├── screens/
    │   ├── SplashScreen.tsx
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── RegisterScreen.tsx
    │   │   └── ForgotPasswordScreen.tsx
    │   ├── onboarding/
    │   │   └── WelcomeScreen.tsx    # All 5 onboarding steps
    │   └── main/
    │       ├── HomeScreen.tsx       # Dashboard with cycle ring
    │       ├── CalendarScreen.tsx   # Calendar with marked dates
    │       ├── TrackHomeScreen.tsx  # Daily tracking hub
    │       ├── SymptomTrackerScreen.tsx
    │       ├── MoodTrackerScreen.tsx
    │       ├── FlowTrackerScreen.tsx
    │       ├── WellnessTrackerScreen.tsx
    │       ├── AnalyticsScreen.tsx  # Charts and insights
    │       ├── JournalScreen.tsx    # Journal list
    │       ├── JournalEntryScreen.tsx
    │       └── ProfileScreen.tsx   # Settings and account
    │
    └── utils/
        └── dateUtils.ts             # Date formatting helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) for builds
- Supabase account (free tier works)
- iOS Simulator / Android Emulator or physical device with Expo Go

### 1. Clone & Install

```bash
git clone https://github.com/your-org/luna-cycle.git
cd luna-cycle
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the schema from `src/lib/supabase.ts` (the commented SQL block)
3. This creates all tables with RLS policies enabled
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Add Fonts (Optional)

Luna uses **Fraunces** (display) and **DM Sans** (body). Download from Google Fonts:
- [Fraunces](https://fonts.google.com/specimen/Fraunces) — Light (300), Regular (400), SemiBold (600)
- [DM Sans](https://fonts.google.com/specimen/DM+Sans) — Regular, Medium, Bold

Place in `src/assets/fonts/`:
```
DMSans-Regular.ttf
DMSans-Medium.ttf
DMSans-Bold.ttf
Fraunces-Light.ttf
Fraunces-Regular.ttf
Fraunces-SemiBold.ttf
```

If fonts are unavailable, the app gracefully falls back to system fonts.

### 5. Run

```bash
# Start Expo dev server
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android
```

---

## 🗄 Database Schema

All tables use Row-Level Security — users can only access their own data.

| Table | Purpose |
|-------|---------|
| `user_profiles` | Name, cycle defaults, preferences |
| `cycle_entries` | Period start/end dates |
| `day_logs` | Per-day flow, symptoms, moods, wellness |
| `journal_entries` | Private journal with mood + tags |
| `notification_settings` | Reminder preferences |

Run the full schema SQL from `src/lib/supabase.ts` in your Supabase SQL editor.

---

## 🏗 Architecture Decisions

### Prediction Engine (`cycleEngine.ts`)
- **Weighted moving average** — recent cycles carry more weight than older ones
- **Confidence scoring** — starts at 30% with 0 cycles, reaches 92% with 12+ regular cycles
- **Irregular cycle detection** — uses standard deviation of cycle lengths; >5 day SD = irregular
- **Phase calculation** — derived from cycle day relative to predicted length

### Context Architecture
- `AuthContext` — wraps Supabase auth, exposes user + profile
- `CycleContext` — owns all cycle/day data, recalculates predictions on any data change
- `ThemeContext` — lightweight, reads system color scheme, no persistence needed

### Offline-First Design
- All reads prioritize local state (React context)
- Writes go to Supabase; `useOfflineQueue` hook queues failed operations for retry
- SecureStore used for auth tokens (persists across app restarts)

---

## 📱 Building for Production

```bash
# Configure EAS
eas init

# iOS build
eas build --platform ios

# Android build
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🔮 Roadmap

- [ ] Wearable integration (Apple Watch, Fitbit via HealthKit/Google Fit)
- [ ] Partner mode (share selected data with a trusted person)
- [ ] Advanced AI insights via Claude API
- [ ] Export to PDF health report
- [ ] Contraceptive method tracking
- [ ] Doctor appointment mode (shareable summary)
- [ ] Multiple cycle profiles
- [ ] Widget support (iOS 16+ / Android)
- [ ] Apple Health / Google Fit sync

---

## 🔒 Privacy Philosophy

Luna is built privacy-first:
- **Zero third-party analytics** — no Mixpanel, no Firebase Analytics
- **No ads** — your health data is never monetized
- **RLS by default** — database-level isolation, not just application-level
- **Encrypted tokens** — auth tokens stored in device secure enclave via SecureStore
- **Discreet notifications** — vague wording that doesn't expose health info on lock screen

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with 💜 for everyone who deserves to understand their body.*
