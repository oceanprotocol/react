import { DID, DDO, Logger, Metadata } from '@oceanprotocol/lib'
import {
  Service,
  ServiceComputePrivacy,
  ServiceType
} from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'
import { useState } from 'react'
import { useOcean } from 'providers'
import ProviderStatus from 'providers/OceanProvider/ProviderStatus'
import { publishFeedback } from 'utils'
import { PriceOptions } from './PriceOptions'

interface UsePostforSale {
  createPricing: (
    dataTokenAddress: string,
    priceOptions: PriceOptions,
  ) => Promise<void | null>
  publishStep?: number
  publishStepText?: string
  publishError?: string
  isLoading: boolean
}

function usePostforSale(): UsePostforSale {
  const { ocean, status, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [publishStep, setPublishStep] = useState<number | undefined>()
  const [publishStepText, setPublishStepText] = useState<string | undefined>()
  const [publishError, setPublishError] = useState<string | undefined>()

  function setStep(index?: number) {
    setPublishStep(index)
    index && setPublishStepText(publishFeedback[index])
  }

  async function createPricing(
    dataTokenAddress: string,
    priceOptions: PriceOptions
  ): Promise<void | null> {
    switch (priceOptions.type) {
      case 'dynamic': {
        await ocean.pool.createDTPool(
          accountId,
          dataTokenAddress,
          priceOptions.dtAmount.toString(),
          priceOptions.weightOnDataToken,
          priceOptions.swapFee
        )
        break
      }
      case 'fixed': {
        if (!config.fixedRateExchangeAddress) {
          Logger.error(`'fixedRateExchangeAddress' not set in ccnfig.`)
          return null
        }

        await ocean.fixedRateExchange.create(
          dataTokenAddress,
          priceOptions.price.toString(),
          accountId
        )
        await ocean.datatokens.approve(
          dataTokenAddress,
          config.fixedRateExchangeAddress,
          priceOptions.dtAmount,
          accountId
        )
        break
      }
    }
  }

  
  return {
    createPricing,
    publishStep,
    publishStepText,
    isLoading,
    publishError
  }
}

export { usePostforSale, UsePostforSale }
export default usePostforSale
