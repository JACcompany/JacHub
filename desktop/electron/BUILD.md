# JAC Hub — Desktop Build Guide

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

```bash
cd desktop/electron
npm install
```

## Configure the App URL

Edit `main.js` and set your deployed URL:

```js
const JAC_URL = "https://YOUR_APP.replit.app";
```

## Run in Development

```bash
# Start the JAC Hub dev server first (in workspace root):
pnpm --filter @workspace/jac-hub run dev

# Then in another terminal:
cd desktop/electron
npm run start:dev
```

## Build Windows (.exe)

```bash
cd desktop/electron
npm install
npm run build:win
# Output: dist-electron/JAC Hub Setup 1.0.0.exe
```

## Build macOS (.dmg)

```bash
npm run build:mac
# Output: dist-electron/JAC Hub-1.0.0.dmg
```

## Build Linux (.AppImage)

```bash
npm run build:linux
# Output: dist-electron/JAC Hub-1.0.0.AppImage
```

## Notes

- The desktop app wraps the deployed web app URL
- All features work identically to the browser version
- Native notifications are enabled via the Electron IPC bridge
- Window state (size/position) is remembered between sessions
