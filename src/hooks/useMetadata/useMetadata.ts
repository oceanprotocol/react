import { useState, useEffect } from 'react';
import { DID, DDO, Metadata, Logger } from '@oceanprotocol/lib';
import { useOcean } from '../../providers';
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus';
import { getBestDataTokenPrice } from '../../utils/dtUtils';
import { isDDO } from '../../utils';
import BestPrice from './BestPrice';

interface UseMetadata {
  ddo: DDO;
  did: DID | string;
  metadata: Metadata;
  title: string;
  price: BestPrice;
  isLoaded: boolean;
  getPrice: (dataTokenAddress?: string) => Promise<BestPrice>;
}

function useMetadata(asset?: DID | string | DDO): UseMetadata {
  const { ocean, status, accountId } = useOcean();
  const [internalDdo, setDDO] = useState<DDO | undefined>();
  const [internalDid, setDID] = useState<DID | string | undefined>();
  const [metadata, setMetadata] = useState<Metadata | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [price, setPrice] = useState<BestPrice | undefined>();

  async function getDDO(did: DID | string): Promise<DDO> {
    if (status === ProviderStatus.CONNECTED) {
      const ddo = await ocean.metadatastore.retrieveDDO(did);
      return ddo;
    }
  }

  async function getPrice(dataTokenAddress?: string): Promise<BestPrice> {
    if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken;
    return await getBestDataTokenPrice(ocean, dataTokenAddress, accountId);
  }

  async function getMetadata(): Promise<Metadata> {
    if (!internalDdo) return;
    const metadata = internalDdo.findServiceByType('metadata');
    return metadata.attributes;
  }

  useEffect(() => {
    async function init(): Promise<void> {
      if (ocean && status === ProviderStatus.CONNECTED) {
        if (!asset) return;

        if (isDDO(asset)) {
          setDDO(asset);
          setDID(asset.id);
        } else {
          const ddo = await getDDO(asset);
          Logger.debug('DDO', ddo);
          setDDO(ddo);
          setDID(asset);
        }
      }
    }
    init();
  }, [ocean, status]);

  useEffect(() => {
    if (!accountId) return;

    async function init(): Promise<void> {
      if (internalDdo) {
        const metadata = await getMetadata();
        setMetadata(metadata);
        setTitle(metadata.main.name);
        const price = await getPrice();

        setPrice(price);
        setIsLoaded(true);
      }
    }
    init();

    const interval = setInterval(async () => {
      const price = await getPrice();
      setPrice(price);
    }, 10000);
    return () => clearInterval(interval);
  }, [accountId, internalDdo]);

  return {
    ddo: internalDdo,
    did: internalDid,
    metadata,
    title,
    price,
    isLoaded,
    getPrice
  };
}

export { useMetadata, UseMetadata };
export default useMetadata;
