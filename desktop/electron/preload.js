const { contextBridge, ipcRenderer } = require("electron");

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Send a native desktop notification
  notify: (title, body) => ipcRenderer.send("notify", { title, body }),

  // Platform info
  platform: process.platform,

  // App version
  version: process.env.npm_package_version ?? "1.0.0",

  // Check if running in Electron
  isElectron: true,
});
