import { useState } from 'react'
import { DID } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import { AgreementData } from '@oceanprotocol/squid/dist/node/keeper/contracts/managers'

interface UseConsume {
  consume: (did: DID) => Promise<void>
  consumeStep?: number
  consumeError?: string
}

export const feedback: { [key in number]: string } = {
  99: 'Decrypting file URL...',
  0: '1/3 Asking for agreement signature...',
  1: '1/3 Agreement initialized.',
  2: '2/3 Asking for two payment confirmations...',
  3: '2/3 Payment confirmed. Requesting access...',
  4: '3/3 Access granted. Consuming file...'
}

function useConsume(): UseConsume {
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
      const agreement = agreements.find((el: AgreementData) => el.did === did)
      const agreementId = agreement
        ? agreement.agreementId
        : await ocean.assets
            .order(did, account)
            .next((step: number) => setConsumeStep(step))

      // manually add another step here for better UX
      setConsumeStep(4)
      await ocean.assets.consume(agreementId, did, account, '')
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
