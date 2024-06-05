/* eslint-disable prettier/prettier */
import React from 'react'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { VscBug } from 'react-icons/vsc'

function Info(): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>
        <IoMdInformationCircleOutline className="h-8 w-8 p-1 pt-1.5 hover:text-zinc-400 duration-300 transition-all cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 w-[27rem]">
        <DialogHeader>
          <DialogTitle>Beta version</DialogTitle>
          <DialogDescription>
            <p className=" leading-tight">
              This app is still under development. Stay tuned for more updates. Feel free to connect
              with me.{' '}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className=" space-y-3 leading-tight font-normal text-zinc-400">
          <p>
            Ship is an Electron-based application designed made by{' '}
            <a href="" className="text-sm text-zinc-100">
              @babyo7_
            </a>{' '}
            for Windows, enabling seamless file transfers from your phone to your PC over the same
            Wi-Fi network. This app provides a convenient and secure way to transfer files without
            relying on internet access or using cables.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <DialogClose>
                <a
                  target="blank"
                  href="https://twitter.com/tanmay11117"
                  className="font-medium hover:text-zinc-400 transition-all duration-300 tracking-tight leading-tight text-zinc-200"
                >
                  Twitter
                </a>
              </DialogClose>
              <DialogClose>
                <a
                  target="blank"
                  href="https://www.instagram.com/babyo7_/"
                  className="font-medium hover:text-zinc-400 transition-all duration-300 tracking-tight leading-tight text-zinc-200"
                >
                  Instagram
                </a>
              </DialogClose>
            </div>
            <div className=" cursor-pointer hover:text-zinc-100 duration-300 transition-all">
              <a href="https://twitter.com/tanmay11117" target="blank">
                <VscBug />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Info
