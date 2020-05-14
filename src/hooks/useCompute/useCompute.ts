import { useState } from 'react'
import { DID, MetaDataAlgorithm } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import { ComputeValue } from './ComputeOptions'
import { feedback } from './../../utils'
interface UseCompute {
  compute: (
    did: DID | string,
    algorithmRawCode: string,
    computeContainer: ComputeValue
  ) => Promise<void>
  computeStep?: number
  computeStepText?: string
  computeError?: string
}

// TODO: customize for compute
export const computeFeedback: { [key in number]: string } = {
  ...feedback,
  3: '3/3 Access granted. Starting job...'
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
  const [computeStepText, setComputeStepText] = useState<string | undefined>()
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
        .next((step: number) => {
          setComputeStep(step)
          setComputeStepText(computeFeedback[step])
        })

      rawAlgorithmMeta.container = computeContainer
      rawAlgorithmMeta.rawcode = algorithmRawCode
      setComputeStep(4)
      setComputeStepText(computeFeedback[4])
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

  return { compute, computeStep, computeStepText, computeError }
}

export { useCompute, UseCompute }
export default UseCompute
