import { useState, useEffect } from 'react'
import { DID, DDO, Metadata, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { getBestDataTokenPrice, getCheapestPool } from '../../utils/dtUtils'

interface UseMetadata {
  ddo: DDO
  did: DID | string
  metadata: Metadata
  title: string
  bestPrice: string
  isLoaded: boolean
  getBestPrice: (dataTokenAddress?: string) => Promise<string>
  getBestPool: (
    dataTokenAddress?: string
  ) => Promise<{ poolAddress: string; poolPrice: string }>
}

function useMetadata(did?: DID | string, ddo?: DDO): UseMetadata {
  const { ocean, status, config, accountId } = useOcean()
  const [internalDdo, setDDO] = useState<DDO | undefined>()
  const [internalDid, setDID] = useState<DID | string | undefined>()
  const [metadata, setMetadata] = useState<Metadata | undefined>()
  const [title, setTitle] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [bestPrice, setBestPrice] = useState<string | undefined>()

  async function getDDO(did: DID | string): Promise<DDO> {
    if (status === ProviderStatus.CONNECTED) {
      const ddo = await ocean.metadatastore.retrieveDDO(did)
      return ddo
    }
  }

  async function getBestPrice(dataTokenAddress?: string): Promise<string> {
    if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken
    return await getBestDataTokenPrice(ocean, accountId, dataTokenAddress)
  }
  async function getBestPool(
    dataTokenAddress: string
  ): Promise<{ poolAddress: string; poolPrice: string }> {
    if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken
    return await getCheapestPool(ocean, accountId, dataTokenAddress)
  }

  async function getMetadata(): Promise<Metadata> {
    if (!internalDdo) return
    const metadata = internalDdo.findServiceByType('metadata')
    return metadata.attributes
  }

  async function getTitle(): Promise<string> {
    const metadata = await getMetadata()
    return metadata.main.name
  }

  useEffect(() => {
    async function init(): Promise<void> {
      Logger.debug('meta init', status)
      if (ocean && status === ProviderStatus.CONNECTED) {
        if (ddo) {
          setDDO(ddo)
          setDID(ddo.id)
        }
        Logger.debug('meta init', did)
        if (did && !ddo) {
          const ddo = await getDDO(did)
          Logger.debug('DDO', ddo)
          setDDO(ddo)
          setDID(did)
        }
      }
    }
    init()
  }, [ocean, status])

  useEffect(() => {
    async function init(): Promise<void> {
      if (internalDdo) {
        const metadata = await getMetadata()
        setMetadata(metadata)
        setTitle(metadata.main.name)
        const price = await getBestPrice()
        setBestPrice(price)
        setIsLoaded(true)
      }
    }
    init()

    const interval = setInterval(async () => {
      const price = await getBestPrice()
      setBestPrice(price)
    }, 10000)
    return () => clearInterval(interval)
  }, [internalDdo])

  return {
    ddo: internalDdo,
    did: internalDid,
    metadata,
    title,
    bestPrice,
    isLoaded,
    getBestPrice,
    getBestPool
  }
}

export { useMetadata, UseMetadata }
export default useMetadata
