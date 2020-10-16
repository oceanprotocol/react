import { Logger } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useOcean } from 'providers'
import { TransactionReceipt } from 'web3-core'
import { getBestDataTokenPrice, getFirstPool } from 'utils/dtUtils'
import { Decimal } from 'decimal.js'

interface UseTrade {
  buyDT: (
    dataTokenAddress: string,
    dtAmount: number | string
  ) => Promise<TransactionReceipt | null>
  sellDT: (
    dataTokenAddress: string,
    dtAmount: number | string
  ) => Promise<TransactionReceipt | null>
  tradeStep?: number
  tradeStepText?: string
  tradeError?: string
  tradeIsLoading: boolean
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

function useTrade(): UseTrade {
  const { ocean, status, account, accountId, config } = useOcean()
  const [tradeIsLoading, setTradeIsLoading] = useState(false)
  const [tradeStep, setTradeStep] = useState<number | undefined>()
  const [tradeStepText, setTradeStepText] = useState<string | undefined>()
  const [tradeError, setTradeError] = useState<string | undefined>()
  const [dtSymbol, setDtSymbol] = useState<string>()

  function setStepBuyDT(index?: number) {
    setTradeStep(index)
    let message
    if (index) {
      if (dtSymbol) message = buyDTFeedback[index].replace(/DT/g, dtSymbol)
      else message = buyDTFeedback[index]
      setTradeStepText(message)
    }
  }
  function setStepSellDT(index?: number) {
    setTradeStep(index)
    let message
    if (index) {
      if (dtSymbol) message = sellDTFeedback[index].replace(/DT/g, dtSymbol)
      else message = sellDTFeedback[index]
      setTradeStepText(message)
    }
  }

  async function buyDT(
    dataTokenAddress: string,
    dtAmount: number | string
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return null

    try {
      setDtSymbol(await ocean.datatokens.getSymbol(dataTokenAddress))
      setTradeIsLoading(true)
      setTradeError(undefined)
      setStepBuyDT(0)
      const bestPrice = await getBestDataTokenPrice(ocean, dataTokenAddress)
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
      setTradeError(error.message)
      Logger.error(error)
    } finally {
      setTradeStep(undefined)
      setTradeStepText(undefined)
      setTradeIsLoading(false)
    }
    return null
  }

  async function sellDT(
    dataTokenAddress: string,
    dtAmount: number | string
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return null
    if (!config.oceanTokenAddress) {
      Logger.error(`'oceanTokenAddress' not set in config`)
      return null
    }
    try {
      setDtSymbol(await ocean.datatokens.getSymbol(dataTokenAddress))
      setTradeIsLoading(true)
      setTradeError(undefined)
      setStepSellDT(0)
      const pool = await getFirstPool(ocean, dataTokenAddress)
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
      setTradeError(error.message)
      Logger.error(error)
    } finally {
      setStepSellDT(undefined)
      setTradeStepText(undefined)
      setTradeIsLoading(false)
    }
    return null
  }

  return {
    buyDT,
    sellDT,
    tradeStep,
    tradeStepText,
    tradeIsLoading,
    tradeError
  }
}

export { useTrade, UseTrade }
export default useTrade
