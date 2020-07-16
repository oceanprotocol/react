export async function getDefaultProviders() {
  const { default: WalletConnectProvider } = await import(
    '@walletconnect/web3-provider'
  )

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'INFURA_ID' // required
      }
    }
  }

  return { cacheProvider: true, providerOptions }
}
