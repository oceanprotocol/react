import { useState, useEffect } from 'react'
import axios from 'axios'
import { DID, DDO, MetaData, Curation } from '@oceanprotocol/squid'
import { useOcean, OceanConnectionStatus } from '../../providers'

interface UseMetadata {
  ddo: DDO
  metadata: MetaData
  title: string
  getDDO: (did: DID | string) => Promise<DDO>
  getMetadata: (did: DID | string) => Promise<MetaData>
  getCuration: (did: DID | string) => Promise<Curation>
  getTitle: (did: DID | string) => Promise<string>
  getAllDIDs: () => Promise<DID[]>
}

function useMetadata(did?: DID | string): UseMetadata {
  const { aquarius, config, status } = useOcean()
  const [ddo, setDDO] = useState<DDO | undefined>()
  const [metadata, setMetadata] = useState<MetaData | undefined>()
  const [title, setTitle] = useState<string | undefined>()

  async function getDDO(did: DID | string): Promise<DDO> {
    if(status!=OceanConnectionStatus.CONNECTED) return
    
    const ddo = await aquarius.retrieveDDO(did)
    return ddo
  }

  async function getMetadata(did: DID | string): Promise<MetaData> {
    const ddo = await getDDO(did)
    if(!ddo) return
    const metadata = ddo.findServiceByType('metadata')
    return metadata.attributes
  }

  async function getCuration(did: DID | string): Promise<Curation> {
    const metadata = await getMetadata(did)
    return metadata.curation
  }

  async function getTitle(did: DID | string): Promise<string> {
    const metadata = await getMetadata(did)
    console.log(metadata)
    return metadata.main.name
  }

  async function getAllDIDs(): Promise<DID[]> {
    const assets = await axios(`${config.aquariusUri}/api/v1/aquarius/assets`)
    return assets.data
  }

  useEffect(() => {
    async function init(): Promise<void> {
      if(!did) return
      const ddo = await getDDO(did)
      setDDO(ddo)

      const metadata = await getMetadata(did)
      setMetadata(metadata)
      setTitle(metadata.main.name)
    }
    init()
  }, [])

  return {
    ddo,
    metadata,
    title,
    getDDO,
    getMetadata,
    getCuration,
    getTitle,
    getAllDIDs
  }
}

export { useMetadata, UseMetadata }
export default useMetadata
