import { useState } from 'react'
import { DID } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import { feedback } from '../../utils'

interface UseConsume {
  consume: (did: DID | string) => Promise<void>
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
  4: '3/3 Access granted. Consuming file...'
}

function useConsume(): UseConsume {
  const { ocean, account, accountId } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  const [consumeStep, setConsumeStep] = useState<number | undefined>()
  const [consumeStepText, setConsumeStepText] = useState<string | undefined>()
  const [consumeError, setConsumeError] = useState<string | undefined>()

  async function consume(did: DID | string): Promise<void> {
    if (!ocean || !account) return
    setIsLoading(true)
    setConsumeError(undefined)

    try {
      const agreements = await ocean.keeper.conditions.accessSecretStoreCondition.getGrantedDidByConsumer(
        accountId
      )
      const agreement = agreements.find((el: { did: string }) => el.did === did)
      console.log('existing agre', agreements)
      const agreementId = agreement
        ? agreement.agreementId
        : await ocean.assets
            .order(did as string, account)
            .next((step: number) => {
              setConsumeStep(step)
              setConsumeStepText(consumeFeedback[step])
            })

      // manually add another step here for better UX
      setConsumeStep(4)
      setConsumeStepText(consumeFeedback[4])
      await ocean.assets.consume(agreementId, did as string, account, '')
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
