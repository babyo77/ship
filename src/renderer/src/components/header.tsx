/* eslint-disable prettier/prettier */

import { GoDeviceDesktop } from 'react-icons/go'
import { IoArrowDownOutline } from 'react-icons/io5'
import { VscDebugRestart } from 'react-icons/vsc'
function Header({ connected, length }: { connected: boolean; length: number }): JSX.Element {
  return (
    <header
      className={`border-b p-4 flex justify-between ${connected ? '' : 'text-zinc-400'} items-center`}
    >
      <div className=" flex gap-1.5 items-center">
        <GoDeviceDesktop className="h-7 w-7" />
        <p className=" tracking-tight leading-tight font-medium">
          {connected ? 'Connected' : 'Disconnected'}
        </p>
      </div>
      <div className="flex gap-3">
        <p className="flex items-center gap-1">
          <IoArrowDownOutline /> {length}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-zinc-100 flex items-center gap-1"
        >
          <VscDebugRestart className="h-5 w-5 hover:text-zinc-400 duration-300 transition-all" />
        </button>
      </div>
    </header>
  )
}
export default Header
