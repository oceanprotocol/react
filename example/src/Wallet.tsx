
import React, { useState } from 'react';
import { useOcean } from '@oceanprotocol/react'
import Web3Modal from "web3modal"
import Web3 from '@oceanprotocol/lib/node_modules/web3';
import { LogLevel } from '@oceanprotocol/lib/dist/node/utils';
import { Ocean, Config } from '@oceanprotocol/lib';
import { useEffect } from 'react';


export function Wallet() {

  const { ocean, connect, logout, accountId, account } = useOcean()
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