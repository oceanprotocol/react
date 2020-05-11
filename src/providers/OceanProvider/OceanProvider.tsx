import React, { useContext, useState, useEffect, createContext } from 'react'
import { Ocean, Config, Account, Aquarius, Logger } from '@oceanprotocol/squid'
import Web3 from 'web3'
import Balance from '@oceanprotocol/squid/dist/node/models/Balance'
import { connectOcean } from './utils'
import { useWeb3, InjectedProviderStatus } from '../Web3Provider'

enum OceanConnectionStatus {
  OCEAN_CONNECTION_ERROR = -1,
  NOT_CONNECTED = 0,
  CONNECTED = 1
}

interface OceanProviderValue {
  aquarius: Aquarius
  ocean: Ocean
  account: Account
  accountId: string
  balance: Balance
  balanceInOcean: string
  status: OceanConnectionStatus
  config: Config
}

const OceanContext = createContext(null)

function OceanProvider({
  config,
  children
}: {
  config: Config
  children: any
}): any {
  const [ocean, setOcean] = useState<Ocean | undefined>()
  const [aquarius, setAquarius] = useState<Aquarius | undefined>()
  const [account, setAccount] = useState<Account | undefined>()
  const [accountId, setAccountId] = useState<string | undefined>()
  const [balance, setBalance] = useState<Balance | undefined>()
  const [balanceInOcean, setBalanceInOcean] = useState<string | undefined>()
  const [status, setStatus] = useState<OceanConnectionStatus>(
    OceanConnectionStatus.NOT_CONNECTED
  )
  const { web3,ethProviderStatus  } = useWeb3()

  // -------------------------------------------------------------
  // 1. On mount, connect to Aquarius instance right away
  // -------------------------------------------------------------
  useEffect(() => {
    const aquarius = new Aquarius(config.aquariusUri, Logger)
    setAquarius(aquarius)
  }, [])

  // -------------------------------------------------------------
  // 2. Once `web3` becomes available, connect to the whole network
  // -------------------------------------------------------------
  useEffect(() => {
    if (!web3 || ethProviderStatus!= InjectedProviderStatus.CONNECTED ) return
    console.log(ethProviderStatus)
    async function init(): Promise<void> {
      const { ocean, account, accountId, balance } = await connectOcean(
        web3,
        config
      )
      setOcean(ocean)
      setStatus(OceanConnectionStatus.CONNECTED)
      setAccount(account)
      setAccountId(accountId)
      setBalance(balance)
      setBalanceInOcean(`${balance?.ocn}`)
    }

    try {
      init()
    } catch (error) {
      console.error(error.message)
      setStatus(OceanConnectionStatus.OCEAN_CONNECTION_ERROR)
      throw error.message
    }
  }, [web3])

  // -------------------------------------------------------------
  // 3. Once `ocean` becomes available, spit out some info about it
  // -------------------------------------------------------------
  useEffect(() => {
    async function debug(): Promise<void> {
      if (!ocean) return
      Logger.debug(
        `Ocean instance initiated with:\n ${JSON.stringify(config, null, 2)}`
      )
      Logger.debug(await ocean.versions.get())
    }
    debug()
  }, [ocean])

  return (
    <OceanContext.Provider
      value={
        {
          ocean,
          aquarius,
          account,
          accountId,
          balance,
          balanceInOcean,
          status,
          config
        } as OceanProviderValue
      }
    >
      {children}
    </OceanContext.Provider>
  )
}

// Helper hook to access the provider values
const useOcean = (): OceanProviderValue => useContext(OceanContext)

export {
  OceanProvider,
  useOcean,
  OceanProviderValue,
  OceanConnectionStatus,
  Config
}
export default OceanProvider
