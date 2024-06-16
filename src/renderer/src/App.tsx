import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { endpoint } from './api/api'
import Header from './components/header'
import Files from './components/file'
import QrCode from './components/qr'
import Info from './components/info'
import socket from './Socket/socket'
import { Toaster, toast } from 'sonner'
import { IoFolderOpenOutline } from 'react-icons/io5'
import Sendfile from './components/sendfile'
// import Changelog from './components/Changelog'
import { LuShieldCheck, LuShieldClose } from 'react-icons/lu'
import QRpopup from './components/qrPopup'
import Clipboard from './components/clipboard'
export interface deviceInfo {
  info: {
    platform: string
    name: string
  }
  url: string[]
  os: string
  code: string
}

export interface SendFile {
  path: string
  originalname: string
  size: number
}
function App(): React.JSX.Element {
  const [deviceInfo, setDeviceInfo] = useState<deviceInfo | null>(null)
  const [files, setFiles] = useState<Express.Multer.File[]>([])
  const [connected, setConnected] = useState(false)
  const [version, setVersion] = useState<string>()

  const openDownloads = (): void =>
    window.electron.ipcRenderer.send('reveal-in-explorer', `./uploads`)

  useEffect(() => {
    window.electron.ipcRenderer.send('app_version')
    window.electron.ipcRenderer.on('app_version', (_event, arg: string) => {
      setVersion(arg)
      try {
        fetch('https://ship-backend.vercel.app/version').then((response) => {
          response.json().then((res) => {
            const data: {
              version: string
              downloadURL: string
            } = res
            if (data.version !== arg) {
              toast('new version available', {
                duration: Infinity,
                action: {
                  label: 'Update',
                  onClick: () => {
                    const a = document.createElement('a')
                    a.href = data.downloadURL
                    a.download
                    a.click()
                  }
                }
              })
            }
          })
        })
      } catch (error) {
        console.log(error)
      }
      window.electron.ipcRenderer.removeAllListeners('app_version')
    })
    if (!localStorage.getItem('index')) {
      localStorage.setItem('index', '0')
    }
  }, [])

  useEffect(() => {
    axios.get(endpoint + 'info').then((res) => {
      setDeviceInfo(res.data)
      try {
        if (!localStorage.getItem('id')) {
          axios.get(`https://ship-backend.vercel.app/user?p=${res.data.platform}`).then(() => {
            localStorage.setItem('id', '1')
          })
        }
      } catch (error) {
        console.log(error)
      }
    })

    const recievedFile = (e: Express.Multer.File[]): void => {
      setFiles((prev) => [...e, ...prev])
    }
    const isConnected = (size: number): void => {
      if (size > 1) {
        setConnected(true)
      } else {
        setConnected(false)
      }
    }
    const handleError = (error: string): void => {
      toast.error(error)
    }
    socket.on('joined', isConnected)
    socket.on('error', handleError)
    socket.on('file', recievedFile)
    return () => {
      socket.off('error', handleError)
      socket.off('joined', isConnected)
      socket.off('file', recievedFile)
    }
  }, [])

  const [sentFile, setSentFile] = useState<SendFile[]>([])
  const [secure, setSecure] = useState<boolean>(false)
  useEffect(() => {
    const handleSecurity = (status: boolean): void => {
      setSecure(status)
      if (status) {
        toast.success('Secure connection.')
      } else {
        toast.warning(
          'Warning: Insecure connection detected. Consider enabling if you are on public WiFi.'
        )
      }
    }
    socket.on('security', handleSecurity)

    return () => {
      socket.off('security', handleSecurity)
    }
  }, [])
  const fileRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <Toaster richColors />
      <Header connected={connected} length={files.length} />
      {connected && (
        <div
          draggable
          onDragOver={(e) => (e.preventDefault(), e.stopPropagation(), fileRef.current?.click())}
          className="flex h-[90dvh] py-3.5 pl-11 gap-2.5 px-2 overflow-y-scroll justify-start items-center flex-col"
        >
          {files.map((file, i) => (
            <Files key={file.originalname + i} fileInfo={file} />
          ))}
        </div>
      )}
      {!connected && (
        <div className="flex  h-[87dvh] px-2 justify-center items-center flex-col gap-3">
          <p className="text-center">
            Please ensure that you are connected to the same <br />
            Wi-Fi or Hotspot before proceeding.
          </p>
          {deviceInfo && <QrCode deviceInfo={deviceInfo} />}
        </div>
      )}

      <div className="fixed flex flex-col bottom-2.5 left-2 items-center space-y-1">
        <div>
          <IoFolderOpenOutline
            onClick={openDownloads}
            className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer"
          />
        </div>
        <div>
          {secure ? (
            <LuShieldCheck
              onClick={() => window.electron.ipcRenderer.send('updateSecurity')}
              className="h-8 w-8 p-1 pt-1.5 duration-300 transition-all cursor-pointer text-green-500"
            />
          ) : (
            <LuShieldClose
              onClick={() => window.electron.ipcRenderer.send('updateSecurity')}
              className="h-8 w-8 p-1 pt-1.5 duration-300 transition-all cursor-pointer text-red-500"
            />
          )}
        </div>

        {connected && <Sendfile ref={fileRef} setSentFile={setSentFile} sentFile={sentFile} />}

        {/* {version && <Changelog version={version} />} */}
        {connected && <Clipboard />}
        {deviceInfo && connected && <QRpopup deviceInfo={deviceInfo} />}
        <Info />
      </div>
      {files.length == 0 && (
        <div className="bottom-2.5 text-xs text-zinc-700 font-normal leading-tight right-2 fixed ">
          <p>{version}</p>
        </div>
      )}
    </>
  )
}

export default App
