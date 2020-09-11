import React from 'react';
import { useOcean } from '@oceanprotocol/react';
import { useState } from 'react';
import { useEffect } from 'react';
import shortid from 'shortid';
import { MetadataExample } from './MetadataExample';

export function AllDdos() {
  const { chainId, account, ocean } = useOcean();
  // ! hack. there are some deep type problems
  const [ddos, setDdos] = useState<any>();

  const init = async () => {
    if (!ocean || !account) return;

    const assets = await ocean.assets.query({
      page: 1,
      offset: 10,
      query: {},
      sort: { created: -1 }
    });

    setDdos(assets.results.slice(0, 4));
  };

  useEffect(() => {
    init();
  }, [ocean, account, chainId]);

  return (
    <>
      <div>Assets</div> <br />
      <div style={{ flexDirection: 'column' }}>
        {/* ! TODO: hack for now. some deep nested type issues re this */}
        {ddos?.map((ddo: any) => {
          return (
            <div key={shortid.generate()}>
              <MetadataExample ddo={ddo} />
              <br />
            </div>
          );
        })}
      </div>
    </>
  );
}
