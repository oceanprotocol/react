import { useState } from 'react'
import { useOcean } from 'providers'
import { feedback } from 'utils'
import { DID, Logger, ServiceType } from '@oceanprotocol/lib'
import { getBestDataTokenPrice } from 'utils/dtUtils'
import { TransactionReceipt } from 'web3-core'
import { Decimal } from 'decimal.js'

interface UseBuy {
  buyDT: (
    dataTokenAddress: string,
    dtAmount: number | string,
  ) => Promise<TransactionReceipt | null>
  consumeStep?: number
  consumeStepText?: string
  consumeError?: string
  isLoading: boolean
}

export const buyFeedback: { [key in number]: string } = {
  0: '1/2 Approving OCEAN Tokens',
  1: '2/3 Buying Datatoken',
  2: '3/3 Bought Datatoken'
}

function useBuy(): UseBuy {
  const { ocean, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [consumeStep, setConsumeStep] = useState<number | undefined>()
  const [consumeStepText, setConsumeStepText] = useState<string | undefined>()
  const [consumeError, setConsumeError] = useState<string | undefined>()

  function setStep(index: number) {
    setConsumeStep(index)
    setConsumeStepText(buyFeedback[index])
  }

  async function buyDT(
    dataTokenAddress: string,
    dtAmount: number | string,
  ): Promise<TransactionReceipt | null> {
    if (!ocean || !account || !accountId) return

    setIsLoading(true)
    setConsumeError(undefined)
    setStep(0)

    try {
      const bestPrice = await getBestDataTokenPrice(ocean, dataTokenAddress)
      switch (bestPrice?.type) {
        case 'pool': {
          const price = new Decimal(bestPrice.value).times(1.05).toString()
          const maxPrice = new Decimal(bestPrice.value).times(2).toString()
          Logger.log('Buying token from pool', bestPrice, account.getId(), price)
          const buyResponse = await ocean.pool.buyDT(
            account.getId(),
            bestPrice.address,
            String(dtAmount),
            price,
            maxPrice
          )
          setStep(2)
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
          setStep(1)
          const exchange = await ocean.fixedRateExchange.buyDT(
            bestPrice.address,
            String(dtAmount),
            account.getId()
          )
          setStep(2)
          Logger.log('DT exchange buy response', exchange)
          return exchange
        }
      }
    } catch (error) {
      setConsumeError(error.message)
      Logger.error(error)
    } finally {
      setConsumeStep(undefined)
      setConsumeStepText(undefined)
      setIsLoading(false)
    }
  }

  return { buyDT, consumeStep, consumeStepText, consumeError, isLoading }
}

export { useBuy, UseBuy }
export default useBuy



