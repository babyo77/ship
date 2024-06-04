"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const os = require("os");
const fs = require("fs");
const http = require("http");
const socket_io = require("socket.io");
const { autoUpdater } = require("electron-updater");
const icon = path.join(__dirname, "./icons.ico");
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: "icons.ico",
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  const io = new socket_io.Server(server, {
    cors: {
      origin: true,
    },
  });
  expressApp.use(cors());
  expressApp.use(express.static("public"));
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      try {
        if (!fs.existsSync(path.resolve("./uploads"))) {
          fs.mkdirSync(path.resolve("./uploads"));
        }
        return cb(null, "./uploads");
      } catch (error) {
        io.emit("error", "Run app as administrator");
      }
    },
    filename: function (_req, file, cb) {
      try {
        return cb(null, file.originalname);
      } catch (error) {
        io.emit("error", "Run app as administrator");
      }
    },
  });
  const upload = multer({ storage });
  const port = 7490;
  expressApp.get("/info", (_req, res) => {
    const networkInterfaces = os.networkInterfaces();
    const address = [];
    Object.keys(networkInterfaces).forEach((interfaceName) => {
      const interfaceData = networkInterfaces[interfaceName];
      interfaceData?.forEach((data) => {
        if (data.family === "IPv4" && !data.internal) {
          address.push(data.address + ":" + port);
        }
      });
    });
    const deviceInfo = {
      name: os.hostname(),
      platform: os.platform(),
    };
    if (address.length > 0) {
      res.status(200).json({ info: deviceInfo, url: address });
    } else {
      res.status(500).json("No IPv4 address found");
    }
  });
  io.on("connection", (socket) => {
    socket.join("transfer");
    io.to("transfer").emit(
      "joined",
      io.sockets.adapter.rooms.get("transfer")?.size
    );
    socket.on("disconnect", () => {
      io.to("transfer").emit(
        "joined",
        io.sockets.adapter.rooms.get("transfer")?.size
      );
    });
  });
  expressApp.post("/upload", upload.array("file"), (req, res) => {
    try {
      io.emit("file", req.files);
      res.status(200).json("ok");
    } catch (error) {
      io.emit("error", `An error occurred: ${error.message}`);
    }
  });
  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.on("app_version", (event) => {
    event.sender.send("app_version", electron.app.getVersion());
  });
  electron.ipcMain.on("reveal-in-explorer", (_event, file) => {
    try {
      if (file === "./uploads") {
        if (!fs.existsSync(path.resolve(file))) {
          fs.mkdirSync(path.resolve("./uploads"));
        }
        electron.shell.openPath(path.resolve(file));
        return;
      }
      electron.shell.showItemInFolder(path.resolve(file));
      if (!fs.existsSync(path.resolve(file))) {
        io.emit(
          "error",
          "Can't open file: it is either deleted or moved to a different location."
        );
      }
    } catch (error) {
      io.emit("error", `An error occurred: ${error.message}`);
    }
  });
  createWindow();
  setInterval(() => autoUpdater.checkForUpdates(), 600000);

  autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Ok"],
      title: "Update Available",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail:
        "A new version download started. The app will be restarted to install the update.",
    };
    electron.dialog.showMessageBox(dialogOpts);

    updateInterval = null;
  });

  electron.app.on("activate", function () {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
