import { useEffect } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { Service } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'

interface UsePublish {
  publish: (
    asset: Metadata,
    tokensToMint: number,
    marketAddress: string,
    cost?: number
  ) => Promise<DDO>
  mint: (tokenAddress: string, tokensToMint: number) => void
}

function usePublish(): UsePublish {
  const { web3, ocean, status, account, accountId, config } = useOcean()

  async function publish(
    asset: Metadata,
    tokensToMint: number,
    marketAddress: string,
    cost = 1
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED) return

    const datatoken = new DataTokens(
      ocean.datatokens.factoryAddress,
      (ocean.datatokens.factoryABI as any).abi,
      (ocean.datatokens.datatokensABI as any).abi,
      web3
    )

    Logger.log('datatoken created', datatoken)
    const data = { t: 1, url: config.metadataStoreUri }
    const blob = JSON.stringify(data)
    const tokenAddress = await datatoken.create(blob, accountId)

    Logger.log('tokensto mint', tokensToMint)

   
    await mint(tokenAddress,tokensToMint,datatoken)

    Logger.log('giving allowance to ', marketAddress)
    await giveMarketAllowance(tokenAddress,marketAddress, tokensToMint,datatoken)
    Logger.log('tokenAddress created', tokenAddress)
    const publishedDate = new Date(Date.now()).toISOString().split('.')[0] + 'Z'
    const timeout = 0
    let services: Service[] = []
    switch (asset.main.type) {
      case 'dataset': {
        const accessService = await ocean.assets.createAccessServiceAttributes(
          account,
          cost.toString(),
          publishedDate,
          timeout
        )
        Logger.log('access service created', accessService)
        services = [accessService]
        break
      }
      case 'algorithm': {
        break
      }
    }

    const ddo = await ocean.assets.create(
      asset,
      account,
      services,
      tokenAddress
    )

    return ddo
  }

  async function mint(
    tokenAddress: string,
    tokensToMint: number,
    datatoken?: DataTokens
  ) {
    if (datatoken === undefined)
      datatoken = new DataTokens(
        ocean.datatokens.factoryAddress,
        (ocean.datatokens.factoryABI as any).abi,
        (ocean.datatokens.datatokensABI as any).abi,
        web3
      )
        Logger.log('mint function',tokenAddress, accountId)
    await datatoken.mint(tokenAddress, accountId, tokensToMint)
  }

  async function giveMarketAllowance(
    tokenAddress: string,
    marketAddress: string,
    tokens: number,
    datatoken?: DataTokens
  ) {
    if (datatoken === undefined)
      datatoken = new DataTokens(
        ocean.datatokens.factoryAddress,
        (ocean.datatokens.factoryABI as any).abi,
        (ocean.datatokens.datatokensABI as any).abi,
        web3
      )
    await datatoken.approve(tokenAddress, marketAddress, tokens, accountId)

  }

  return {
    publish,
    mint
  }
}

export { usePublish, UsePublish }
export default usePublish
