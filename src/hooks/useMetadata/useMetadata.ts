import { useState, useEffect, useCallback } from 'react'
import { DID, DDO, Metadata, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { getBestDataTokenPrice } from '../../utils/dtUtils'
import { isDDO } from '../../utils'
import BestPrice from './BestPrice'

interface UseMetadata {
  ddo: DDO
  did: DID | string
  metadata: Metadata
  title: string
  price: BestPrice
  isLoaded: boolean
  getPrice: (dataTokenAddress?: string) => Promise<BestPrice>
}

function useMetadata(asset?: DID | string | DDO): UseMetadata {
  const { ocean, status, accountId } = useOcean()
  const [internalDdo, setDDO] = useState<DDO | undefined>()
  const [internalDid, setDID] = useState<DID | string | undefined>()
  const [metadata, setMetadata] = useState<Metadata | undefined>()
  const [title, setTitle] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [price, setPrice] = useState<BestPrice | undefined>()

  const getDDO = useCallback(
    async (did: DID | string): Promise<DDO | null> => {
      if (status !== ProviderStatus.CONNECTED) return null

      const ddo = await ocean.metadatastore.retrieveDDO(did)
      return ddo
    },
    [ocean?.metadatastore, status]
  )

  const getPrice = useCallback(
    async (dataTokenAddress?: string): Promise<BestPrice> => {
      if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken
      return await getBestDataTokenPrice(ocean, dataTokenAddress, accountId)
    },
    [ocean, accountId, internalDdo?.dataToken]
  )

  const getMetadata = useCallback(async (): Promise<Metadata | null> => {
    if (!internalDdo) return null
    const metadata = internalDdo.findServiceByType('metadata')
    return metadata.attributes
  }, [internalDdo])

  useEffect(() => {
    async function init(): Promise<void> {
      if (ocean && status === ProviderStatus.CONNECTED) {
        if (!asset) return

        if (isDDO(asset)) {
          setDDO(asset)
          setDID(asset.id)
        } else {
          const ddo = await getDDO(asset)
          Logger.debug('DDO', ddo)
          setDDO(ddo)
          setDID(asset)
        }
      }
    }
    init()
  }, [ocean, status, asset, getDDO])

  useEffect(() => {
    if (!accountId) return

    async function init(): Promise<void> {
      if (internalDdo) {
        const metadata = await getMetadata()
        setMetadata(metadata)
        setTitle(metadata.main.name)
        const price = await getPrice()

        setPrice(price)
        setIsLoaded(true)
      }
    }
    init()

    const interval = setInterval(async () => {
      const price = await getPrice()
      setPrice(price)
    }, 10000)
    return () => clearInterval(interval)
  }, [accountId, internalDdo, getMetadata, getPrice])

  return {
    ddo: internalDdo,
    did: internalDid,
    metadata,
    title,
    price,
    isLoaded,
    getPrice
  }
}

export { useMetadata, UseMetadata }
export default useMetadata
