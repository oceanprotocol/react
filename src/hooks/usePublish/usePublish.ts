import { useEffect } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { Service } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'

interface UsePublish {
  publish: (
    asset: Metadata,
    tokensToMint: string,
    marketAddress: string,
    cost?: string
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
    cost = '1'
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED) return

    const datatoken = createDataToken()

    Logger.log('datatokens created', datatoken)
    Logger.log('ocean dt', ocean.datatokens)
    const data = { t: 1, url: config.metadataStoreUri }
    const blob = JSON.stringify(data)
    const tokenAddress = await datatoken.create(blob, accountId)
    Logger.log('datatoken created', datatoken)
    Logger.log('tokensto mint', tokensToMint)

    await mint(tokenAddress, tokensToMint, datatoken)

    Logger.log('giving allowance to ', marketAddress)
    await giveMarketAllowance(
      tokenAddress,
      marketAddress,
      tokensToMint,
      datatoken
    )
    Logger.log('tokenAddress created', tokenAddress)
    const publishedDate = new Date(Date.now()).toISOString().split('.')[0] + 'Z'
    const timeout = 0
    let services: Service[] = []
    const price = datatoken.toWei(cost)
    switch (asset.main.type) {
      case 'dataset': {
        const accessService = await ocean.assets.createAccessServiceAttributes(
          account,
          price,
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
    tokensToMint: string,
    datatoken?: DataTokens
  ) {
    if (datatoken === undefined) datatoken = createDataToken()
    Logger.log('mint function', tokenAddress, accountId)
    await datatoken.mint(tokenAddress, accountId, tokensToMint)
  }

  async function giveMarketAllowance(
    tokenAddress: string,
    marketAddress: string,
    tokens: string,
    datatoken?: DataTokens
  ) {
    if (datatoken === undefined) datatoken = createDataToken()
    await datatoken.approve(tokenAddress, marketAddress, tokens, accountId)
  }

  return {
    publish,
    mint
  }
}

export { usePublish, UsePublish }
export default usePublish
