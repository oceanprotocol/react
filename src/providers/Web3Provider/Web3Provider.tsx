import React, { useContext, useState, createContext, useEffect } from 'react'
import Web3 from 'web3'
import Web3Connect from 'web3connect'
import { getWeb3 } from './utils'
import Core from 'web3connect/lib/core'

export enum InjectedProviderStatus {
  NOT_AVAILABLE = -1,
  NOT_CONNECTED = 0,
  CONNECTED = 1
}
interface Web3ProviderValue {
  web3: Web3 | undefined
  web3Connect: Core
  account: string | undefined
  balance: string | undefined
  chainId: number | undefined
  ethProviderStatus: InjectedProviderStatus
  enable: () => void
}

const Web3Context = createContext(null)

// TODO: this will have to be updated to web3modal
function Web3Provider({ children }: { children: any }): any {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [account, setAccount] = useState<string | undefined>()
  const [balance, setBalance] = useState<string | undefined>()
  const [ethProvider, setEthProvider] = useState<any>(null)
  const [ethProviderStatus, setEthProviderStatus] = useState(
    InjectedProviderStatus.NOT_AVAILABLE
  )
  const [web3Connect, setWeb3Connect] = useState<Core>(null)

  useEffect(() => {
    async function initWeb3(): Promise<void> {
      const web3 = await getWeb3()
      setWeb3(web3)

      const chainId = web3 && (await web3.eth.getChainId())
      setChainId(chainId)
    }
    initWeb3()
  }, [])

  function init(networkId?: string | number) {
    const instance = new Web3Connect.Core({
      network: `${networkId}`,
      providerOptions: {}
    })
    setWeb3Connect(instance)

    if (Web3Connect.checkInjectedProviders().injectedAvailable) {
      setEthProviderStatus(InjectedProviderStatus.NOT_CONNECTED)
    }
  }

  // On mount setup Web3Connect instance & check for injected provider
  useEffect(() => {
    init()
  }, [])

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
    console.debug("Handling 'connect' event with payload", provider)
    setEthProvider(provider)
    setEthProviderStatus(InjectedProviderStatus.CONNECTED)

    const web3 = new Web3(provider)
    setWeb3(web3)

    const account = await getAccount(web3)
    setAccount(account)

    const balance = await getBalance(web3, account)
    setBalance(balance)
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    console.debug("Handling 'accountsChanged' event with payload", accounts)
    if (accounts.length > 0) {
      setAccount(accounts[0])

      if (web3) {
        const balance = await getBalance(web3, accounts[0])
        setBalance(balance)
      }
    }
  }

  const handleNetworkChanged = async (networkId: string | number) => {
    console.debug("Handling 'networkChanged' event with payload", networkId)
    ethProvider.autoRefreshOnNetworkChange = false
    init(networkId)
    handleConnect(ethProvider)
  }

  //
  // Setup event listeners.
  // Web3Connect only supports a 'connect', 'error', and 'close' event,
  // so we use the injected provider events to handle the rest.
  //
  useEffect(() => {
    web3Connect && web3Connect.on('connect', handleConnect)

    if (ethProvider) {
      ethProvider.on('accountsChanged', handleAccountsChanged)
      ethProvider.on('networkChanged', handleNetworkChanged)

      return () => {
        ethProvider.removeListener('accountsChanged', handleAccountsChanged)
        ethProvider.removeListener('networkChanged', handleNetworkChanged)
      }
    }
  }, [web3, web3Connect, ethProvider])

  async function enable(): Promise<boolean> {
    try {
      // Request account access
      await window.ethereum.enable()
      return true
    } catch (error) {
      // User denied account access
      console.error('User denied account access to wallet.')
      return false
    }
  }

  return (
    <Web3Context.Provider
      value={
        {
          web3,
          web3Connect,
          chainId,
          account,
          balance,
          ethProviderStatus,
          enable
        } as Web3ProviderValue
      }
    >
      {children}
    </Web3Context.Provider>
  )
}

// Helper hook to access the provider values
const useWeb3 = (): Web3ProviderValue => useContext(Web3Context)

export { Web3Provider, useWeb3, Web3ProviderValue }
export default Web3Provider
