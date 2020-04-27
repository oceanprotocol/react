import { useState } from 'react'
import { DID } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'

interface UseConsume {
  consume: (did: DID) => Promise<void>
  consumeStep?: number
  consumeError?: string
}

// TODO: do something with this object,
// consumeStep should probably return one of those strings
// instead of just a number
export const feedback: { [key in number]: string } = {
  99: 'Decrypting file URL...',
  0: '1/3 Asking for agreement signature...',
  1: '1/3 Agreement initialized.',
  2: '2/3 Asking for two payment confirmations...',
  3: '2/3 Payment confirmed. Requesting access...',
  4: '3/3 Access granted. Consuming file...'
}

function useConsume(): UseConsume {
  // TODO: figure out if a hook within a hook could lead to problems.
  // Otherwise we could just require `ocean` to be passed to `useConsume()`
  const { ocean, account, accountId } = useOcean()
  const [consumeStep, setConsumeStep] = useState<number | undefined>()
  const [consumeError, setConsumeError] = useState<string | undefined>()

  async function consume(did: DID | string): Promise<void> {
    if (!ocean || !account) return

    setConsumeError(undefined)

    try {
      const agreements = await ocean.keeper.conditions.accessSecretStoreCondition.getGrantedDidByConsumer(
        accountId
      )
      const agreement = agreements.find((el: { did: string }) => el.did === did)
      const agreementId = agreement
        ? agreement.agreementId
        : await ocean.assets
            .order(did as string, account)
            .next((step: number) => setConsumeStep(step))

      // manually add another step here for better UX
      setConsumeStep(4)
      await ocean.assets.consume(agreementId, did as string, account, '')
    } catch (error) {
      setConsumeError(error.message)
    } finally {
      setConsumeStep(undefined)
    }
  }

  return { consume, consumeStep, consumeError }
}

export { useConsume, UseConsume }
export default useConsume
