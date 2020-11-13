import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  useCallback,
  ReactNode
} from 'react'
import {
  Logger,
  DDO,
  Metadata,
  BestPrice,
  MetadataCache
} from '@oceanprotocol/lib'
import { PurgatoryData } from '@oceanprotocol/lib/dist/node/ddo/interfaces/PurgatoryData'
import { useOcean } from '../index'
import { isDDO, getDataTokenPrice } from 'utils'
import { getAssetPurgatoryData } from '../../utils/getPurgatoryData'
import ProviderStatus from '../OceanProvider/ProviderStatus'
import { ConfigHelperConfig } from '@oceanprotocol/lib/dist/node/utils/ConfigHelper'

interface AssetProviderValue {
  isInPurgatory: boolean
  purgatoryData: PurgatoryData
  ddo: DDO | undefined
  did: string | undefined
  metadata: Metadata | undefined
  title: string | undefined
  owner: string | undefined
  price: BestPrice | undefined
  refreshPrice: () => void
}

const AssetContext = createContext({} as AssetProviderValue)

function AssetProvider({
  asset,
  children
}: {
  asset: string | DDO
  children: ReactNode
}): ReactElement {
  const { ocean, status, config, networkId } = useOcean()
  const [isInPurgatory, setIsInPurgatory] = useState(false)
  const [purgatoryData, setPurgatoryData] = useState<PurgatoryData>()
  const [internalDdo, setDDO] = useState<DDO>()
  const [internalDid, setDID] = useState<string>()
  const [metadata, setMetadata] = useState<Metadata>()
  const [title, setTitle] = useState<string>()
  const [price, setPrice] = useState<BestPrice>()
  const [owner, setOwner] = useState<string>()

  const init = useCallback(async () => {
    Logger.log('Asset Provider init')
    if (!config.metadataCacheUri) return
    if (isDDO(asset as string | DDO)) {
      setDDO(asset as DDO)
      setDID((asset as DDO).id)
    } else {
      // asset is a DID

      const metadataCache = new MetadataCache(config.metadataCacheUri, Logger)
      const ddo = await metadataCache.retrieveDDO(asset as string)
      Logger.debug('DDO asset', ddo)
      setDDO(ddo)
      setDID(asset as string)
    }
  }, [asset, config.metadataCacheUri])

  const getPrice = useCallback(async (): Promise<BestPrice> => {
    if (!internalDdo)
      return {
        type: '',
        address: '',
        value: 0,
        ocean: 0,
        datatoken: 0
      } as BestPrice

    const price = await getDataTokenPrice(
      ocean,
      internalDdo.dataToken,
      internalDdo?.price?.type,
      internalDdo.price.pools[0]
    )
    return price
  }, [ocean, internalDdo])

  useEffect(() => {
    init()
  }, [init, asset, ocean, status])

  const initMetadata = useCallback(async (): Promise<void> => {
    if (!internalDdo) return
    // Set price from DDO first
    setPrice(internalDdo.price)

    const metadata = internalDdo.findServiceByType('metadata').attributes
    setMetadata(metadata)
    setTitle(metadata.main.name)
    setOwner(internalDdo.publicKey[0].owner)

    setIsInPurgatory(internalDdo.isInPurgatory)
    setPurgatoryData(internalDdo.purgatoryData)
    await setPurgatory(internalDdo.id)
    // Stop here and do not start fetching from chain, when not connected properly.
    if (status !== 1 || networkId !== (config as ConfigHelperConfig).networkId)
      return

    // Set price again, but from chain
    const priceLive = await getPrice()
    priceLive && internalDdo.price !== priceLive && setPrice(priceLive)
  }, [internalDdo, getPrice])

  useEffect(() => {
    if (!internalDdo || !ocean || status !== ProviderStatus.CONNECTED) return
    initMetadata()
  }, [status, internalDdo, initMetadata])

  const setPurgatory = useCallback(async (did: string): Promise<void> => {
    if (!did) return
    try {
      const result = await getAssetPurgatoryData(did)

      if (result.did !== undefined) {
        setIsInPurgatory(true)
        setPurgatoryData(result)
      } else {
        setIsInPurgatory(false)
      }
      setPurgatoryData(result)
    } catch (error) {
      Logger.error(error)
    }
  }, [])

  async function refreshPrice(): Promise<void> {
    const livePrice = await getPrice()
    setPrice(livePrice)
  }
  return (
    <AssetContext.Provider
      value={
        {
          ddo: internalDdo,
          did: internalDid,
          metadata,
          title,
          owner,
          price,
          isInPurgatory,
          purgatoryData,
          refreshPrice
        } as AssetProviderValue
      }
    >
      {children}
    </AssetContext.Provider>
  )
}

// Helper hook to access the provider values
const useAsset = (): AssetProviderValue => useContext(AssetContext)

export { AssetProvider, useAsset, AssetProviderValue, AssetContext }
export default AssetProvider
