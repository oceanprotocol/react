import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement
} from 'react'
import Web3 from 'web3'
import ProviderStatus from './ProviderStatus'
import { Ocean, Logger, Account, Config } from '@oceanprotocol/lib'
import Web3Modal, { ICoreOptions } from 'web3modal'
import { getDefaultProviders } from './getDefaultProviders'
import { getAccountId, getBalance } from '../../utils'

interface Balance {
  eth: string | undefined
  ocean: string | undefined
}

interface OceanProviderValue {
  web3: Web3 | undefined
  web3Provider: any
  web3Modal: Web3Modal
  ocean: Ocean
  config: Config
  account: Account
  accountId: string
  balance: Balance
  chainId: number | undefined
  status: ProviderStatus
  connect: (config: Config) => Promise<void>
  logout: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const OceanContext = createContext(null)

function OceanProvider({
  initialConfig,
  web3ModalOpts,
  handleNetworkChanged,
  children
}: {
  initialConfig: Config
  web3ModalOpts?: Partial<ICoreOptions>
  handleNetworkChanged: (networkId: string | number) => Promise<void>
  children: any
}): ReactElement {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [web3Provider, setWeb3Provider] = useState<any | undefined>()
  const [ocean, setOcean] = useState<Ocean | undefined>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(null)
  const [chainId, setChainId] = useState<number | undefined>()
  const [account, setAccount] = useState<Account | undefined>()
  const [accountId, setAccountId] = useState<string | undefined>()
  const [config, setConfig] = useState<Config>(initialConfig)
  const [balance, setBalance] = useState<Balance | undefined>({
    eth: undefined,
    ocean: undefined
  })
  const [status, setStatus] = useState<ProviderStatus>(
    ProviderStatus.NOT_AVAILABLE
  )

  async function init() {
    Logger.log('Ocean Provider init')
    window &&
      window.ethereum &&
      (window.ethereum.autoRefreshOnNetworkChange = false)

    Logger.log('Web3Modal init.')
    if (web3ModalOpts === undefined) {
      web3ModalOpts = await getDefaultProviders()
    }
    const web3ModalInstance = new Web3Modal(web3ModalOpts)
    setWeb3Modal(web3ModalInstance)
    Logger.log('Web3Modal instance created.', web3ModalInstance)
  }

  // On mount setup Web3Modal instance
  useEffect(() => {
    init()
  }, [])

  // Connect automatically to cached provider if present
  useEffect(() => {
    if (!web3Modal) return
    web3Modal.cachedProvider && connect()
  }, [web3Modal])

  async function connect(newConfig?: Config) {
    try {
      Logger.log('Connecting ...')

      newConfig && setConfig(newConfig)

      const provider = await web3Modal.connect()
      setWeb3Provider(provider)

      const web3 = new Web3(provider)
      setWeb3(web3)
      Logger.log('Web3 created.', web3)

      const chainId = web3 && (await web3.eth.getChainId())
      setChainId(chainId)
      Logger.log('chain id ', chainId)

      newConfig.web3Provider = web3
      const ocean = await Ocean.getInstance(newConfig)
      setOcean(ocean)
      Logger.log('Ocean instance created.', ocean)

      setStatus(ProviderStatus.CONNECTED)

      const account = (await ocean.accounts.list())[0]
      setAccount(account)
      Logger.log('Account ', account)

      const accountId = await getAccountId(web3)
      setAccountId(accountId)
      Logger.log('account id', accountId)

      const balance = await getBalance(account)
      setBalance(balance)
      Logger.log('balance', JSON.stringify(balance))
    } catch (error) {
      Logger.error(error)
    }
  }
  async function refreshBalance() {
    const balance = await getBalance(account)
    setBalance(balance)
  }
  async function logout() {
    // TODO: #67 check how is the proper way to logout
    web3Modal.clearCachedProvider()
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    Logger.debug("Handling 'accountsChanged' event with payload", accounts)
    connect()
  }

  // TODO: #68 Refetch balance periodically, or figure out some event to subscribe to

  useEffect(() => {
    // web3Modal && web3Modal.on('connect', handleConnect)

    if (web3Provider !== undefined && web3Provider !== null) {
      web3Provider.on('accountsChanged', handleAccountsChanged)
      web3Provider.on('chainChanged', handleNetworkChanged)

      return () => {
        web3Provider.removeListener('accountsChanged', handleAccountsChanged)
        web3Provider.removeListener('chainChanged', handleNetworkChanged)
      }
    }
  }, [web3Modal, web3Provider])

  return (
    <OceanContext.Provider
      value={
        {
          web3,
          web3Provider,
          web3Modal,
          ocean,
          account,
          accountId,
          balance,
          chainId,
          status,
          config,
          connect,
          logout,
          refreshBalance
        } as OceanProviderValue
      }
    >
      {children}
    </OceanContext.Provider>
  )
}

// Helper hook to access the provider values
const useOcean = (): OceanProviderValue => useContext(OceanContext)

export { OceanProvider, useOcean, OceanProviderValue, Balance }
export default OceanProvider
