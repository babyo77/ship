/* eslint-disable prettier/prettier */
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { MdKeyboardCommandKey } from 'react-icons/md'

function Changelog({ version }: { version: string }): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>
        <MdKeyboardCommandKey className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 w-[27rem]">
        <DialogHeader>
          <DialogTitle>Ship </DialogTitle>
          <DialogDescription>
            <p className=" leading-tight">Changelog</p>
          </DialogDescription>
        </DialogHeader>
        <div className=" space-y-3 leading-tight font-normal text-zinc-400">
          <h1>Latest Release {version}</h1>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Changelog
