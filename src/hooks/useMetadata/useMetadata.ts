import { useState, useEffect, useCallback } from 'react'
import { DID, DDO, Metadata, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { getBestDataTokenPrice } from '../../utils/dtUtils'
import { isDDO } from '../../utils'
import BestPrice from './BestPrice'

interface UseMetadata {
  ddo: DDO | undefined
  did: DID | string | undefined
  metadata: Metadata | undefined
  title: string | undefined
  price: BestPrice | undefined
  isLoaded: boolean
  getPrice: (dataTokenAddress: string) => Promise<BestPrice | void>
}

function useMetadata(asset?: DID | string | DDO): UseMetadata {
  const { ocean, status, accountId, networkId } = useOcean()
  const [internalDdo, setDDO] = useState<DDO>()
  const [internalDid, setDID] = useState<DID | string>()
  const [metadata, setMetadata] = useState<Metadata>()
  const [title, setTitle] = useState<string>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [price, setPrice] = useState<BestPrice>()

  const getDDO = useCallback(
    async (did: DID | string): Promise<DDO> => {
      const ddo = await ocean.metadatastore.retrieveDDO(did)
      return ddo
    },
    [ocean?.metadatastore]
  )

  const getPrice = useCallback(
    async (dataTokenAddress: string): Promise<BestPrice> => {
      const price = await getBestDataTokenPrice(
        ocean,
        dataTokenAddress,
        accountId
      )
      return price
    },
    [ocean, accountId]
  )

  const getMetadata = useCallback(async (ddo: DDO): Promise<Metadata> => {
    const metadata = ddo.findServiceByType('metadata')
    return metadata.attributes
  }, [])

  //
  // Get and set DDO based on passed DDO or DID
  //
  useEffect(() => {
    if (!asset || !ocean || status !== ProviderStatus.CONNECTED) return

    async function init(): Promise<void> {
      if (!asset) return

      if (isDDO(asset as string | DDO | DID)) {
        setDDO(asset as DDO)
        setDID((asset as DDO).id)
      } else {
        // asset is a DID
        const ddo = await getDDO(asset as DID)
        Logger.debug('DDO', ddo)
        setDDO(ddo)
        setDID(asset as DID)
      }
    }
    init()
  }, [ocean, status, asset, getDDO])

  //
  // Get metadata for stored DDO
  //
  useEffect(() => {
    if (!accountId) return

    async function init(): Promise<void> {
      if (!internalDdo) return

      const metadata = await getMetadata(internalDdo)
      setMetadata(metadata)
      setTitle(metadata.main.name)
      const price = await getPrice(internalDdo.dataToken)
      price && setPrice(price)
      setIsLoaded(true)
    }
    init()

    const interval = setInterval(async () => {
      if (!internalDdo) return
      const price = await getPrice(internalDdo.dataToken)
      price && setPrice(price)
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [accountId, networkId, internalDdo, getMetadata, getPrice])

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
