/* eslint-disable prettier/prettier */

import React, { Dispatch, SetStateAction, useCallback } from 'react'
import {
  Dialog,
  //   DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { SendFile } from '@renderer/App'
import { LiaFileUploadSolid } from 'react-icons/lia'
import Files from './file'
import { FiSend } from 'react-icons/fi'
import { toast } from 'sonner'

function Sendfile({
  sentFile,
  setSentFile
}: {
  sentFile: SendFile[]
  setSentFile: Dispatch<SetStateAction<SendFile[]>>
}): React.JSX.Element {
  const openDialog = useCallback(async () => {
    window.electron.ipcRenderer.send('dialog:openFile')
    const file = (await window.electron.ipcRenderer.invoke('dialog:openFile')) as SendFile[]
    if (file) {
      try {
        setSentFile((prev) => [...file, ...prev])
        toast.message('File sent successfully', {
          position: 'bottom-left'
        })
      } catch (error) {
        toast.error('Error: Unable to send File', {
          position: 'bottom-left'
        })
      }
    }
  }, [])

  return (
    <Dialog>
      <DialogTrigger>
        <LiaFileUploadSolid className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 h-[90dvh] w-[80dvw]">
        <DialogHeader>
          <DialogTitle>Send Files from PC</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {sentFile.length === 0 && (
          <div className="h-[77dvh] flex justify-center items-center">
            <FiSend
              onClick={openDialog}
              className="h-11 cursor-pointer text-zinc-400 hover:text-zinc-100 duration-300 transition-all w-11 p-1 pt-1.5 "
            />
          </div>
        )}
        <div className="leading-tight font-normal text-zinc-400">
          <div className="flex h-[74dvh] gap-2.5 overflow-y-scroll justify-start items-center flex-col">
            {sentFile.map((file, i) => (
              <Files key={file.originalname + i} fileInfo={file as Express.Multer.File} />
            ))}
          </div>
          <div className="bottom-0 right-0.5 cursor-pointer hover:text-zinc-200 transition-all duration-300 fixed py-2 px-2 items-center flex justify-center rounded-full">
            {sentFile.length > 0 && <FiSend onClick={openDialog} className="h-7 w-7 p-1 pt-1.5 " />}
          </div>
          <div className="bottom-0 left-0.5 cursor-pointer hover:text-zinc-200 transition-all duration-300 fixed py-2 px-2 items-center flex justify-center rounded-full">
            {sentFile.length > 0 && <p className="text-xs text-zinc-500">Sent {sentFile.length}</p>}
            {sentFile.length > 0 && (
              <p
                onClick={() => setSentFile([])}
                className="text-xs text-zinc-500 ml-1.5 hover:text-zinc-200 duration-300 transition-all"
              >
                Clear
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="py-11"></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Sendfile
