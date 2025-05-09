import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  dialog,
  clipboard,
  Tray,
  Menu,
  Notification,
  nativeImage,
} from "electron";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import express, { NextFunction, Response, Request } from "express";
import multer from "multer";
import cors from "cors";
import os from "os";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import clipboardListener from "clipboard-event";
const globalIcon = "./resources/icons.ico";
const securityFile = "./security.json";
let tray: Tray | null = null;
let Hidden: boolean = false;
let SecurityStatus: boolean = false;
let CurrentWindow: BrowserWindow | null = null;
function checkSecurity(): void {
  if (!fs.existsSync(securityFile)) {
    fs.writeFileSync(securityFile, JSON.stringify(false), "utf-8");
    ipcMain.emit("security", false);
  } else {
    updatedSecurityStatus();
  }
}

function updatedSecurityStatus(): boolean {
  const security = fs.readFileSync(securityFile, "utf-8");
  const status: boolean = JSON.parse(security);
  SecurityStatus = status;
  return status;
}

// for privacy
function randomNumber(): number {
  const number = Math.floor(Math.random() * (9000 - 1000 + 1)) + 1000;
  ipcMain.emit("code", number);
  return number;
}

const SecurityCode = randomNumber();

const SecureConnection = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (updatedSecurityStatus()) {
    const code = req.headers.referer;
    if (req.headers.host === "localhost:7490") {
      return next();
    }
    if (req.query.code === String(SecurityCode)) {
      return next();
    }
    if (code && code.includes(String(SecurityCode))) {
      return next();
    }
    res.status(403).send();
    return;
  }
  return next();
};

checkSecurity();
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: "icons.ico",
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon: globalIcon } : {}),
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      navigateOnDragDrop: true,
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });
  CurrentWindow = mainWindow;
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  const lock = app.requestSingleInstanceLock();
  if (!lock) {
    app.quit();
  } else {
    app.on("second-instance", () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Tray setup
  const icon = nativeImage.createFromPath(globalIcon);
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit Ship",
      click: (): void => {
        try {
          if (fs.existsSync("./clipboard.json")) {
            fs.unlinkSync("./clipboard.json");
          }
        } catch (error) {
          console.log(error);
        }
        clipboardListener.stopListening();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Ship");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  // Window listeners
  mainWindow.on("close", (event) => {
    if (mainWindow.isVisible()) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("hide", () => {
    Hidden = true;
  });

  mainWindow.on("show", () => {
    Hidden = false;
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  // remove old clipboard text
  if (fs.existsSync("./clipboard.json")) {
    fs.unlinkSync("./clipboard.json");
  }
  // express server
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(SecureConnection);
  expressApp.use(express.static("./resources/public"));

  const server = createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: true,
    },
  });
  const port = 7490;

  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      try {
        if (!fs.existsSync(path.resolve("./uploads"))) {
          fs.mkdirSync(path.resolve("./uploads"));
        }
        return cb(null, "./uploads");
      } catch (error) {
        io.emit(
          "error",
          "Error: operation not permitted, Run app as administrator",
        );
      }
    },
    filename: function (_req, file, cb) {
      try {
        fs.writeFileSync("check.bin", "");
        return cb(null, file.originalname);
      } catch (error) {
        io.emit(
          "error",
          "Error: operation not permitted, Run app as administrator",
        );
      }
    },
  });

  const upload = multer({ storage });
  expressApp.post("/upload", upload.array("file"), (req, res) => {
    try {
      const files = req.files ?? [];

      if (req.files && Array.isArray(files)) {
        if (Hidden) {
          const notification = new Notification({
            icon: path.resolve(globalIcon),
            title: "Recieved a new File",
            silent: false,
            body: "Tap to view",
            actions: [{ text: "Show", type: "button" }],
          });
          notification.show();
          notification.on("click", () => {
            const firstFile = files[0].path;
            shell.showItemInFolder(path.resolve(firstFile));
          });
        }
      }

      io.emit("file", req.files || []);
      res.status(200).json(req.files);
    } catch (error) {
      res.status(500).json(error);
      //@ts-expect-error:error message
      io.emit("error", `An error occurred: ${error.message}`);
    }
  });

  expressApp.get("/info", (_req, res) => {
    const networkInterfaces = os.networkInterfaces();
    const address: string[] = [];

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
      res.status(200).json({
        info: deviceInfo,
        url: address,
        platform: os.hostname(),
        code: SecurityCode,
      });
    } else {
      res.status(500).json("No IPv4 address found");
    }
  });

  // socket listeners
  io.use((socket, next) => {
    if (updatedSecurityStatus()) {
      if (
        socket.handshake.headers.host === "localhost:7490" ||
        socket.handshake.headers.referer?.includes(String(SecurityCode))
      ) {
        return next();
      } else {
        socket.disconnect(true);
      }
    } else {
      return next();
    }
  });
  io.on("connection", (socket) => {
    socket.join("transfer");
    io.emit("security", updatedSecurityStatus());
    io.to("transfer").emit(
      "joined",
      io.sockets.adapter.rooms.get("transfer")?.size,
    );
    socket.on("disconnect", () => {
      io.to("transfer").emit(
        "joined",
        io.sockets.adapter.rooms.get("transfer")?.size,
      );
    });
    socket.on("text", (text) => {
      if (Hidden) {
        const notification = new Notification({
          icon: path.resolve(globalIcon),
          title: "Received clipboard text",
          silent: false,
          body: "Tap to view",
        });
        notification.show();
        notification.on("click", () => {
          CurrentWindow?.show();
          CurrentWindow?.focus();
          io.to("transfer").emit("clipboard:notification");
        });
      }
      socket.broadcast.to("transfer").emit("text", text);
    });
    socket.on("phone", (file) => {
      socket.broadcast.to("transfer").emit("PCFiles", file);
    });
  });

  expressApp.get("/clipboard", (_req, res) => {
    if (fs.existsSync("./clipboard.json")) {
      res.setHeader("Content-Type", "application/json");
      const stream = fs.createReadStream("./clipboard.json");
      stream.pipe(res);
    } else {
      res.status(404).send();
    }
  });
  expressApp.get("/download", (req, res) => {
    try {
      const file = req.query.file as string;
      if (fs.existsSync(path.resolve(file))) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${path.basename(path.resolve(file))}"`,
        );
        res.setHeader("Content-Type", "application/octet-stream");

        fs.createReadStream(path.resolve(file)).pipe(res);
      } else {
        res
          .status(404)
          .send(
            "Can't open file: it is either deleted or moved to a different location.",
          );
      }
    } catch (error) {
      //@ts-expect-error:error message
      io.emit("error", error.message);
      console.log(error);

      res.status(500).json(error);
    }
  });

  server.on("error", (e) => {
    io.emit("error", e.message);
    console.log(e);
  });
  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`);
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId("Ship");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // clipboard sync
  clipboardListener.startListening();
  clipboardListener.on("change", () => {
    const text = clipboard.readText("clipboard");
    if (text.trim().length === 0) return;
    if (!fs.existsSync("./clipboard.json")) {
      fs.writeFileSync("./clipboard.json", JSON.stringify([], null, 2), "utf8");
    }
    const preload = JSON.parse(fs.readFileSync("./clipboard.json", "utf-8"));
    const jsonData = [{ text: text }, ...preload];
    fs.writeFileSync(
      "./clipboard.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
    );
  });

  // IPC Listeners
  ipcMain.on("app_version", (event) => {
    event.sender.send("app_version", app.getVersion());
  });
  ipcMain.on("updateSecurity", () => {
    if (fs.existsSync(securityFile)) {
      fs.writeFileSync(securityFile, JSON.stringify(!SecurityStatus), "utf-8");
      io.emit("security", updatedSecurityStatus());
    }
  });
  ipcMain.on("reveal-in-explorer", (_event, file) => {
    try {
      if (file === "./uploads") {
        if (!fs.existsSync(path.resolve(file))) {
          fs.mkdirSync(path.resolve("./uploads"));
        }
        shell.openPath(path.resolve(file));
        return;
      }
      shell.showItemInFolder(path.resolve(file));

      if (!fs.existsSync(path.resolve(file))) {
        io.emit(
          "error",
          "Can't open file: it is either deleted or moved to a different location.",
        );
      }
    } catch (error) {
      //@ts-expect-error:error message
      io.emit("error", `An error occurred: ${error.message}`);
    }
  });
  ipcMain.handle(
    "dialog:openFile",
    async (): Promise<unknown[] | undefined> => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          properties: ["multiSelections", "openFile", "openDirectory"],
          securityScopedBookmarks: true,
        });
        if (!canceled) {
          const files = filePaths.map((filePath) => ({
            path: filePath,
            originalname: path.basename(filePath),
            size: fs.statSync(filePath).size,
          }));
          io.to("transfer").emit("PCFiles", files);
          return files;
        }
        return undefined;
      } catch (error) {
        io.emit("error", "Error: unable to send files");
        return undefined;
      }
    },
  );

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    clipboardListener.stopListening();
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
