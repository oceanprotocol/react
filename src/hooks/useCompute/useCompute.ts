import { useState } from 'react'
import { useOcean } from '../../providers'
import { ComputeValue } from './ComputeOptions'
import { feedback } from './../../utils'
import { DID, Logger } from '@oceanprotocol/lib'
import { MetadataAlgorithm } from '@oceanprotocol/lib/dist/node/ddo/interfaces/MetadataAlgorithm'

interface UseCompute {
  compute: (
    did: string,
    computeServiceIndex: number,
    dataTokenAddress: string,
    algorithmRawCode: string,
    computeContainer: ComputeValue
  ) => Promise<void>
  computeStep?: number
  computeStepText?: string
  computeError?: string
  isLoading: boolean
}

// TODO: customize for compute
export const computeFeedback: { [key in number]: string } = {
  ...feedback,
  4: '3/3 Access granted. Starting job...'
}
const rawAlgorithmMeta: MetadataAlgorithm = {
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
  const [isLoading, setIsLoading] = useState(false)

  function setStep(index: number) {
    setComputeStep(index)
    setComputeStepText(computeFeedback[index])
  }

  async function compute(
    did: string,
    computeService: any,
    dataTokenAddress: string,
    algorithmRawCode: string,
    computeContainer: ComputeValue
  ): Promise<void> {
    if (!ocean || !account) return

    setComputeError(undefined)

    try {
      setIsLoading(true)
      setStep(0)
      rawAlgorithmMeta.container = computeContainer
      rawAlgorithmMeta.rawcode = algorithmRawCode

      const output = {}
      const order = await ocean.compute.order(
        accountId,
        did,
        computeService.index,
        undefined,
        rawAlgorithmMeta
      )

      const computeOrder = JSON.parse(order)
      const tokenTransfer = await ocean.datatokens.transfer(
        computeOrder.dataToken,
        computeOrder.to,
        String(computeOrder.numTokens),
        computeOrder.from
      )
      const response = await ocean.compute.start(
        did,
        (tokenTransfer as any).transactionHash,
        dataTokenAddress,
        account,
        undefined,
        rawAlgorithmMeta,
        output,
        computeService.index,
        computeService.type
      )
    } catch (error) {
      Logger.error(error)
      setComputeError(error.message)
    } finally {
      setComputeStep(undefined)
      setIsLoading(false)
    }
  }

  return { compute, computeStep, computeStepText, computeError, isLoading }
}

export { useCompute, UseCompute }
export default UseCompute
