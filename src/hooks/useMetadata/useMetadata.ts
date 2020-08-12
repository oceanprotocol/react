import { useState, useEffect } from 'react'
import { DID, DDO, Metadata, MetadataStore, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { getBestDataTokenPrice } from '../../utils/dtUtils'

interface UseMetadata {
  ddo: DDO
  metadata: Metadata
  title: string
  getDDO: (did: DID | string) => Promise<DDO>
  getMetadata: (did: DID | string) => Promise<Metadata>
  getTitle: (did: DID | string) => Promise<string>
  getBestPrice: (dataTokenAddress: string) => Promise<string>
}

function useMetadata(did?: DID | string): UseMetadata {
  const { ocean, status, config, accountId } = useOcean()
  const [ddo, setDDO] = useState<DDO | undefined>()
  const [metadata, setMetadata] = useState<Metadata | undefined>()
  const [title, setTitle] = useState<string | undefined>()

  async function getDDO(did: DID | string): Promise<DDO> {
    if (status === ProviderStatus.CONNECTED) {
      const ddo = await ocean.metadatastore.retrieveDDO(did)
      return ddo
    }

    // fallback hitting MetadataStore directly
    const metadataStore = new MetadataStore(config.metadataStoreUri, Logger)
    const ddo = await metadataStore.retrieveDDO(did)
    return ddo
  }

  async function getBestPrice(dataTokenAddress: string): Promise<string> {
    return await getBestDataTokenPrice(ocean, accountId, dataTokenAddress)
  }

  async function getMetadata(did: DID | string): Promise<Metadata> {
    const ddo = await getDDO(did)
    if (!ddo) return
    const metadata = ddo.findServiceByType('metadata')
    return metadata.attributes
  }

  async function getTitle(did: DID | string): Promise<string> {
    const metadata = await getMetadata(did)
    return metadata.main.name
  }

  useEffect(() => {
    async function init(): Promise<void> {
      if (!did) return
      const ddo = await getDDO(did)
      setDDO(ddo)

      const metadata = await getMetadata(did)
      setMetadata(metadata)
      setTitle(metadata.main.name)
    }
    init()
  }, [ocean])

  return {
    ddo,
    metadata,
    title,
    getDDO,
    getMetadata,
    getTitle,
    getBestPrice
  }
}

export { useMetadata, UseMetadata }
export default useMetadata
