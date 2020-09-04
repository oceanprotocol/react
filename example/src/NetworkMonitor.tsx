import React, { useCallback } from 'react'
import { useOcean } from '@oceanprotocol/react'
import { ConfigHelper } from '@oceanprotocol/lib'
import { useEffect } from 'react'

export const NetworkMonitor = () => {
  const { connect, web3Provider } = useOcean()

  const handleNetworkChanged = useCallback((chainId: number) => {
    // const config = getOceanConfig(chainId)
    // temp hack
    let network = ''
    switch (chainId) {
      case 1: {
        network = 'mainnet';
        break;
      }
      case 4: {
        network = 'rinkeby';
        break;
      }
    }
    const config = new ConfigHelper().getConfig(network)
    connect(config)
  }, [connect]);

  useEffect(() => {
    if (!web3Provider) return

    web3Provider.on('chainChanged', handleNetworkChanged)

    return () => {
      web3Provider.removeListener('chainChanged', handleNetworkChanged)
    }
  }, [web3Provider, handleNetworkChanged])

  return <></>
}
