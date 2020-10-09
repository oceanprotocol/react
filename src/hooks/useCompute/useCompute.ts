import { useState } from 'react'
import { useOcean } from 'providers'
import { ComputeValue } from './ComputeOptions'
import { Logger, ServiceCompute } from '@oceanprotocol/lib'
import { MetadataAlgorithm } from '@oceanprotocol/lib/dist/node/ddo/interfaces/MetadataAlgorithm'
import { ComputeJob } from '@oceanprotocol/lib/dist/node/ocean/interfaces/ComputeJob'
import { checkAndBuyDT } from 'utils/dtUtils'

interface UseCompute {
  compute: (
    did: string,
    computeService: ServiceCompute,
    dataTokenAddress: string,
    algorithmRawCode: string,
    computeContainer: ComputeValue,
    marketFeeAddress: string
  ) => Promise<ComputeJob | void>
  computeStep?: number
  computeStepText?: string
  computeError?: string
  isLoading: boolean
}

// TODO: customize for compute
export const computeFeedback: { [key in number]: string } = {
  0: '1/3 Ordering asset...',
  1: '2/3 Transfering data token.',
  2: '3/3 Access granted. Starting job...'
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

  function setStep(index?: number) {
    if (!index) {
      setComputeStep(undefined)
      setComputeStepText(undefined)
      return
    }

    setComputeStep(index)
    setComputeStepText(computeFeedback[index])
  }

  async function compute(
    did: string,
    computeService: ServiceCompute,
    dataTokenAddress: string,
    algorithmRawCode: string,
    computeContainer: ComputeValue,
    marketFeeAddress: string
  ): Promise<ComputeJob | void> {
    if (!ocean || !account) return

    setComputeError(undefined)

    try {
      setIsLoading(true)
      setStep(0)

      await checkAndBuyDT(ocean, dataTokenAddress, account, config)
      rawAlgorithmMeta.container = computeContainer
      rawAlgorithmMeta.rawcode = algorithmRawCode

      const output = {}
      Logger.log(
        'compute order',
        accountId,
        did,
        computeService,
        rawAlgorithmMeta,
        marketFeeAddress
      )
      const tokenTransfer = await ocean.compute.order(
        accountId,
        did,
        computeService.index,
        undefined,
        rawAlgorithmMeta,
        marketFeeAddress
      )

      setStep(1)
      // const computeOrder = JSON.parse(order)
      // Logger.log('compute order', computeOrder)
      // const tokenTransfer = await ocean.datatokens.transferWei(
      //   computeOrder.dataToken,
      //   computeOrder.to,
      //   String(computeOrder.numTokens),
      //   computeOrder.from
      // )
      setStep(2)
      const response = await ocean.compute.start(
        did,
        tokenTransfer,
        dataTokenAddress,
        account,
        undefined,
        rawAlgorithmMeta,
        output,
        `${computeService.index}`,
        computeService.type
      )
      return response
    } catch (error) {
      Logger.error(error)
      setComputeError(error.message)
    } finally {
      setStep(undefined)
      setIsLoading(false)
    }
  }

  return { compute, computeStep, computeStepText, computeError, isLoading }
}

export { useCompute, UseCompute }
export default UseCompute
