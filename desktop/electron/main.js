const { app, BrowserWindow, Menu, shell, Notification, ipcMain, nativeTheme } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";
const JAC_URL = process.env.JAC_URL ?? "https://YOUR_APP.replit.app";
const DEV_URL = "http://localhost:19610";

nativeTheme.themeSource = "dark";

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0a0a0f",
    title: "JAC Hub",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    // Custom title bar
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false,
  });

  // Show when ready (avoids flash)
  win.once("ready-to-show", () => {
    win.show();
    if (isDev) win.webContents.openDevTools();
  });

  // Load the app
  win.loadURL(isDev ? DEV_URL : JAC_URL);

  // Open external links in browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

function buildMenu(win) {
  const template = [
    {
      label: "JAC Hub",
      submenu: [
        { label: "Acerca de JAC Hub", role: "about" },
        { type: "separator" },
        { label: "Ocultar", role: "hide" },
        { type: "separator" },
        { label: "Salir", role: "quit" },
      ],
    },
    {
      label: "Vista",
      submenu: [
        { label: "Recargar", role: "reload" },
        { label: "Forzar recarga", role: "forceReload" },
        { type: "separator" },
        { label: "Acercar", role: "zoomIn" },
        { label: "Alejar", role: "zoomOut" },
        { label: "Tamaño real", role: "resetZoom" },
        { type: "separator" },
        { label: "Pantalla completa", role: "togglefullscreen" },
      ],
    },
    {
      label: "Ventana",
      submenu: [
        { label: "Minimizar", role: "minimize" },
        { label: "Zoom", role: "zoom" },
        { type: "separator" },
        { label: "Traer al frente", role: "front" },
      ],
    },
    {
      label: "Ayuda",
      submenu: [
        {
          label: "Abrir en navegador",
          click: () => shell.openExternal(isDev ? DEV_URL : JAC_URL),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC: native desktop notifications from renderer
ipcMain.on("notify", (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
});

app.whenReady().then(() => {
  const win = createWindow();
  buildMenu(win);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const w = createWindow();
      buildMenu(w);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
