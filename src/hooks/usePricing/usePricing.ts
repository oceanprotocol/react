import { DDO, Logger } from '@oceanprotocol/lib'
import { useEffect, useState } from 'react'
import { useOcean } from 'providers'
import { PriceOptions } from './PriceOptions'
import { TransactionReceipt } from 'web3-core'
import { getBestDataTokenPrice, getFirstPool } from 'utils/dtUtils'
import { Decimal } from 'decimal.js'

interface UsePricing {
  dtSymbol: string | undefined
  dtName: string | undefined
  createPricing: (
    priceOptions: PriceOptions
  ) => Promise<TransactionReceipt | string | null>
  buyDT: (dtAmount: number | string) => Promise<TransactionReceipt | null>
  sellDT: (dtAmount: number | string) => Promise<TransactionReceipt | null>
  mint: (tokensToMint: string) => void
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

function usePricing(ddo: DDO): UsePricing {
  const { ocean, account, accountId, config } = useOcean()
  const [pricingIsLoading, setPricingIsLoading] = useState(false)
  const [pricingStep, setPricingStep] = useState<number>()
  const [pricingStepText, setPricingStepText] = useState<string>()
  const [pricingError, setPricingError] = useState<string>()
  const [dtSymbol, setDtSymbol] = useState<string>()
  const [dtName, setDtName] = useState<string>()

  const { dataToken, dataTokenInfo } = ddo

  // Get Datatoken info, from DDO first, then from chain
  useEffect(() => {
    if (!dataToken) return

    async function init() {
      const dtSymbol = dataTokenInfo
        ? dataTokenInfo.symbol
        : await ocean?.datatokens.getSymbol(dataToken)
      setDtSymbol(dtSymbol)

      const dtName = dataTokenInfo
        ? dataTokenInfo.name
        : await ocean?.datatokens.getName(dataToken)
      setDtName(dtName)
    }
    init()
  }, [ocean, dataToken, dataTokenInfo])

  function setStepCreatePricing(index?: number) {
    setPricingStep(index)
    if (!index) return

    const message = dtSymbol
      ? createPricingFeedback[index].replace(/DT/g, dtSymbol)
      : createPricingFeedback[index]
    setPricingStepText(message)
  }

  function setStepBuyDT(index?: number) {
    setPricingStep(index)
    if (!index) return

    const message = dtSymbol
      ? buyDTFeedback[index].replace(/DT/g, dtSymbol)
      : buyDTFeedback[index]
    setPricingStepText(message)
  }
  function setStepSellDT(index?: number) {
    setPricingStep(index)
    if (!index) return

    const message = dtSymbol
      ? sellDTFeedback[index].replace(/DT/g, dtSymbol)
      : sellDTFeedback[index]
    setPricingStepText(message)
  }

  async function mint(tokensToMint: string) {
    Logger.log('mint function', dataToken, accountId)
    await ocean.datatokens.mint(dataToken, accountId, tokensToMint)
  }

  async function buyDT(
    dtAmount: number | string
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return null

    try {
      setDtSymbol(await ocean.datatokens.getSymbol(dataToken))
      setPricingIsLoading(true)
      setPricingError(undefined)
      setStepBuyDT(0)
      const bestPrice = await getBestDataTokenPrice(ocean, dataToken)

      switch (bestPrice?.type) {
        case 'pool': {
          const price = new Decimal(bestPrice.value).times(1.05).toString()
          const maxPrice = new Decimal(bestPrice.value).times(2).toString()
          setStepBuyDT(1)
          Logger.log(
            'Buying token from pool',
            bestPrice,
            account.getId(),
            price
          )
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
            return null
          }
          if (!config.fixedRateExchangeAddress) {
            Logger.error(`'fixedRateExchangeAddress' not set in config`)
            return null
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
      setStepBuyDT(undefined)
      setPricingStepText(undefined)
      setPricingIsLoading(false)
    }
    return null
  }

  async function sellDT(
    dtAmount: number | string
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return null

    if (!config.oceanTokenAddress) {
      Logger.error(`'oceanTokenAddress' not set in config`)
      return null
    }

    try {
      setDtSymbol(await ocean.datatokens.getSymbol(dataToken))
      setPricingIsLoading(true)
      setPricingError(undefined)
      setStepSellDT(0)
      const pool = await getFirstPool(ocean, dataToken)
      if (!pool || pool.price === 0) return null
      const price = new Decimal(pool.price).times(0.95).toString()
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
      setPricingIsLoading(false)
    }
    return null
  }

  async function createPricing(
    priceOptions: PriceOptions
  ): Promise<TransactionReceipt | string | null> {
    if (!ocean || !account || !accountId) return null

    let response = null
    try {
      setPricingIsLoading(true)
      setPricingError(undefined)
      setDtSymbol(await ocean.datatokens.getSymbol(dataToken))
      setStepCreatePricing(0)

      switch (priceOptions.type) {
        case 'dynamic': {
          setStepCreatePricing(2)
          response = await ocean.pool.createDTPool(
            accountId,
            dataToken,
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
            dataToken,
            priceOptions.price.toString(),
            accountId
          )
          setStepCreatePricing(1)
          await ocean.datatokens.approve(
            dataToken,
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
    dtSymbol,
    dtName,
    createPricing,
    buyDT,
    sellDT,
    mint,
    pricingStep,
    pricingStepText,
    pricingIsLoading,
    pricingError
  }
}

export { usePricing, UsePricing }
export default usePricing
