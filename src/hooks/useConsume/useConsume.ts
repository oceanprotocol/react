import { useState } from 'react'
import { useOcean } from '../../providers'
import { feedback } from '../../utils'
import { DID, Logger } from '@oceanprotocol/lib'
import { ServiceType } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'

interface UseConsume {
  consume: (did: DID | string, serviceType: ServiceType) => Promise<void>
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
  async function consume(did: string, serviceType: ServiceType): Promise<void> {
    if (!ocean || !account) return
    setIsLoading(true)
    setConsumeError(undefined)

    try {
      setStep(0)
      const ddo = await ocean.metadatastore.retrieveDDO(did)
      Logger.log('ddo retrieved', ddo)
      setStep(1)
      const order = await ocean.assets.order(did, serviceType, accountId)
      Logger.log('order created', order)
      setStep(2)
      const res = JSON.parse(order)
      Logger.log('order parsed', res)
      const tokenTransfer = await ocean.datatokens.transferWei(
        res.dataToken,
        res.to,
        res.numTokens,
        res.from
      )
      Logger.log('token transfered', tokenTransfer)
      setStep(3)
      await ocean.assets.download(
        did,
        (tokenTransfer as any).transactionHash,
        ddo.dataToken,
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
