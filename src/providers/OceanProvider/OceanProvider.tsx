import React, {
  ReactNode,
  useContext,
  useState,
  useEffect,
  createContext
} from 'react'
import { Ocean, Config, Account, Aquarius, Logger } from '@oceanprotocol/squid'
import Balance from '@oceanprotocol/squid/dist/node/models/Balance'
import { connectOcean } from './utils'

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
  status: OceanConnectionStatus
}

const OceanContext = createContext(null)

function OceanProvider({
  config,
  children
}: {
  config: Config
  children: ReactNode
}): ReactNode {
  // TODO: handle web3
  const { web3 } = useWeb3()
  const [ocean, setOcean] = useState<Ocean | undefined>()
  const [aquarius, setAquarius] = useState<Aquarius | undefined>()
  const [account, setAccount] = useState<Account | undefined>()
  const [accountId, setAccountId] = useState<string | undefined>()
  const [balance, setBalance] = useState<Balance | undefined>()
  const [status, setStatus] = useState<OceanConnectionStatus>(
    OceanConnectionStatus.NOT_CONNECTED
  )

  useEffect(() => {
    // on mount, connect to Aquarius instance right away
    const aquarius = new Aquarius(config.aquariusUri, Logger)
    setAquarius(aquarius)
  }, [])

  useEffect(() => {
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
    }

    try {
      init()
    } catch (error) {
      console.error(error.message)
      setStatus(OceanConnectionStatus.OCEAN_CONNECTION_ERROR)
      throw error.message
    }
  }, [web3])

  useEffect(() => {
    async function debug(): Promise<void> {
      if (!ocean) return
      console.debug(
        `Ocean instance initiated with:\n ${JSON.stringify(config, null, 2)}`
      )
      console.debug(await ocean.versions.get())
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
          status
        } as OceanProviderValue
      }
    >
      {children}
    </OceanContext.Provider>
  )
}

const useOcean = () => useContext(OceanContext)

export {
  OceanProvider,
  useOcean,
  OceanProviderValue,
  OceanConnectionStatus,
  Config
}
export default OceanProvider
