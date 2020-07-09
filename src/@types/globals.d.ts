import Web3 from 'web3'
import { HttpProvider } from 'web3-core'

interface EthereumProvider extends HttpProvider {
  enable: () => Promise<void>
}
