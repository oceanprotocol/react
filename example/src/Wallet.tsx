
import React from 'react';
import { useOcean } from '@oceanprotocol/react'
import { useEffect } from 'react';


export function Wallet() {

  const { ocean, connect, logout, accountId } = useOcean()
  const conn = async () => {
    const { default: WalletConnectProvider } = await import('@walletconnect/web3-provider')
    const { default: Torus } = await import("@toruslabs/torus-embed")

    const providerOptions = {
      /* See Provider Options Section */
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "INFURA_ID" // required
        }
      },
      torus: {
        package: Torus, // required
      }
    };

    await connect({ providerOptions })

  }
  const init = async () => {
    if(ocean === undefined) return
    console.log(ocean.datatokens.factoryAddress)

    const accs = await ocean.accounts.list()
    console.log(accs)
  }
  useEffect(() => {
    init()

  }, [ocean])

  const disc = async () => {
    await logout()
    await conn()
  }
  return (
    <>
      <div>wallet</div>
      <div><button onClick={conn}>Connect</button></div>

      <div><button onClick={disc}>Disconnect</button></div>

      <div>{accountId}</div>

    </>
  )
}