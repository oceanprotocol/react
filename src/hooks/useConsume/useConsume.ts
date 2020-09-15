import { useState } from 'react'
import { useOcean } from '../../providers'
import { feedback } from '../../utils'
import { DID, Logger, ServiceType } from '@oceanprotocol/lib'
import { checkAndBuyDT } from '../../utils/dtUtils'

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
  const { ocean, account, accountId, config } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [consumeStep, setConsumeStep] = useState<number | undefined>()
  const [consumeStepText, setConsumeStepText] = useState<string | undefined>()
  const [consumeError, setConsumeError] = useState<string | undefined>()

  function setStep(index: number) {
    setConsumeStep(index)
    setConsumeStepText(consumeFeedback[index])
  }

  async function consume(
    did: DID | string,
    dataTokenAddress: string,
    serviceType: ServiceType = 'access'
  ): Promise<void> {
    if (!ocean || !account || !accountId) return
    setIsLoading(true)
    setConsumeError(undefined)

    try {
      setStep(0)
      await checkAndBuyDT(ocean, dataTokenAddress, account, config)

      setStep(1)
      const order = await ocean.assets.order(
        did as string,
        serviceType,
        accountId
      )
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
        did as string,
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
