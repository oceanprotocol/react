import { useState } from 'react'
import { DDO, Metadata, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import {
  Service,
  ServiceComputePrivacy,
  ServiceType
} from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { PriceOptions } from './PriceOptions'
import { publishFeedback } from '../../utils'

interface UsePublish {
  publish: (
    asset: Metadata,
    priceOptions: PriceOptions,
    serviceConfigs: ServiceType,
    mpAddress: string,
    mpFee: string
  ) => Promise<DDO>
  mint: (tokenAddress: string, tokensToMint: string) => void
  publishStep?: number
  publishStepText?: string
  publishError?: string
  isLoading: boolean
}

function usePublish(): UsePublish {
  const { ocean, status, account, accountId } = useOcean()
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
   * @param  {PriceOptions}  priceOptions : number of tokens to mint, datatoken weight , liquidity fee, type : simple, advanced
   * @param  {ServiceType} serviceType Desired service type of the asset access or compute
   * @param  {string} mpAddress The address of the market
   * @param  {string} mpFee The fee of the market
   * @return {Promise<DDO>} Returns the newly published ddo
   */
  async function publish(
    asset: Metadata,
    priceOptions: PriceOptions,
    serviceType: ServiceType
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED || !ocean || !account) return
    setIsLoading(true)
    setPublishError(undefined)
    try {
      const tokensToMint = priceOptions.tokensToMint.toString()

      const publishedDate =
        new Date(Date.now()).toISOString().split('.')[0] + 'Z'
      const timeout = 0
      const services: Service[] = []

      const price = ocean.datatokens.toWei('1')
      switch (serviceType) {
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
          const cluster = ocean.compute.createClusterAttributes(
            'Kubernetes',
            'http://10.0.0.17/xxx'
          )
          const servers = [
            ocean.compute.createServerAttributes(
              '1',
              'xlsize',
              '50',
              '16',
              '0',
              '128gb',
              '160gb',
              timeout
            )
          ]
          const containers = [
            ocean.compute.createContainerAttributes(
              'tensorflow/tensorflow',
              'latest',
              'sha256:cb57ecfa6ebbefd8ffc7f75c0f00e57a7fa739578a429b6f72a0df19315deadc'
            )
          ]
          const provider = ocean.compute.createProviderAttributes(
            'Azure',
            'Compute service with 16gb ram for each node.',
            cluster,
            containers,
            servers
          )
          const origComputePrivacy = {
            allowRawAlgorithm: true,
            allowNetworkAccess: false,
            trustedAlgorithms: []
          }
          const computeService = ocean.compute.createComputeService(
            account,
            price,
            publishedDate,
            provider,
            origComputePrivacy as ServiceComputePrivacy
          )
          services.push(computeService)
          break
        }
      }

      Logger.log('services created', services)

      const ddo = await ocean.assets
        .create(asset, account, services)
        .next(setStep)
      Logger.log('ddo created', ddo)
      setStep(7)
      await mint(ddo.dataToken, tokensToMint)
      Logger.log(`minted ${tokensToMint} tokens`)

      await createPricing(priceOptions, ddo.dataToken)
      setStep(8)
      return ddo
    } catch (error) {
      setPublishError(error.message)
      Logger.error(error)
      setStep(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  async function createPricing(
    priceOptions: PriceOptions,
    dataTokenAddress: string
  ) {
    switch (priceOptions.type) {
      case 'dynamic': {
        // weight is hardcoded at 9 (90%) and publisher fee at 0.03(this was a random value set by me)
        const pool = await ocean.pool.createDTPool(
          accountId,
          dataTokenAddress,
          priceOptions.tokensToMint.toString(),
          priceOptions.weightOnDataToken,
          priceOptions.liquidityProviderFee
        )
        break
      }
      case 'fixed': {
        const fixedPriceExchange = await ocean.fixedRateExchange.create(
          dataTokenAddress,
          priceOptions.price.toString(),
          accountId
        )
        await ocean.fixedRateExchange.activate(fixedPriceExchange, accountId)
        break
      }
    }
  }

  async function mint(tokenAddress: string, tokensToMint: string) {
    Logger.log('mint function', tokenAddress, accountId)
    await ocean.datatokens.mint(tokenAddress, accountId, tokensToMint)
  }

  return {
    publish,
    mint,
    publishStep,
    publishStepText,
    isLoading,
    publishError
  }
}

export { usePublish, UsePublish }
export default usePublish
