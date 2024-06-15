/* eslint-disable prettier/prettier */
import React from 'react'
import { MdQrCode } from 'react-icons/md'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import QrCode from './qr'
import { deviceInfo } from '@renderer/App'

function QRpopup({ deviceInfo }: { deviceInfo: deviceInfo }): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>
        <MdQrCode className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 w-[27rem]">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>
            <p className=" leading-tight">Scan to connect</p>
          </DialogDescription>
        </DialogHeader>
        <div className=" space-y-3 py-4 flex justify-center flex-col items-center leading-tight font-normal text-zinc-400">
          <QrCode deviceInfo={deviceInfo} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QRpopup
