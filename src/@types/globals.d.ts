import Web3 from 'web3'
import { HttpProvider } from 'web3-core'

interface EthereumProvider extends HttpProvider {
  enable: () => Promise<void>
}

declare global {
  interface Window {
    web3: Web3
    ethereum: EthereumProvider
  }
}
