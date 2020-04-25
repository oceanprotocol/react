import React, {
  ReactNode,
  useContext,
  useState,
  useEffect,
  createContext,
  FunctionComponent
} from 'react'
import { Ocean, Config } from '@oceanprotocol/squid'
import Balance from '@oceanprotocol/squid/dist/node/models/Balance'

enum OceanConnectionStatus {
  OCEAN_CONNECTION_ERROR = -1,
  NOT_CONNECTED = 0,
  CONNECTED = 1
}

interface OceanProviderValue {
  ocean: Ocean
  account: string
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
  const [account, setAccount] = useState<string | undefined>()
  const [balance, setBalance] = useState<Balance | undefined>()
  const [status, setStatus] = useState<OceanConnectionStatus>(
    OceanConnectionStatus.NOT_CONNECTED
  )

  useEffect(() => {
    async function init(): Promise<void> {
      console.debug('Connecting to Ocean...')
      const oceanInstance = await Ocean.getInstance({
        web3Provider: web3.currentProvider,
        ...config
      })
      console.debug('Ocean instance ready.')
      setOcean(oceanInstance)
      setStatus(OceanConnectionStatus.CONNECTED)

      const oceanAccounts = await oceanInstance.accounts.list()
      oceanAccounts && setAccount(oceanAccounts[0].getId())
      const { eth, ocn } = await oceanAccounts[0].getBalance()
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
      value={{ ocean, account, balance, status } as OceanProviderValue}
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
