import { Logger } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useOcean } from 'providers'
import { PriceOptions } from './PriceOptions'
import { TransactionReceipt } from 'web3-core'
import { getBestDataTokenPrice, getFirstPool } from 'utils/dtUtils'
import { Decimal } from 'decimal.js'

interface UseCreatePricing {
  createPricing: (
    dataTokenAddress: string,
    priceOptions: PriceOptions
  ) => Promise<TransactionReceipt | string | null>
  pricingStep?: number
  pricingStepText?: string
  pricingError?: string
  pricingIsLoading: boolean
}

export const createPricingFeedback: { [key in number]: string } = {
  0: '1/4 Approving DT ...',
  1: '2/4 Approving Ocean ...',
  2: '3/4 Creating ....',
  3: '4/4 Pricing created'
}

function useCreatePricing(): UseCreatePricing {
  const { ocean, status, account, accountId, config } = useOcean()
  const [pricingIsLoading, setPricingIsLoading] = useState(false)
  const [pricingStep, setPricingStep] = useState<number | undefined>()
  const [pricingStepText, setPricingStepText] = useState<string | undefined>()
  const [pricingError, setPricingError] = useState<string | undefined>()
  const [dtSymbol, setDtSymbol] = useState<string>()

  function setStepCreatePricing(index?: number) {
    setPricingStep(index)
    let message
    if (index) {
      if (dtSymbol)
        message = createPricingFeedback[index].replace(/DT/g, dtSymbol)
      else message = createPricingFeedback[index]
      setPricingStepText(message)
    }
  }

  async function createPricing(
    dataTokenAddress: string,
    priceOptions: PriceOptions
  ): Promise<TransactionReceipt | string | null> {
    if (!ocean || !account || !accountId) return null

    let response = null
    try {
      setPricingIsLoading(true)
      setPricingError(undefined)
      setDtSymbol(await ocean.datatokens.getSymbol(dataTokenAddress))
      setStepCreatePricing(0)
      switch (priceOptions.type) {
        case 'dynamic': {
          setStepCreatePricing(2)
          response = await ocean.pool.createDTPool(
            accountId,
            dataTokenAddress,
            priceOptions.dtAmount.toString(),
            priceOptions.weightOnDataToken,
            priceOptions.swapFee
          )
          setStepCreatePricing(3)
          return response
        }
        case 'fixed': {
          if (!config.fixedRateExchangeAddress) {
            Logger.error(`'fixedRateExchangeAddress' not set in ccnfig.`)
            return null
          }
          setStepCreatePricing(2)
          response = await ocean.fixedRateExchange.create(
            dataTokenAddress,
            priceOptions.price.toString(),
            accountId
          )
          setStepCreatePricing(1)
          await ocean.datatokens.approve(
            dataTokenAddress,
            config.fixedRateExchangeAddress,
            String(priceOptions.dtAmount),
            accountId
          )
          setStepCreatePricing(3)
          return response
        }
      }
    } catch (error) {
      setPricingError(error.message)
      Logger.error(error)
    } finally {
      setPricingStep(undefined)
      setPricingStepText(undefined)
      setPricingIsLoading(false)
    }
    return null
  }

  return {
    createPricing,
    pricingStep,
    pricingStepText,
    pricingIsLoading,
    pricingError
  }
}

export { useCreatePricing, UseCreatePricing }
export default useCreatePricing
