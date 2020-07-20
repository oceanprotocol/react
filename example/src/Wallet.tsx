import React from 'react'
import { useOcean } from '@oceanprotocol/react'
import { useEffect } from 'react'

export function Wallet() {
  const { web3, ocean, connect, logout, accountId } = useOcean()
  const conn = async () => {
    const { default: WalletConnectProvider } = await import(
      '@walletconnect/web3-provider'
    )
    const providerOptions = {
      /* See Provider Options Section */
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: 'INFURA_ID' // required
        }
      }
    }

    await connect({ cacheProvider: true, providerOptions })
  }
  const init = async () => {
    if (ocean === undefined || accountId === undefined) return

    const assets = await ocean.assets.ownerAssets(accountId)
    console.log(assets)
  }
  useEffect(() => {
    init()
  }, [ocean, accountId])

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
