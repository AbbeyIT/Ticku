# Security Policy

## Overview

Ticku is a privacy-first, fully offline coffee brewing app. There is no backend, no user accounts, no cloud sync, and no network communication of any kind during normal use. All data lives exclusively on the user's device.

This document outlines how we handle security concerns, what our threat model looks like, and how to responsibly report vulnerabilities.

---

## Supported Versions

| Version       | Supported        |
| ------------- | ---------------- |
| 1.x (current) | ✅ Active        |
| < 1.0         | ❌ Not supported |

Only the latest release on the `main` branch receives security fixes.

---

## Privacy & Data Model

Understanding Ticku's architecture is important context for any security report.

**What Ticku does NOT do:**

- No user accounts or authentication
- No network requests (except Expo Go's development tunnel during development)
- No analytics, telemetry, or crash reporting
- No third-party SDKs that phone home
- No cloud storage or sync
- No advertising

**What Ticku DOES do:**

- Stores all app data locally in a JSON file using `expo-file-system`
- Reads and writes `.ticku` backup files to the device filesystem via `expo-file-system`
- Shares backup files using the OS share sheet via `expo-sharing`
- Reads imported backup files from the device via `expo-document-picker`

**Attack surface is intentionally minimal.** The primary security concerns are:

1. **Backup file integrity** — a malicious `.ticku` file imported by the user could contain unexpected data
2. **Supply chain** — a compromised npm dependency
3. **Local data exposure** — another app or person with device access reading AsyncStorage

---

## Threat Model

| Threat                         | Risk       | Mitigation                                                |
| ------------------------------ | ---------- | --------------------------------------------------------- |
| Malicious `.ticku` backup file | Low–Medium | JSON.parse is used; malformed data is caught and rejected |
| Compromised npm dependency     | Medium     | Lockfile committed; minimal dependency surface            |
| Device physical access         | Low        | OS-level sandboxing; data is not encrypted at rest        |
| Network interception           | N/A        | No network requests are made                              |
| Remote code execution          | N/A        | No server, no remote input surfaces                       |
| XSS / injection                | N/A        | No web views or user-rendered HTML                        |

---

## Reporting a Vulnerability

We take security reports seriously, even for a small open source project.

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, report them using one of the following methods:

### Option A — GitHub Private Security Advisory (preferred)

1. Go to the repository's **Security** tab
2. Click **"Report a vulnerability"**
3. Fill in the advisory form

This keeps the report private until a fix is released.

### Option B — Email

Send your report to the maintainer contact listed in the repository's GitHub profile. Use the subject line:

```
[Ticku Security] <brief description>
```

---

## What to Include in Your Report

A good report helps us reproduce and fix the issue faster. Please include:

- **Description** — what the vulnerability is and where it exists
- **Impact** — what an attacker could do if they exploited it
- **Steps to reproduce** — precise steps, ideally with code or a proof-of-concept
- **Affected version** — which version(s) of Ticku are affected
- **Environment** — iOS/Android version, Expo SDK version, device model if relevant
- **Suggested fix** — optional, but always welcome

---

## Response Timeline

| Stage              | Target time                                       |
| ------------------ | ------------------------------------------------- |
| Acknowledgement    | Within 72 hours                                   |
| Initial assessment | Within 7 days                                     |
| Fix or mitigation  | Within 30 days for high severity, 90 days for low |
| Public disclosure  | After fix is released, coordinated with reporter  |

We'll keep you updated throughout the process and credit you in the release notes unless you prefer to remain anonymous.

---

## Dependency Security

Ticku uses a small, well-maintained set of dependencies:

| Package                                     | Purpose                          | Notes                |
| ------------------------------------------- | -------------------------------- | -------------------- |
| `expo` + `expo-router`                      | App framework                    | Maintained by Expo   |
| `react-native`                              | UI runtime                       | Maintained by Meta   |
| `@react-native-async-storage/async-storage` | Local persistence                | Widely used, audited |
| `expo-file-system`                          | Local persistence and backup I/O | Expo-maintained      |
| `expo-document-picker`                      | Importing backup files           | Expo-maintained      |
| `expo-sharing`                              | Sharing backup files             | Expo-maintained      |
| `react-native-svg`                          | Timer ring animation             | Widely used          |
| `react-native-gesture-handler`              | Touch handling                   | Expo-maintained      |
| `react-native-reanimated`                   | Animations                       | Expo-maintained      |
| `react-native-safe-area-context`            | Layout insets                    | Expo-maintained      |

To audit dependencies yourself:

```bash
npm audit
```

We track and update dependencies on a regular basis. If you discover a vulnerability in one of our dependencies, please report it to the upstream maintainer and open a GitHub issue (not a private report) so we can update the affected package.

---

## Backup File Security

Ticku's backup format is a plain JSON file with a `.ticku` extension. When importing a backup:

- The file is parsed with `JSON.parse`
- Fields are merged into existing data — no code is executed
- Unknown fields are ignored
- Malformed JSON is caught and rejected with an error toast

**A `.ticku` file cannot execute code or escalate privileges.** However, it could contain unexpected recipe or bean data if sourced from an untrusted third party. Only restore backups you created yourself or received from someone you trust.

---

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Data loss due to device failure or uninstall (by design — backup your data)
- Lack of encryption at rest (a known limitation; on-device encryption is handled at the OS level)
- Issues that require physical access to an unlocked device
- Bugs in Expo Go's development client (report these to Expo)
- Issues in dependencies that have already been publicly disclosed upstream

---

## Acknowledgements

We appreciate the security community's efforts in responsible disclosure. Reporters who help improve Ticku's security will be credited in the relevant release notes (unless anonymity is requested).

---

_This policy is adapted from common open source security templates and is appropriate for a local-first, offline mobile application._
