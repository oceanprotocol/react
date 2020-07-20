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
  connect: (opts?: Partial<ICoreOptions>) => void
  logout: () => void
}

const OceanContext = createContext(null)

function OceanProvider({
  config,
  children
}: {
  config: Config
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
  const [web3ModalOpts, setWeb3ModalOpts] = useState<Partial<ICoreOptions>>()

  function init() {
    Logger.log('Ocean Provider init')
    window &&
      window.ethereum &&
      (window.ethereum.autoRefreshOnNetworkChange = false)
  }

  // On mount setup Web3Modal instance
  useEffect(() => {
    init()
  }, [])

  async function connect(opts?: Partial<ICoreOptions>) {
    Logger.log('Connecting ....')
    if (opts === undefined) {
      opts = await getDefaultProviders()
    }

    const instance = new Web3Modal(opts)
    setWeb3Modal(instance)
    Logger.log('Web3Modal instance created.', instance)

    const provider = await instance.connect()
    setWeb3Provider(provider)

    const web3 = new Web3(provider)
    setWeb3(web3)

    config.web3Provider = web3
    const ocean = await Ocean.getInstance(config)

    setOcean(ocean)
    Logger.log('Ocean instance created.', ocean)
    Logger.log('Web3 created.', web3)
    setStatus(ProviderStatus.CONNECTED)

    const account = (await ocean.accounts.list())[0]
    setAccount(account)
    Logger.log('Account ', account)

    const accountId = await getAccountId(web3)
    setAccountId(accountId)
    Logger.log('account id', accountId)

    const balance = await getBalance(web3, account)
    setBalance(balance)
    Logger.log('balance', JSON.stringify(balance))

    const chainId = web3 && (await web3.eth.getChainId())
    setChainId(chainId)
    Logger.log('chain id ', chainId)
  }

  async function logout() {
    // ToDo check how is the proper way to logout
    web3Modal.clearCachedProvider()
  }

  async function getAccountId(web3: Web3) {
    const accounts = await web3.eth.getAccounts()
    return accounts[0]
  }

  async function getBalance(web3: Web3, account: Account) {
    const balanceEth = await web3.eth.getBalance(await getAccountId(web3)) // returns wei
    const balanceOcean = await account.getOceanBalance() // returns ocean

    return {
      eth: Web3.utils.fromWei(balanceEth),
      ocean: balanceOcean
    }
  }

  //
  // Listen for provider, account & network changes
  // and react to it
  //
  const handleConnect = async (provider: any) => {
    Logger.debug("Handling 'connect' event with payload", provider)
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    console.debug("Handling 'accountsChanged' event with payload", accounts)
    if (status === ProviderStatus.CONNECTED) {
      connect(web3ModalOpts)
    }
    // if (accounts.length > 0) {
    //   setAccountId(accounts[0])

    //   if (web3) {
    //     const balance = await getBalance(web3, accounts[0])
    //     setBalance(balance)
    //   }
    // }
  }

  // ToDo need to handle this, it's not implemented, need to update chainId and reinitialize ocean lib
  const handleNetworkChanged = async (networkId: string | number) => {
    console.debug(
      "Handling 'networkChanged' event with payload",
      networkId,
      status
    )
    if (status === ProviderStatus.CONNECTED) {
      connect(web3ModalOpts)
    }
  }

  useEffect(() => {
    web3Modal && web3Modal.on('connect', handleConnect)

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
