import React, { useCallback } from 'react'
import { useOcean } from '@oceanprotocol/react'
import { useEffect } from 'react'

export function Wallet() {
  const { ocean, connect, logout, accountId } = useOcean()

  const conn = async () => {
    await connect()
  }

  const init = useCallback(async () => {
    if (ocean === undefined || accountId === undefined) return
    await ocean.assets.ownerAssets(accountId)
  }, [accountId, ocean])

  useEffect(() => {
    init()
  }, [ocean, accountId, init])

  const disc = async () => {
    await logout()
    await conn()
  }

  return (
    <>
      <div>wallet</div>
      <div>
        <button onClick={conn}>Connect</button>
      </div>
      <div>
        <button onClick={disc}>Disconnect</button>
      </div>
      <div>{accountId}</div>
    </>
  )
}
