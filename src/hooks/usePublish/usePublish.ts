import { DDO, Logger, Metadata } from '@oceanprotocol/lib'
import {
  Service,
  ServiceComputePrivacy,
  ServiceType
} from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { useState } from 'react'
import { DataTokenOptions } from './DataTokenOptions'
import { useOcean } from 'providers'
import ProviderStatus from 'providers/OceanProvider/ProviderStatus'
import { publishFeedback } from 'utils'

interface UsePublish {
  publish: (
    asset: Metadata,
    serviceConfigs: ServiceType,
    dataTokenOptions: DataTokenOptions,
    timeout?: number,
    providerUri?: string
  ) => Promise<DDO | undefined | null>
  mint: (tokenAddress: string, tokensToMint: string) => void
  publishStep?: number
  publishStepText?: string
  publishError?: string
  isLoading: boolean
}

function usePublish(): UsePublish {
  const { ocean, status, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [publishStep, setPublishStep] = useState<number | undefined>()
  const [publishStepText, setPublishStepText] = useState<string | undefined>()
  const [publishError, setPublishError] = useState<string | undefined>()

  function setStep(index?: number) {
    setPublishStep(index)
    index && setPublishStepText(publishFeedback[index])
  }

  async function mint(tokenAddress: string, tokensToMint: string) {
    Logger.log('mint function', tokenAddress, accountId)
    await ocean.datatokens.mint(tokenAddress, accountId, tokensToMint)
  }

  /**
   * Publish an asset.It also creates the datatoken, mints tokens and gives the market allowance
   * @param  {Metadata} asset The metadata of the asset.
   * @param  {PriceOptions}  priceOptions : number of tokens to mint, datatoken weight , liquidity fee, type : fixed, dynamic
   * @param  {ServiceType} serviceType Desired service type of the asset access or compute
   * @param  {DataTokenOptions} dataTokenOptions custom name, symbol and cap for datatoken
   * @return {Promise<DDO>} Returns the newly published ddo
   */
  async function publish(
    asset: Metadata,
    serviceType: ServiceType,
    dataTokenOptions: DataTokenOptions,
    timeout?: number,
    providerUri?: string
  ): Promise<DDO | undefined | null> {
    if (status !== ProviderStatus.CONNECTED || !ocean || !account) return null
    setIsLoading(true)
    setPublishError(undefined)

    try {
      const tokensToMint = dataTokenOptions.tokensToMint.toString()

      const publishedDate =
        new Date(Date.now()).toISOString().split('.')[0] + 'Z'
      let timeout = 0
      const services: Service[] = []

      const price = '1'
      switch (serviceType) {
        case 'access': {
          if (!timeout) timeout = 0
          const accessService = await ocean.assets.createAccessServiceAttributes(
            account,
            price,
            publishedDate,
            timeout,
            providerUri
          )
          Logger.log('access service created', accessService)
          services.push(accessService)
          break
        }
        case 'compute': {
          if (!timeout) timeout = 3600
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
            trustedAlgorithms: [] as any
          }
          const computeService = ocean.compute.createComputeService(
            account,
            price,
            publishedDate,
            provider,
            origComputePrivacy as ServiceComputePrivacy,
            timeout,
            providerUri
          )
          services.push(computeService)
          break
        }
      }

      Logger.log('services created', services)

      const ddo = await ocean.assets
        .create(
          asset,
          account,
          services,
          undefined,
          dataTokenOptions?.cap,
          dataTokenOptions?.name,
          dataTokenOptions?.symbol,
          providerUri
        )
        .next(setStep)
      Logger.log('ddo created', ddo)
      setStep(7)
      await mint(ddo.dataToken, tokensToMint)
      Logger.log(`minted ${tokensToMint} tokens`)

      // await createPricing(priceOptions, ddo.dataToken, tokensToMint)
      // setStep(8)
      return ddo
    } catch (error) {
      setPublishError(error.message)
      Logger.error(error)
      setStep()
    } finally {
      setIsLoading(false)
    }
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
