const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = process.env.NODE_ENV !== "production";
const startUrl =
  process.env.ELECTRON_START_URL ||
  `file://${path.join(__dirname, "..", "dist", "index.html")}`;

let mainWindow = null;
let backendProcess = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    backgroundColor: "#0b0f19",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const startBackendProcess = () => {
  if (isDev) return;
  const backendEntry = path.join(__dirname, "..", "dist", "server", "index.js");
  backendProcess = spawn(process.execPath, [backendEntry], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
  });
  backendProcess.on("exit", (code) => {
    backendProcess = null;
    if (code !== 0) {
      dialog.showErrorBox(
        "HarborPilot backend exited",
        `El backend finalizó con código ${code}. Revisa los logs en la consola.`
      );
    }
  });
};

const stopBackendProcess = () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
};

app.on("ready", () => {
  app.setAppUserModelId("HarborPilot.Desktop");
  startBackendProcess();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  stopBackendProcess();
});
