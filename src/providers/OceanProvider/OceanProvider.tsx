import React, { useContext, useState, useEffect, createContext } from 'react'
import Web3 from 'web3'
import ProviderStatus from './ProviderStatus'
import { Ocean, Logger, Account, Config } from '@oceanprotocol/lib'
import Web3Modal, { ICoreOptions } from 'web3modal'
import { getDefaultProviders } from './getDefaultProviders'
interface OceanProviderValue {
  web3: Web3 | undefined
  web3Provider: any
  web3Modal: Web3Modal
  ocean: Ocean
  config: Config
  account: Account
  accountId: string
  balance: string
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
}) {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [web3Provider, setWeb3Provider] = useState<any | undefined>()
  const [ocean, setOcean] = useState<Ocean | undefined>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(null)
  const [chainId, setChainId] = useState<number | undefined>()
  const [account, setAccount] = useState<Account | undefined>()
  const [accountId, setAccountId] = useState<string | undefined>()
  const [balance, setBalance] = useState<string | undefined>()
  const [status, setStatus] = useState(ProviderStatus.NOT_AVAILABLE)

  function init() {
    Logger.log('Ocean Provider init')
    window.ethereum.autoRefreshOnNetworkChange = false
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
    Logger.log('Web3Modal instance created', instance)
    const provider = await instance.connect()
    setWeb3Provider(provider)

    const web3 = new Web3(provider)
    setWeb3(web3)

    // const factory = require('@oceanprotocol/contracts/artifacts/development/Factory.json')
    // const datatokensTemplate = require('@oceanprotocol/contracts/artifacts/development/DataTokenTemplate.json')
    // config.factoryABI = factory.abi
    // config.datatokensABI = datatokensTemplate.abi
    config.web3Provider = web3
    const ocean = await Ocean.getInstance(config)

    setOcean(ocean)
    Logger.log('Ocean instance created ', ocean)
    Logger.log('Web3 created ', web3)
    setStatus(ProviderStatus.CONNECTED)
    const account = (await ocean.accounts.list())[0]
    setAccount(account)
    Logger.log('Account ', account)

    const accountId = await getAccount(web3)
    setAccountId(accountId)
    Logger.log('account id', accountId)
    const balance = await getBalance(web3, accountId)
    setBalance(balance)
    Logger.log('balance', accountId)
    const chainId = web3 && (await web3.eth.getChainId())
    setChainId(chainId)
    Logger.log('chain id ', chainId)
  }

  async function logout() {
    // ToDo check how is the proper way to logout
    web3Modal.clearCachedProvider()
  }

  async function getAccount(web3: Web3) {
    const accounts = await web3.eth.getAccounts()
    return accounts[0]
  }

  async function getBalance(web3: Web3, address: string) {
    const balance = await web3.eth.getBalance(address)
    return Web3.utils.fromWei(balance)
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
    if (accounts.length > 0) {
      setAccountId(accounts[0])

      if (web3) {
        const balance = await getBalance(web3, accounts[0])
        setBalance(balance)
      }
    }
  }

  // ToDo need to handle this, it's not implemented, need to update chainId and reinitialize ocean lib
  const handleNetworkChanged = async (networkId: string | number) => {
    console.debug("Handling 'networkChanged' event with payload", networkId)
    web3Provider.autoRefreshOnNetworkChange = false
    // init(networkId)
    // handleConnect(ethProvider)
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
  }, [web3, web3Modal, web3Provider])

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

export { OceanProvider, useOcean, OceanProviderValue }
export default OceanProvider
