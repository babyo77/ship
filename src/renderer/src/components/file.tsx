/* eslint-disable prettier/prettier */
import { useCallback } from 'react'
import { GoFile } from 'react-icons/go'
import { IoFolderOpenOutline } from 'react-icons/io5'

function Files({ fileInfo }: { fileInfo: Express.Multer.File }): React.JSX.Element {
  const ipcHandle = (): void =>
    window.electron.ipcRenderer.send('reveal-in-explorer', fileInfo.path)

  const getFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0bytes'
    const k = 1024
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseInt((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])
  return (
    <div
      onClick={ipcHandle}
      className={`border py-3.5 px-3.5 gap-1 
 text-zinc-100
 rounded-sm flex items-center hover:text-zinc-400 transition-all duration-300 cursor-pointer justify-start w-full`}
    >
      <GoFile className="h-10 w-10" />
      <div className="w-full pr-2 gap-0.5 flex flex-col">
        <p className=" leading-tight   max-w-[60dvw] truncate">{fileInfo.originalname}</p>

        <p className=" leading-tight -mt-1 md:-mt-0.5 text-xs font-normal">
          {getFileSize(fileInfo.size)}
        </p>
      </div>
      <div className="pl-1 cursor-pointer ">
        <IoFolderOpenOutline className="h-5 w-5" />
      </div>
    </div>
  )
}

export default Files
