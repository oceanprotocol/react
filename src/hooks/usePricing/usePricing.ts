import { DDO, Logger } from '@oceanprotocol/lib'
import { useEffect, useState } from 'react'
import { useOcean } from 'providers'
import { PriceOptions } from './PriceOptions'
import { TransactionReceipt } from 'web3-core'
import { getBestDataTokenPrice, getFirstPool } from 'utils/dtUtils'
import { Decimal } from 'decimal.js'

interface UsePricing {
  dtSymbol?: string
  dtName?: string
  createPricing: (
    priceOptions: PriceOptions
  ) => Promise<TransactionReceipt | string | void>
  buyDT: (dtAmount: number | string) => Promise<TransactionReceipt | void>
  sellDT: (dtAmount: number | string) => Promise<TransactionReceipt | void>
  mint: (tokensToMint: string) => Promise<TransactionReceipt>
  pricingStep?: number
  pricingStepText?: string
  pricingError?: string
  pricingIsLoading: boolean
}

export const createPricingFeedback: { [key in number]: string } = {
  0: 'Minting DT ...',
  1: 'Approving DT ...',
  2: 'Approving Ocean ...',
  3: 'Creating ...',
  4: 'Pricing created.'
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

  async function mint(tokensToMint: string): Promise<TransactionReceipt> {
    Logger.log('mint function', dataToken, accountId)
    const tx = await ocean.datatokens.mint(dataToken, accountId, tokensToMint)
    return tx
  }

  async function buyDT(
    dtAmount: number | string
  ): Promise<TransactionReceipt | void> {
    if (!ocean || !account || !accountId) return

    try {
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
      setStepBuyDT(undefined)
      setPricingStepText(undefined)
      setPricingIsLoading(false)
    }
  }

  async function sellDT(
    dtAmount: number | string
  ): Promise<TransactionReceipt | void> {
    if (!ocean || !account || !accountId) return

    if (!config.oceanTokenAddress) {
      Logger.error(`'oceanTokenAddress' not set in config`)
      return
    }

    try {
      setPricingIsLoading(true)
      setPricingError(undefined)
      setStepSellDT(0)
      const pool = await getFirstPool(ocean, dataToken)
      if (!pool || pool.price === 0) return
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
  }

  async function createPricing(
    priceOptions: PriceOptions
  ): Promise<TransactionReceipt | string | void> {
    if (!ocean || !account || !accountId) return

    const { type, dtAmount, price, weightOnDataToken, swapFee } = priceOptions
    const isPool = type === 'dynamic'

    if (!isPool && !config.fixedRateExchangeAddress) {
      Logger.error(`'fixedRateExchangeAddress' not set in ccnfig.`)
      return
    }

    try {
      setPricingIsLoading(true)
      setPricingError(undefined)

      setStepCreatePricing(0)
      await mint(`${dtAmount}`)

      setStepCreatePricing(3)
      const response = isPool
        ? // TODO: in ocean.js: ocean.pool.createDTPool should be ocean.pool.create
          // And if it involves mutliple wallet interacts the method itself should emit step events.
          await ocean.pool.createDTPool(
            accountId,
            dataToken,
            `${dtAmount}`,
            weightOnDataToken,
            swapFee
          )
        : // TODO: in ocean.js: ocean.fixedRateExchange.create should return tx receipt
          await ocean.fixedRateExchange.create(dataToken, `${price}`, accountId)

      // TODO: why is approve after the creation?
      if (!isPool && config.fixedRateExchangeAddress) {
        setStepCreatePricing(1)
        await ocean.datatokens.approve(
          dataToken,
          config.fixedRateExchangeAddress,
          `${dtAmount}`,
          accountId
        )
      }

      setStepCreatePricing(4)
      return response
    } catch (error) {
      setPricingError(error.message)
      Logger.error(error)
    } finally {
      setPricingStep(undefined)
      setPricingStepText(undefined)
      setPricingIsLoading(false)
    }
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
