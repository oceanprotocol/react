import Web3 from 'web3'

async function getWeb3(): Promise<Web3> {
  let web3: Web3

  // modern dapp browsers
  if (window.ethereum) {
    web3 = new Web3(window.ethereum as any)
  }
  // legacy dapp browsers
  else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider)
  }
  // no dapp browser
  else {
    console.debug('Non-Ethereum browser detected.')
  }

  return web3
}

export { getWeb3 }
