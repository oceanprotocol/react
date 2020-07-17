import { useEffect, useState } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { Service } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { ServiceConfig } from './ServiceConfig'
import { publishFeedback } from '../../utils'

interface UsePublish {
  publish: (
    asset: Metadata,
    tokensToMint: string,
    marketAddress: string,
    serviceConfigs: ServiceConfig[]
  ) => Promise<DDO>
  mint: (tokenAddress: string, tokensToMint: string) => void
  giveMarketAllowance: (
    tokenAddress: string,
    marketAddress: string,
    tokens: string
  ) => void
  publishStep?: number
  publishStepText?: string
  publishError?: string
  isLoading: boolean
}

function usePublish(): UsePublish {
  const { web3, ocean, status, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [publishStep, setPublishStep] = useState<number | undefined>()
  const [publishStepText, setPublishStepText] = useState<string | undefined>()
  const [publishError, setPublishError] = useState<string | undefined>()

  function setStep(index: number) {
    setPublishStep(index)
    setPublishStepText(publishFeedback[index])
  }

  /**
   * Publish an asset.It also creates the datatoken, mints tokens and gives the market allowance
   * @param  {Metadata} asset The metadata of the asset.
   * @param  {string} tokensToMint Numer of tokens to mint and give allowance to market
   * @param  {string} marketAddress The address of the market
   * @param  {ServiceConfig[]} serviceConfigs Desired services of the asset, ex: [{serviceType: 'access', cost:'1'}]
   * @return {Promise<DDO>} Returns the newly published ddo
   */
  async function publish(
    asset: Metadata,
    tokensToMint: string,
    marketAddress: string,
    serviceConfigs: ServiceConfig[]
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED || !ocean || !account) return
    setIsLoading(true)
    setPublishError(undefined)
    try {
      setStep(0)
      const data = { t: 1, url: config.metadataStoreUri }
      const blob = JSON.stringify(data)
      const tokenAddress = await ocean.datatokens.create(blob, accountId)
      Logger.log('datatoken created', tokenAddress)

      setStep(1)
      await mint(tokenAddress, tokensToMint)
      Logger.log(`minted ${tokensToMint} tokens`)

      setStep(2)
      await giveMarketAllowance(tokenAddress, marketAddress, tokensToMint)
      Logger.log('allowance to market', marketAddress)
      const publishedDate =
        new Date(Date.now()).toISOString().split('.')[0] + 'Z'
      const timeout = 0
      const services: Service[] = []
      setStep(3)
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
      Logger.log('services created', services)
      setStep(4)
      const ddo = await ocean.assets.create(
        asset,
        account,
        services,
        tokenAddress
      )
      setStep(5)

      return ddo
    } catch (error) {
      setPublishError(error.message)
      Logger.error(error)
      setStep(undefined)
    } finally {
      setIsLoading(false)
    }
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
    mint,
    giveMarketAllowance,
    publishStep,
    publishStepText,
    isLoading,
    publishError
  }
}

export { usePublish, UsePublish }
export default usePublish
