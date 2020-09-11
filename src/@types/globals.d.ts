import { HttpProvider } from 'web3-core';

interface EthereumProvider extends HttpProvider {
  enable: () => Promise<void>;
}
