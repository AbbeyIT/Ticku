# ☕ Ticku — Brew with Precision

A beautiful, open-source coffee brewing timer and recipe manager built with **React Native + Expo SDK 54**.  
No account required. Your data stays on your device.

---

## Features

- **☕ Brew Timer** — Step-by-step countdown with animated ring, timeline, play/pause/skip
- **📖 Curated Recipes** — Tetsu Kasuya 4:6, James Hoffmann Iced V60, AeroPress, Hario Switch, Origami
- **✏️ Custom Recipes** — Create your own with brew steps, water pours, and pauses
- **🫘 Bean Tracker** — Save your coffee beans with origin, process, roast level, tasting notes, and more
- **📊 Brew Stats** — Total brews, water used, top recipe, origins explored
- **💾 Backup & Restore** — Export `.ticku` backup files, restore them on any device
- **📴 Fully Offline** — Zero internet, zero cloud, zero accounts

---

## Prerequisites

| Tool                                                              | Version                | Purpose                 |
| ----------------------------------------------------------------- | ---------------------- | ----------------------- |
| [Node.js](https://nodejs.org/)                                    | v20+ (LTS recommended) | JavaScript runtime      |
| [npm](https://www.npmjs.com/)                                     | Comes with Node.js     | Package manager         |
| [Expo CLI](https://docs.expo.dev/get-started/installation/)       | Latest                 | Development tools       |
| [Expo Go](https://expo.dev/go)                                    | Latest                 | Physical device testing |
| [Android Studio](https://developer.android.com/studio) (optional) | Latest                 | Android Emulator        |
| [Xcode](https://developer.apple.com/xcode/) (macOS only)          | Latest                 | iOS Simulator           |

> **Note:** Windows users can only run the Android version locally. iOS Simulator requires macOS + Xcode.

---

## Run locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ticku.git
cd ticku

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

Once Metro starts, you can run the app in several ways:

| Platform          | How to launch                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Web browser**   | Press `w` in the terminal, or run `npx expo start --web`                                                        |
| **Android**       | Press `a` in the terminal to open Android Emulator, or scan the QR code with **Expo Go** on your Android device |
| **iOS**           | Scan the QR code with **Expo Go** on your iPhone                                                                |
| **iOS Simulator** | Press `i` in the terminal _(macOS + Xcode only)_                                                                |

> **Tip:** If you're on a corporate network or have trouble connecting, use `npx expo start --tunnel` to tunnel through Expo's servers.

---

### iOS Simulator (macOS only)

If you want to run on the iOS Simulator instead of Expo Go, make sure you have [Xcode](https://developer.apple.com/xcode/) installed. On first run you may need to install CocoaPods:

```bash
cd ios && pod install && cd ..
npx expo start --ios
```

---

## Project Structure

```
ticku/
├── app/                          # Expo Router file-based routes
│   ├── (tabs)/                   # Bottom tab screens
│   │   ├── _layout.tsx           # Tab navigator layout
│   │   ├── index.tsx             # Home / Recipes screen
│   │   ├── beans.tsx             # Bean tracker
│   │   └── more.tsx              # More menu (stats, backup, about)
│   ├── more/                     # Nested screens under "More"
│   │   ├── about.tsx             # Info the app
│   │   ├── backup.tsx            # Backup & restore
│   │   ├── stats.tsx             # Brew statistics
│   │   └── your-recipes.tsx      # Custom recipes list
│   ├── recipe/                   # Recipe flows
│   │   ├── [id].tsx              # Recipe detail
│   │   └── create.tsx            # Create custom recipe
│   ├── timer/
│   │   └── [id].tsx              # Brew timer screen
│   ├── _layout.tsx               # Root layout with providers
│   └── modal.tsx                 # Global modal
├── components/                   # Reusable UI components
│   ├── UI.tsx                    # Buttons, cards, inputs
│   ├── BottomSheet.tsx           # Animated bottom sheet
│   ├── Select.tsx                # Custom picker
│   ├── Toast.tsx                 # Toast notifications
│   └── ui/                       # Platform-specific icons
├── constants/
│   └── theme.ts                  # Colors, typography, spacing tokens
├── context/
│   └── AppContext.tsx            # Global state (recipes, beans, brew log)
├── data/
│   └── recipes.ts                # Built-in curated recipes
├── hooks/                        # Custom React hooks
├── utils/
│   ├── storage.ts                # File System
│   └── time.ts                   # Time parsing & formatting
├── assets/                       # Images, icons, splash screen
├── android/                      # Android native project (prebuild)
├── app.json                      # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Backup Format

Ticku exports `.ticku` files — they are plain JSON with the following structure:

```json
{
  "version": "1.0",
  "date": "2025-01-15T08:30:00.000Z",
  "recipes": [
    {
      "id": "my-recipe-1",
      "name": "Morning V60",
      "method": "Hario V60",
      "category": "v60",
      "beans": 20,
      "water": 300,
      "temp": 93,
      "grind": "Medium-Coarse",
      "brewTime": "03:30",
      "custom": true,
      "description": "My daily recipe",
      "steps": [
        { "type": "step", "desc": "Rinse filter", "dur": "0:30" },
        { "type": "water", "desc": "Bloom", "dur": "0:45", "ml": 60 }
      ]
    }
  ],
  "beans": [
    {
      "id": "bean-1",
      "roaster": "Blue Bottle",
      "name": "Three Africas",
      "origin": "Ethiopia",
      "region": "Yirgacheffe",
      "process": "Washed",
      "roast": "Light",
      "notes": "Floral, citrus, tea-like",
      "rating": 5,
      "altitude": 2000,
      "amountLeft": 250,
      "harvestDate": "2024-11",
      "roastDate": "2025-01-01",
      "emoji": "🫘"
    }
  ],
  "favorites": ["tetsu_46"],
  "brewLog": [{ "recipeId": "tetsu_46", "date": "2025-01-15T08:30:00.000Z" }]
}
```

- Only **custom recipes** are exported in backups (built-in recipes are already included in the app).
- Restore merges data without overwriting existing items.

---

## Tech Stack

| Library / Tool                                                                           | Version  | Purpose                      |
| ---------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| [Expo SDK](https://docs.expo.dev/)                                                       | ~54.0.33 | App platform & tooling       |
| [React Native](https://reactnative.dev/)                                                 | 0.81.5   | Cross-platform UI framework  |
| [React](https://react.dev/)                                                              | 19.1.0   | UI library                   |
| [Expo Router](https://docs.expo.dev/router/introduction/)                                | ~6.0.23  | File-based navigation        |
| [React Navigation](https://reactnavigation.org/)                                         | 7.x      | Native navigation primitives |
| [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)                       | ^4.3.1   | Fast local key-value storage |
| [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)           | ~4.1.1   | Smooth animations            |
| [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) | ~2.28.0  | Touch & gesture handling     |
| [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)                | ~18.0.13 | File I/O for backups         |
| [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)                       | ~14.0.8  | Share backup files           |
| [expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)       | ~14.0.8  | Import backup files          |
| [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)                       | ~15.0.8  | Haptic feedback              |
| [expo-image](https://docs.expo.dev/versions/latest/sdk/image/)                           | ~3.0.11  | Optimized image rendering    |
| [react-native-svg](https://github.com/software-mansion/react-native-svg)                 | 15.12.1  | SVG graphics (timer ring)    |
| [TypeScript](https://www.typescriptlang.org/)                                            | ~5.9.2   | Static type checking         |
| [ESLint](https://eslint.org/)                                                            | ^9.25.0  | Code linting                 |

---

## Available Scripts

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm start`             | Start the Expo development server            |
| `npm run android`       | Build and run on Android (requires prebuild) |
| `npm run ios`           | Build and run on iOS (macOS + Xcode only)    |
| `npm run web`           | Start the web version                        |
| `npm run lint`          | Run ESLint                                   |
| `npm run reset-project` | Reset the Expo project template              |

---

## Contributing

Pull requests are welcome! For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE)

---

> Built with ☕ — brew with precision
