/* eslint-disable prettier/prettier */
import { deviceInfo } from '@renderer/App'
import { QRCodeSVG } from 'qrcode.react'
import React, { useCallback, useState } from 'react'

function QrCode({ deviceInfo }: { deviceInfo: deviceInfo }): React.JSX.Element {
  const [index, setIndex] = useState<number>(parseInt(localStorage.getItem('index') || '0'))
  const updateIndex = useCallback(() => {
    const index = (parseInt(localStorage.getItem('index') || '0') + 1) % deviceInfo.url.length
    localStorage.setItem('index', String(index))
    setIndex(index)
  }, [])

  return (
    <>
      <QRCodeSVG
        className=" rounded-sm"
        value={`http://${deviceInfo.url[index]}?code=${deviceInfo.code}`}
        size={200}
        includeMargin
      />
      <div className="text-center">
        <p>Scan this QR from your device</p>

        <p className="text-zinc-400 select-none text-xs cursor-pointer hover:text-zinc-200 duration-300 transition-all">
          Not working? <span onClick={updateIndex}>Change QR</span>
        </p>
      </div>
    </>
  )
}

export default QrCode
