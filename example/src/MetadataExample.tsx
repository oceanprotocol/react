import React from 'react';
import { useMetadata } from '../../src';
import { DDO } from '@oceanprotocol/lib';

export const MetadataExample = (ddo: any) => {
  // ! if ddo: DDO then:
  // ! same issue as in App.tsx:
  // ! Property 'ocean' is protected but type 'Instantiable' is not a class derived from 'Instantiable'.
  const { title, price, did } = useMetadata(ddo);

  return (
    <>
      <div>
        {title} - did= {did}
      </div>
      <div>
        {price && (
          <span>
            price = {price.value} // {price.type} = {price.address}
          </span>
        )}
      </div>
    </>
  );
};
