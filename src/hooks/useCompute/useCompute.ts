import { useState } from 'react'
import { useOcean } from 'providers'
import { ComputeValue } from './ComputeOptions'
import { Logger, ServiceCompute } from '@oceanprotocol/lib'
import { MetadataAlgorithm } from '@oceanprotocol/lib/dist/node/ddo/interfaces/MetadataAlgorithm'
import { ComputeJob } from '@oceanprotocol/lib/dist/node/ocean/interfaces/ComputeJob'
import { computeFeedback } from 'utils'

interface UseCompute {
  compute: (
    did: string,
    computeService: ServiceCompute,
    dataTokenAddress: string,
    algorithmRawCode: string,
    computeContainer: ComputeValue,
    marketFeeAddress?: string,
    orderId?: string
  ) => Promise<ComputeJob | void>
  computeStep?: number
  computeStepText?: string
  computeError?: string
  isLoading: boolean
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
  const { ocean, account, accountId } = useOcean()
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
    marketFeeAddress?: string,
    orderId?: string
  ): Promise<ComputeJob | void> {
    if (!ocean || !account) return
    setComputeError(undefined)
    try {
      setIsLoading(true)
      setStep(0)
      rawAlgorithmMeta.container = computeContainer
      rawAlgorithmMeta.rawcode = algorithmRawCode
      const output = {}
      if (!orderId) {
        const userOwnedTokens = await ocean.accounts.getTokenBalance(
          dataTokenAddress,
          account
        )
        if (parseFloat(userOwnedTokens) < 1) {
          setComputeError('Not enough datatokens')
        } else {
          Logger.log(
            'compute order',
            accountId,
            did,
            computeService,
            rawAlgorithmMeta,
            marketFeeAddress
          )
          orderId = await ocean.compute.order(
            accountId,
            did,
            computeService.index,
            undefined,
            rawAlgorithmMeta,
            marketFeeAddress
          )
          setStep(1)
        }
      }
      setStep(2)
      if (orderId) {
        const response = await ocean.compute.start(
          did,
          orderId,
          dataTokenAddress,
          account,
          undefined,
          rawAlgorithmMeta,
          output,
          `${computeService.index}`,
          computeService.type
        )
        return response
      }
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
