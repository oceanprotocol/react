import { useState } from 'react'
import { useOcean } from '../../providers'
import { feedback } from '../../utils'
import { DID } from '@oceanprotocol/lib'
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

  async function consume(did: string, serviceType: ServiceType): Promise<void> {
    if (!ocean || !account) return
    setIsLoading(true)
    setConsumeError(undefined)

    try {
      setConsumeStep(0)
      setConsumeStepText(consumeFeedback[0])
      const ddo = await ocean.metadatastore.retrieveDDO(did)

      setConsumeStep(1)
      setConsumeStepText(consumeFeedback[1])
      const order = await ocean.assets.order(did, serviceType, accountId)
      setConsumeStep(2)
      setConsumeStepText(consumeFeedback[2])
      const res = JSON.parse(order)
      const tokenTransfer = await ocean.datatokens.transfer(
        res.dataToken,
        res.to,
        res.numTokens,
        res.from
      )
      setConsumeStep(3)
      setConsumeStepText(consumeFeedback[3])
      await ocean.assets.download(
        did,
        (tokenTransfer as any).transactionHash,
        ddo.dataToken,
        account,
        ''
      )

      setConsumeStep(4)
      setConsumeStepText(consumeFeedback[4])
    } catch (error) {
      setConsumeError(error.message)
    } finally {
      setConsumeStep(undefined)
      setIsLoading(false)
    }
  }

  return { consume, consumeStep, consumeStepText, consumeError, isLoading }
}

export { useConsume, UseConsume }
export default useConsume
