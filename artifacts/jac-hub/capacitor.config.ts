import type { CapacitorConfig } from "@capacitor/cli";

/**
 * JAC Hub — Capacitor Android configuration
 *
 * BUILD STEPS (run locally with Android Studio installed):
 *   1. pnpm --filter @workspace/jac-hub run build
 *   2. npx cap add android          (first time only)
 *   3. npx cap sync android
 *   4. npx cap open android         (opens Android Studio)
 *   5. Build → Generate Signed APK in Android Studio
 *
 * For development with live-reload:
 *   - Set server.url to your local/deployed API URL
 *   - Run: npx cap run android --livereload
 */

const deployedUrl = process.env["VITE_APP_URL"] ?? "https://YOUR_APP.replit.app";

const config: CapacitorConfig = {
  appId: "dev.jac.hub",
  appName: "JAC Hub",
  webDir: "dist",
  server: {
    url: deployedUrl,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#0a0a0f",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0a0a0f",
      showSpinner: false,
      androidSpinnerStyle: "small",
      spinnerColor: "#00ff88",
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0a0a0f",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
