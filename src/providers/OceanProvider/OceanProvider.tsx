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
  connect: (opts?: Partial<ICoreOptions>) => Promise<void>
  logout: () => Promise<void>
}

const OceanContext = createContext(null)

function OceanProvider({
  config,
  web3ModalOpts,
  children
}: {
  config: Config
  web3ModalOpts?: Partial<ICoreOptions>
  children: any
}): ReactElement {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [web3Provider, setWeb3Provider] = useState<any | undefined>()
  const [ocean, setOcean] = useState<Ocean | undefined>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(null)
  const [chainId, setChainId] = useState<number | undefined>()
  const [account, setAccount] = useState<Account | undefined>()
  const [accountId, setAccountId] = useState<string | undefined>()
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

  async function connect() {
    try {
      Logger.log('Connecting ...')

      const provider = await web3Modal.connect()
      setWeb3Provider(provider)

      const web3 = new Web3(provider)
      setWeb3(web3)
      Logger.log('Web3 created.', web3)

      const chainId = web3 && (await web3.eth.getChainId())
      setChainId(chainId)
      Logger.log('chain id ', chainId)

      config.web3Provider = web3
      const ocean = await Ocean.getInstance(config)
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

  async function logout() {
    // TODO: check how is the proper way to logout
    web3Modal.clearCachedProvider()
  }

  //
  // Listen for provider, account & network changes
  // and react to it
  //

  // const handleConnect = async (provider: any) => {
  //   Logger.debug("Handling 'connect' event with payload", provider)
  // }

  const handleAccountsChanged = async (accounts: string[]) => {
    Logger.debug("Handling 'accountsChanged' event with payload", accounts)
    connect()
  }

  const handleNetworkChanged = async (networkId: string | number) => {
    Logger.debug(
      "Handling 'networkChanged' event with payload",
      networkId,
      status
    )
    connect()
  }

  // TODO: Refetch balance periodically, or figure out some event to subscribe to

  useEffect(() => {
    // web3Modal && web3Modal.on('connect', handleConnect)

    if (web3Provider !== undefined && web3Provider !== null) {
      web3Provider.on('accountsChanged', handleAccountsChanged)
      web3Provider.on('networkChanged', handleNetworkChanged)

      return () => {
        web3Provider.removeListener('accountsChanged', handleAccountsChanged)
        web3Provider.removeListener('networkChanged', handleNetworkChanged)
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
          logout
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
