import { DID, DDO, MetaData } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'

interface UseMetadata {
  getDDO: (did: DID | string) => Promise<DDO>
  getMetadata: (did: DID | string) => Promise<MetaData>
  getTitle: (did: DID | string) => Promise<string>
}

function useMetadata(): UseMetadata {
  const { aquarius } = useOcean()

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

  return { getDDO, getMetadata, getTitle }
}

export { useMetadata, UseMetadata }
export default useConsume
