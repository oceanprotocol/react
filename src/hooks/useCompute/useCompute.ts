import { useState } from 'react'
import { DID, MetaDataAlgorithm } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import { ComputeValue } from './ComputeOptions'

interface UseCompute {
  compute: (
    did: DID,
    algorithmRawCode: string,
    computeContainer: ComputeValue
  ) => Promise<void>
  computeStep?: number
  computeError?: string
}

// TODO: customize for compute
export const feedback: { [key in number]: string } = {
  99: 'Decrypting file URL...',
  0: '1/3 Asking for agreement signature...',
  1: '1/3 Agreement initialized.',
  2: '2/3 Asking for two payment confirmations...',
  3: '2/3 Payment confirmed. Requesting access...',
  4: '3/3 Access granted. Consuming file...'
}
const rawAlgorithmMeta: MetaDataAlgorithm = {
  rawcode: `console.log('Hello world'!)`,
  format: 'docker-image',
  version: '0.1',
  container: {
    entrypoint: '',
    image: '',
    tag: ''
  }
}

function useCompute(): UseCompute {
  const { ocean, account, accountId, config } = useOcean()
  const [computeStep, setComputeStep] = useState<number | undefined>()
  const [computeError, setComputeError] = useState<string | undefined>()

  async function compute(
    did: DID | string,
    algorithmRawCode: string,
    computeContainer: ComputeValue
  ): Promise<void> {
    if (!ocean || !account) return

    setComputeError(undefined)

    try {
      const computeOutput = {
        publishAlgorithmLog: false,
        publishOutput: false,
        brizoAddress: config.brizoAddress,
        brizoUri: config.brizoUri,
        metadataUri: config.aquariusUri,
        nodeUri: config.nodeUri,
        owner: accountId,
        secretStoreUri: config.secretStoreUri
      }

      const agreement = await ocean.compute
        .order(account, did as string)
        .next((step: number) => setComputeStep(step))

      rawAlgorithmMeta.container = computeContainer
      rawAlgorithmMeta.rawcode = algorithmRawCode

      await ocean.compute.start(
        account,
        agreement,
        undefined,
        rawAlgorithmMeta,
        computeOutput
      )
    } catch (error) {
      setComputeError(error.message)
    } finally {
      setComputeStep(undefined)
    }
  }

  return { compute, computeStep, computeError }
}

export { useCompute, UseCompute }
export default UseCompute
