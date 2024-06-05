import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import os from 'os'
import fs from 'fs'
import { createServer } from 'http'
import { Server } from 'socket.io'
const icon = path.join(__dirname, './icons.ico')
import { autoUpdater } from 'electron-updater'

autoUpdater.autoInstallOnAppQuit = true
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    icon: 'icons.ico',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  autoUpdater.checkForUpdates()
  const expressApp = express()
  const server = createServer(expressApp)
  const io = new Server(server, {
    cors: {
      origin: true
    }
  })

  expressApp.use(cors())
  expressApp.use(express.static('./resources/public'))
  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      try {
        if (!fs.existsSync(path.resolve('./uploads'))) {
          fs.mkdirSync(path.resolve('./uploads'))
        }
        return cb(null, './uploads')
      } catch (error) {
        io.emit('error', 'Error: operation not permitted, Run app as administrator')
      }
    },
    filename: function (_req, file, cb) {
      try {
        fs.writeFileSync('check.bin', '')
        return cb(null, file.originalname)
      } catch (error) {
        io.emit('error', 'Error: operation not permitted, Run app as administrator')
      }
    }
  })

  const upload = multer({ storage })
  const port = 7490

  expressApp.get('/info', (_req, res) => {
    const networkInterfaces = os.networkInterfaces()
    const address: string[] = []

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      const interfaceData = networkInterfaces[interfaceName]
      interfaceData?.forEach((data) => {
        if (data.family === 'IPv4' && !data.internal) {
          address.push(data.address + ':' + port)
        }
      })
    })

    const deviceInfo = {
      name: os.hostname(),
      platform: os.platform()
    }

    if (address.length > 0) {
      res.status(200).json({ info: deviceInfo, url: address })
    } else {
      res.status(500).json('No IPv4 address found')
    }
  })

  io.on('connection', (socket) => {
    socket.join('transfer')

    io.to('transfer').emit('joined', io.sockets.adapter.rooms.get('transfer')?.size)
    socket.on('disconnect', () => {
      io.to('transfer').emit('joined', io.sockets.adapter.rooms.get('transfer')?.size)
    })
  })

  expressApp.post('/upload', upload.array('file'), (req, res) => {
    try {
      io.emit('file', req.files)
      res.status(200).json('uploaded')
    } catch (error) {
      res.status(500).json(error)
      //@ts-expect-error:error message
      io.emit('error', `An error occurred: ${error.message}`)
    }
  })

  expressApp.get('/download', (req, res) => {
    try {
      const file = req.query.file as string
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${path.basename(path.resolve(file))}"`
      )
      res.setHeader('Content-Type', 'application/octet-stream')

      fs.createReadStream(path.resolve(file)).pipe(res)
    } catch (error) {
      //@ts-expect-error:error message
      io.emit('error', error.message)
      console.log(error)

      res.status(500).json(error)
    }
  })

  server.listen(port, () => {
    console.log(`listening on http://localhost:${port}`)
  })

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', app.getVersion())
  })
  ipcMain.on('reveal-in-explorer', (_event, file) => {
    try {
      if (file === './uploads') {
        if (!fs.existsSync(path.resolve(file))) {
          fs.mkdirSync(path.resolve('./uploads'))
        }
        shell.openPath(path.resolve(file))
        return
      }
      shell.showItemInFolder(path.resolve(file))

      if (!fs.existsSync(path.resolve(file))) {
        io.emit('error', "Can't open file: it is either deleted or moved to a different location.")
      }
    } catch (error) {
      //@ts-expect-error:error message
      io.emit('error', `An error occurred: ${error.message}`)
    }
  })

  ipcMain.handle('dialog:openFile', async (): Promise<unknown[] | undefined> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['multiSelections']
      })
      if (!canceled) {
        const files = filePaths.map((filePaths) => ({
          path: filePaths,
          originalname: path.basename(filePaths),
          size: fs.statSync(filePaths).size
        }))
        io.to('transfer').emit('PCFiles', files)
        return files
      }
      return undefined
    } catch (error) {
      io.emit('error', 'Error: unable to send files')
      return undefined
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
