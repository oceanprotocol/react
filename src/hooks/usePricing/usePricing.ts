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
import { TransactionReceipt } from 'web3-core'
import { getBestDataTokenPrice, getFirstPool } from 'utils/dtUtils'
import { Decimal } from 'decimal.js'

interface UsePricing {
  createPricing: (
    dataTokenAddress: string,
    priceOptions: PriceOptions,
  ) => Promise<TransactionReceipt | null>
  buyDT: (
    dataTokenAddress: string,
    dtAmount: number | string,
  ) => Promise<TransactionReceipt | null>
  sellDT: (
    dataTokenAddress: string,
    dtAmount: number | string,
  ) => Promise<TransactionReceipt | null>
  pricingStep?: number
  pricingStepText?: string
  pricingError?: string
  isLoading: boolean
}

export const buyDTFeedback: { [key in number]: string } = {
  0: '1/3 Approving OCEAN ...',
  1: '2/3 Buying DT ...',
  2: '3/3 DT Bought'  
}
export const sellDTFeedback: { [key in number]: string } = {
  0: '1/3 Approving DT ...',
  1: '2/3 Selling DT ...',
  2: '3/3 DT sold'  
}

export const createPricingFeedback:{ [key in number]: string } = {
  0: '1/4 Approving DT ...',
  1: '2/4 Approving Ocean ...',
  2: '3/4 Creating ....',
  3: '4/4 Pricing created',
}

function usePricing(): UsePricing {
  const { ocean, status, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [pricingStep, setPricingStep] = useState<number | undefined>()
  const [pricingStepText, setPricingStepText] = useState<string | undefined>()
  const [pricingError, setPricingError] = useState<string | undefined>()

  function setStepBuyDT(index?: number) {
    setPricingStep(index)
    index && setPricingStepText(buyDTFeedback[index])
  }
  function setStepSellDT(index?: number) {
    setPricingStep(index)
    index && setPricingStepText(sellDTFeedback[index])
  }
  function setStepCreatePricing(index?: number) {
    setPricingStep(index)
    index && setPricingStepText(createPricingFeedback[index])
  }

  async function createPricing(
    dataTokenAddress: string,
    priceOptions: PriceOptions
  ): Promise<TransactionReceipt | null> {
    setStepCreatePricing(0)
    let response = null
    try{
      switch (priceOptions.type) {
        case 'dynamic': {
          setStepCreatePricing(2)
          response=await ocean.pool.createDTPool(
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
          response=await ocean.fixedRateExchange.create(
            dataTokenAddress,
            priceOptions.price.toString(),
            accountId
          )
          setStepCreatePricing(1)
          await ocean.datatokens.approve(
            dataTokenAddress,
            config.fixedRateExchangeAddress,
            priceOptions.dtAmount,
            accountId
          )
          setStepCreatePricing(3)
          return response
        }
      }
    }
    catch (error) {
      setPricingError(error.message)
      Logger.error(error)
    } finally {
      setPricingStep(undefined)
      setPricingStepText(undefined)
      setIsLoading(false)
  }
}

  async function buyDT(
    dataTokenAddress: string,
    dtAmount: number | string,
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return

    setIsLoading(true)
    setPricingError(undefined)
    setStepBuyDT(0)

    try {
      const bestPrice = await getBestDataTokenPrice(ocean, dataTokenAddress)
      switch (bestPrice?.type) {
        case 'pool': {
          const price = new Decimal(bestPrice.value).times(1.05).toString()
          const maxPrice = new Decimal(bestPrice.value).times(2).toString()
          setStepBuyDT(1)
          Logger.log('Buying token from pool', bestPrice, account.getId(), price)
          const buyResponse = await ocean.pool.buyDT(
            account.getId(),
            bestPrice.address,
            String(dtAmount),
            price,
            maxPrice
          )
          setStepBuyDT(2)
          Logger.log('DT buy response', buyResponse)
          return buyResponse
        }
        case 'exchange': {
          if (!config.oceanTokenAddress) {
            Logger.error(`'oceanTokenAddress' not set in config`)
            return
          }
          if (!config.fixedRateExchangeAddress) {
            Logger.error(`'fixedRateExchangeAddress' not set in config`)
            return
          }
          Logger.log('Buying token from exchange', bestPrice, account.getId())
          await ocean.datatokens.approve(
            config.oceanTokenAddress,
            config.fixedRateExchangeAddress,
            bestPrice.value.toString(),
            account.getId()
          )
          setStepBuyDT(1)
          const exchange = await ocean.fixedRateExchange.buyDT(
            bestPrice.address,
            String(dtAmount),
            account.getId()
          )
          setStepBuyDT(2)
          Logger.log('DT exchange buy response', exchange)
          return exchange
        }
      }
    } catch (error) {
      setPricingError(error.message)
      Logger.error(error)
    } finally {
      setPricingStep(undefined)
      setPricingStepText(undefined)
      setIsLoading(false)
    }
  }

  async function sellDT(
    dataTokenAddress: string,
    dtAmount: number | string,
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return

    setIsLoading(true)
    setPricingError(undefined)
    setStepSellDT(0)

    try {
      const pool=await getFirstPool(ocean, dataTokenAddress)
      const price = new Decimal(pool.value).times(0.95).toString()
      setStepSellDT(1)
      Logger.log('Selling token to pool', pool, account.getId(), price)
      const sellResponse = await ocean.pool.sellDT(
            account.getId(),
            pool.address,
            String(dtAmount),
            price
          )
      setStepSellDT(2)
      Logger.log('DT sell response', sellResponse)
      return sellResponse
    } catch (error) {
      setPricingError(error.message)
      Logger.error(error)
    } finally {
      setStepSellDT(undefined)
      setPricingStepText(undefined)
      setIsLoading(false)
    }
  }
  
  return {
    createPricing,
    buyDT,
    sellDT,
    pricingStep,
    pricingStepText,
    isLoading,
    pricingError
  }
}

export { usePricing, UsePricing }
export default usePricing
