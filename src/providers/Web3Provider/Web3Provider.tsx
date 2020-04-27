import React, { ReactNode, useContext, useState, createContext } from 'react'
import Web3 from 'web3'

interface Web3ProviderValue {
  web3: Web3
}

const Web3Context = createContext(null)

function Web3Provider({ children }: { children: ReactNode }): ReactNode {
  const [web3, setWeb3] = useState<Web3 | undefined>()

  return (
    <Web3Context.Provider value={{ web3 } as Web3ProviderValue}>
      {children}
    </Web3Context.Provider>
  )
}

// Helper hook to access the provider values
const useWeb3 = (): Web3ProviderValue => useContext(Web3Context)

export { Web3Provider, useWeb3 }
export default Web3Provider
