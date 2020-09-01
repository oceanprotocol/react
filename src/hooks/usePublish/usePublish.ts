import { useEffect, useState } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import {
  Service,
  ServiceComputePrivacy,
  ServiceType
} from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { ServiceConfig } from './ServiceConfig'
import { publishFeedback } from '../../utils'

interface UsePublish {
  publish: (
    asset: Metadata,
    tokensToMint: string,
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
  const { ocean, status, account, accountId, config } = useOcean()
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
   * @param  {ServiceConfig[]} serviceConfigs Desired services of the asset, ex: [{serviceType: 'access', cost:'1'}]
   * @param  {string} mpAddress The address of the market
   * @param  {string} mpFee The fee of the market
   * @return {Promise<DDO>} Returns the newly published ddo
   */
  async function publish(
    asset: Metadata,
    tokensToMint: string,
    serviceType: ServiceType,
    mpAddress: string,
    mpFee: string
  ): Promise<DDO> {
    if (status !== ProviderStatus.CONNECTED || !ocean || !account) return
    setIsLoading(true)
    setPublishError(undefined)
    try {
      setStep(0)
      
      const dtAddress = await ocean.datatokens.create(config.metadataStoreUri,"name",'DT',"1000", accountId)
      Logger.log('datatoken created', dtAddress)

      setStep(1)
      await mint(dtAddress, tokensToMint)
      Logger.log(`minted ${tokensToMint} tokens`)

      setStep(2)
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
      setStep(3)
      const ddo = await ocean.assets.create(asset, account, services, dtAddress)
      Logger.log('ddo created', ddo)
      setStep(4)

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
