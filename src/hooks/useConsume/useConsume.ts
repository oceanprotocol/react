import { useState } from 'react'
import { useOcean } from '../../providers'
import { feedback } from '../../utils'
import { DID, Logger, ServiceType } from '@oceanprotocol/lib'

interface UseConsume {
  consume: (
    did: DID | string,
    dataTokenAddress: string,
    serviceType: ServiceType
  ) => Promise<void>
  consumeStep?: number
  consumeStepText?: string
  consumeError?: string
  isLoading: boolean
}

// TODO: do something with this object,
// consumeStep should probably return one of those strings
// instead of just a number
export const consumeFeedback: { [key in number]: string } = {
  ...feedback,
  3: '3/3 Access granted. Consuming file...'
}

function useConsume(): UseConsume {
  const { ocean, account, accountId } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [consumeStep, setConsumeStep] = useState<number | undefined>()
  const [consumeStepText, setConsumeStepText] = useState<string | undefined>()
  const [consumeError, setConsumeError] = useState<string | undefined>()

  function setStep(index: number) {
    setConsumeStep(index)
    setConsumeStepText(consumeFeedback[index])
  }
  async function getCheapestPool(dataTokenAddress): Promise<{poolAddress: string,poolPrice: string}> {
    const tokenPools = await ocean.pool.searchPoolforDT(accountId, dataTokenAddress)
    Logger.log('DT Pool found', tokenPools)
    let cheapestPoolAddress
    let cheapestPoolPrice = 999999

    if (tokenPools) {
      for (let i = 0; i < tokenPools.length; i++) {
        const poolPrice = await ocean.pool.getDTPrice(accountId, tokenPools[i])
        Logger.log('Pool price ',tokenPools[i],poolPrice)
        if (poolPrice < cheapestPoolPrice) {
          cheapestPoolPrice = poolPrice
          cheapestPoolAddress = tokenPools[i]
        }
      }
    }

    return { poolAddress:cheapestPoolAddress, poolPrice: cheapestPoolPrice.toString()}

  }

  async function getBestDataTokenPrice(dataTokenAddress:string): Promise<string>{
    const bestPool = await getCheapestPool(dataTokenAddress)

    return bestPool.poolPrice
  }
  async function consume(
    did: string,
    dataTokenAddress: string,
    serviceType: ServiceType = 'access'
  ): Promise<void> {
    if (!ocean || !account || !accountId) return
    setIsLoading(true)
    setConsumeError(undefined)

    try {

      const userOwnedTokens = await ocean.accounts.getTokenBalance(dataTokenAddress, account)
      Logger.log(`User has ${userOwnedTokens} tokens`)
      let cheapestPool
      if (userOwnedTokens === '0') {
        cheapestPool = await getCheapestPool(dataTokenAddress)
       
        let maxPrice: number = +cheapestPool.poolPrice *10
        Logger.log('Buying token', cheapestPool,accountId, maxPrice.toString())
        let buyResponse = await ocean.pool.buyDT(accountId,cheapestPool.poolAddress,'1','100','999999999999999999999999999999999999999999')
        Logger.log('DT buy response', buyResponse)

        if(buyResponse === null) {
          return
        }
      }


      setStep(0)
      setStep(1)
      const order = await ocean.assets.order(did, serviceType, accountId)
      Logger.log('order created', order)
      setStep(2)
      const res = JSON.parse(order)
      Logger.log('order parsed', res)
      Logger.log('ocean.datatokens before transfer', ocean.datatokens)
      const tokenTransfer = await ocean.datatokens.transferWei(
        res.dataToken,
        res.to,
        String(res.numTokens),
        res.from
      )
      Logger.log('token transfered', tokenTransfer)
      setStep(3)
      await ocean.assets.download(
        did,
        (tokenTransfer as any).transactionHash,
        dataTokenAddress,
        account,
        ''
      )

      setStep(4)
    } catch (error) {
      setConsumeError(error.message)
      Logger.error(error)
    } finally {
      setConsumeStep(undefined)
      setConsumeStepText(undefined)
      setIsLoading(false)
    }
  }

  return { consume, consumeStep, consumeStepText, consumeError, isLoading }
}

export { useConsume, UseConsume }
export default useConsume
