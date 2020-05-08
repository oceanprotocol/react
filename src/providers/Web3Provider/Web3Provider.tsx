import React, { useContext, useState, createContext, useEffect } from 'react'
import Web3 from 'web3'
import { getWeb3 } from './utils'

interface Web3ProviderValue {
  web3: Web3 | undefined
  account: string | undefined
  balance: string | undefined
  chainId: number | undefined
  enable: () => void
}

const Web3Context = createContext(null)

function Web3Provider({ children }: { children: any }): any {
  const [web3, setWeb3] = useState<Web3 | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [account, setAccount] = useState<string | undefined>()
  const [balance, setBalance] = useState<string | undefined>()

  useEffect(() => {
    async function initWeb3(): Promise<void> {
      const web3 = await getWeb3()
      setWeb3(web3)
    
      const chainId = web3 && (await web3.eth.getChainId())
      setChainId(chainId)
    }
    initWeb3()
  }, [])

  useEffect(() => {
    if (!web3) return

    async function initUser(): Promise<void> {
      const account = await web3.eth.getAccounts()[0]
      setAccount(account)
      if(!account) return
      const balance = await web3.eth.getBalance(account)
      setBalance(balance)
    }
    initUser()
  }, [web3])

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
      value={{ web3, chainId, account, balance, enable } as Web3ProviderValue}
    >
      {children}
    </Web3Context.Provider>
  )
}

// Helper hook to access the provider values
const useWeb3 = (): Web3ProviderValue => useContext(Web3Context)

export { Web3Provider, useWeb3,Web3ProviderValue }
export default Web3Provider
