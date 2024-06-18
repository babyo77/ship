/* eslint-disable prettier/prettier */
import { LiaClipboardSolid } from 'react-icons/lia'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { PiCopySimpleLight } from 'react-icons/pi'
import { toast } from 'sonner'
import React, { forwardRef, useEffect, useState } from 'react'
import socket from '@renderer/Socket/socket'

export interface clipboard {
  text: string
}
interface ClipboardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Clipboard: React.ForwardRefRenderFunction<HTMLButtonElement, ClipboardProps> = (
  props,
  ref
) => {
  const [data, setData] = useState<clipboard[]>([])
  const handelCopy = (text: string): void => {
    navigator.clipboard.writeText(text)
    toast.success('Text Copied')
  }

  useEffect(() => {
    const handleText = (data: clipboard[]): void => {
      if (Array.isArray(data) && data.every((item) => typeof item.text === 'string')) {
        setData((prevData) => [...data, ...prevData])
      } else {
        console.error('Invalid data format for clipboard')
      }
    }
    socket.on('text', handleText)
    return () => {
      socket.off('text', handleText)
    }
  }, [])
  return (
    <Dialog>
      <DialogTrigger ref={ref} {...props}>
        <LiaClipboardSolid className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 h-[90dvh] w-[80dvw]">
        <DialogHeader>
          <DialogTitle>Clipboard Texts</DialogTitle>
          <DialogDescription>Copied text from your Phone will appear here</DialogDescription>
        </DialogHeader>
        <div className="leading-tight font-normal text-zinc-100">
          <div className="flex h-[74dvh] gap-3 overflow-y-scroll justify-start items-center flex-col">
            {data &&
              data.slice(0, 100).map(({ text }, index) => (
                <div
                  key={text + index}
                  className="border max-w-[75dvw] w-full break-words p-4 rounded-md relative"
                >
                  <p>{text}</p>
                  <div>
                    <PiCopySimpleLight
                      onClick={() => handelCopy(text)}
                      className="h-5 w-5 hover:text-zinc-400 duration-500 transition-all cursor-pointer absolute bottom-2 right-2"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter className="py-11"></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(Clipboard)
