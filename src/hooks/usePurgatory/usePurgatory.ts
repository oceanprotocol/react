import { DDO, PurgatoryData } from '@oceanprotocol/lib'
import { useCallback, useEffect, useState } from 'react'
import getAssetData from './getAssetData'

interface UsePurgatory {
  isInPurgatory: boolean
  purgatoryData?: PurgatoryData
}

function usePurgatory(did: string): UsePurgatory {
  const [isInPurgatory, setIsInPurgatory] = useState(false)
  const [purgatoryData, setPurgatoryData] = useState<PurgatoryData>()

  const getData = useCallback(async (): Promise<void> => {
    if (!did) return
    const result = await getAssetData(did)
    if (result.did !== undefined) {
      setIsInPurgatory(true)
      setPurgatoryData(result)
    } else {
      setIsInPurgatory(false)
    }
    setPurgatoryData(result)
  }, [did])

  useEffect(() => {
    getData()
  }, [did])

  return {
    isInPurgatory,
    purgatoryData
  }
}

export { usePurgatory, UsePurgatory }
export default usePurgatory
