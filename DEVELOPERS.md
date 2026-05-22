# Developing Ticku

## Getting Started

Thank you for your interest and your willingness to contributing to Ticku!

To ensure safe, positive, and inclusive environment, please read the [code of conduct](CODE_OF_CONDUCT.md). Please explore the existing [issues](https://github.com/AbbeyIT/Ticku/issues) to see how you can help the project. This document will guide you to setup your development environment. Any issues arise please discussed in the [discussions](https://github.com/AbbeyIT/Ticku/discussions).

## Prerequisite

You will need to install and configure the following dependencies on your machine to build Ticku:

| Tool                                                        | Version                | Purpose                 |
| ----------------------------------------------------------- | ---------------------- | ----------------------- |
| [Node.js](https://nodejs.org/)                              | v20+ (LTS recommended) | JavaScript runtime      |
| [npm](https://www.npmjs.com/)                               | Comes with Node.js     | Package manager         |
| [Expo CLI](https://docs.expo.dev/get-started/installation/) | Latest                 | Development tools       |
| [Expo Go](https://expo.dev/go)                              | SDK 54                 | Physical device testing |

> **Note:** Windows users can only run the Android version locally. iOS Simulator requires macOS + Xcode.

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

## Run Locally

### Fork the repo

To contribute code to [Ticku](https://github.com/AbbeyIT/Ticku), first fork the repository to your own GitHub account.

### Clone the repo

```bash
# 1. Clone your fork
git clone https://github.com/your-username/Ticku.git

# 2. Open the project
cd ticku

# 3. Add the original repository as upstream
git remote add upstream https://github.com/AbbeyIT/Ticku.git

# 4. Create a new branch (DO NOT work on main)
git checkout -b feature/your-feature-name

# 5. Install dependencies
npm install

# 6. Start the Expo development server
npx expo start
```

### Keep your branch updated

Before starting new work, sync your fork with the latest upstream changes:

```bash
# Switch to main
git checkout main

# Pull latest changes from upstream
git pull upstream main

# Switch back to your feature branch
git checkout feature/your-feature-name

# Rebase your branch onto latest main
git rebase main
```

### Running the App

Once Metro starts, you can run the app in several ways:

| Platform          | How to launch                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Web browser**   | Press `w` in the terminal, or run `npx expo start --web`                                                        |
| **Android**       | Press `a` in the terminal to open Android Emulator, or scan the QR code with **Expo Go** on your Android device |
| **iOS**           | Scan the QR code with **Expo Go** on your iPhone                                                                |
| **iOS Simulator** | Press `i` in the terminal _(macOS + Xcode only)_                                                                |

> **Tip:** If you're on a corporate network or have trouble connecting, use `npx expo start --tunnel` to tunnel through Expo's servers.

---

## Submitting Changes

After making your changes:

```bash
# Stage files
git add .

# Commit changes
git commit -m "feat: add your feature"

# Push branch to your fork
git push origin feature/your-feature-name
```

Then open a Pull Request from your branch into the main branch of the upstream Ticku repository.

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
│   ├── index.tsx                 # Splashscreen
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
  "recipes": [],
  "beans": [],
  "favorites": [],
  "brewLog": []
}
```

Notes:

- Only **custom recipes** are exported in backups (built-in recipes are already included in the app).
- Restore merges data without overwriting existing items.

---
