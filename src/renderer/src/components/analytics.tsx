/* eslint-disable prettier/prettier */
import React from 'react'
import { IoAnalytics } from 'react-icons/io5'
import {
  Dialog,
  //   DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
function Analytics(): React.JSX.Element {
  return (
    <Dialog>
      <DialogTrigger>
        <IoAnalytics className="h-6 w-6" />
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 h-[90dvh] w-[80dvw]">
        <DialogHeader>
          <DialogTitle>Analytics</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default Analytics
