import React from 'react';
import { usePublish } from '../../src';
import { DDO } from '@oceanprotocol/lib';
import { useState } from 'react';
import { Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata';

export function Publish() {
  const { publish, publishStepText, isLoading } = usePublish();
  const [ddo, setDdo] = useState<DDO>();

  const asset = {
    main: {
      type: 'dataset',
      name: 'test-dataset',
      dateCreated: new Date(Date.now()).toISOString().split('.')[0] + 'Z', // remove milliseconds
      author: 'oceanprotocol-team',
      license: 'MIT',
      files: [
        {
          url:
            'https://raw.githubusercontent.com/tbertinmahieux/MSongsDB/master/Tasks_Demos/CoverSongs/shs_dataset_test.txt',
          checksum: 'efb2c764274b745f5fc37f97c6b0e761',
          contentLength: '4535431',
          contentType: 'text/csv',
          encoding: 'UTF-8',
          compression: 'zip'
        }
      ]
    }
  };

  const publishAsset = async () => {
    const priceOptions = {
      price: 7,
      tokensToMint: 10,
      type: 'fixed',
      weightOnDataToken: '',
      liquidityProviderFee: ''
    };

    // ! same issue as in App.tsx again
    const ddo: any = await publish(asset as Metadata, priceOptions, 'access');
    setDdo(ddo);
  };
  return (
    <>
      <div>Publish</div>
      <div>
        <button onClick={publishAsset}>Publish</button>
      </div>
      <div>
        IsLoading: {isLoading.toString()} || Status: {publishStepText}
      </div>
      <div>DID: {ddo && ddo.id} </div>
    </>
  );
}
