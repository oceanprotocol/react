import { useState, useEffect } from 'react'
import axios from 'axios'
import { DID, DDO, MetaData } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'

interface UseMetadata {
  ddo: DDO
  metadata: MetaData
  title: string
  getDDO: (did: DID | string) => Promise<DDO>
  getMetadata: (did: DID | string) => Promise<MetaData>
  getTitle: (did: DID | string) => Promise<string>
  getAllDIDs: () => Promise<DID[]>
}

function useMetadata(did?: DID | string): UseMetadata {
  const { aquarius, config } = useOcean()
  const [ddo, setDDO] = useState<DDO | undefined>()
  const [metadata, setMetadata] = useState<MetaData | undefined>()
  const [title, setTitle] = useState<string | undefined>()

  async function getDDO(did: DID | string): Promise<DDO> {
    const ddo = await aquarius.retrieveDDO(did)
    return ddo
  }

  async function getMetadata(did: DID | string): Promise<MetaData> {
    const ddo = await getDDO(did)
    const metadata = ddo.findServiceByType('metadata')
    return metadata.attributes
  }

  async function getTitle(did: DID | string): Promise<string> {
    const metadata = await getMetadata(did)
    return metadata.main.name
  }

  async function getAllDIDs(): Promise<DID[]> {
    const assets = await axios(`${config.aquariusUri}/api/v1/aquarius/assets`)
    return assets.data
  }

  useEffect(() => {
    async function init(): Promise<void> {
      const ddo = await getDDO(did)
      setDDO(ddo)

      const metadata = await getMetadata(did)
      setMetadata(metadata)
      setTitle(metadata.main.name)
    }
    init()
  }, [])

  return { ddo, metadata, title, getDDO, getMetadata, getTitle, getAllDIDs }
}

export { useMetadata, UseMetadata }
export default useMetadata
