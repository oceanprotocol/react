import { useEffect } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import {
  Service,
  ServiceType
} from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { ServiceConfig } from './ServiceConfig'

interface UsePublish {
  publish: (
    asset: Metadata,
    tokensToMint: string,
    marketAddress: string,
    serviceConfigs: ServiceConfig[]
  ) => Promise<DDO>
  mint: (tokenAddress: string, tokensToMint: string) => void
}

function usePublish(): UsePublish {
  const { web3, ocean, status, account, accountId, config } = useOcean()

  function createDataToken() {
    return new DataTokens(
      ocean.datatokens.factoryAddress,
      ocean.datatokens.factoryABI.abi,
      ocean.datatokens.datatokensABI.abi,
      web3
    )
  }

  async function publish(
    asset: Metadata,
    tokensToMint: string,
    marketAddress: string,
    serviceConfigs: ServiceConfig[]
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED) return

    Logger.log('ocean dt', ocean.datatokens)
    const data = { t: 1, url: config.metadataStoreUri }
    const blob = JSON.stringify(data)
    const tokenAddress = await ocean.datatokens.create(blob, accountId)
    Logger.log('datatoken created', tokenAddress)
    Logger.log('tokens to mint', tokensToMint)

    await mint(tokenAddress, tokensToMint)

    Logger.log('giving allowance to ', marketAddress)
    await giveMarketAllowance(tokenAddress, marketAddress, tokensToMint)
    Logger.log('tokenAddress created', tokenAddress)
    const publishedDate = new Date(Date.now()).toISOString().split('.')[0] + 'Z'
    const timeout = 0
    const services: Service[] = []

    serviceConfigs.forEach(async (serviceConfig) => {
      const price = ocean.datatokens.toWei(serviceConfig.cost)
      switch (serviceConfig.serviceType) {
        case 'access': {
          const accessService = await ocean.assets.createAccessServiceAttributes(
            account,
            price,
            publishedDate,
            timeout
          )
          Logger.log('access service created', accessService)
          services.push(accessService)
          break
        }
        case 'compute': {
          const computeService = await ocean.assets.createAccessServiceAttributes(
            account,
            price,
            publishedDate,
            0
          )
          services.push(computeService)
          break
        }
      }
    })

    const ddo = await ocean.assets.create(
      asset,
      account,
      services,
      tokenAddress
    )

    return ddo
  }

  async function mint(tokenAddress: string, tokensToMint: string) {
    Logger.log('mint function', tokenAddress, accountId)
    await ocean.datatokens.mint(tokenAddress, accountId, tokensToMint)
  }

  async function giveMarketAllowance(
    tokenAddress: string,
    marketAddress: string,
    tokens: string
  ) {
    await ocean.datatokens.approve(
      tokenAddress,
      marketAddress,
      tokens,
      accountId
    )
  }

  return {
    publish,
    mint
  }
}

export { usePublish, UsePublish }
export default usePublish
