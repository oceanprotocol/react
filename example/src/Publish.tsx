import React from 'react'
import { useOcean, usePublish } from '@oceanprotocol/react'
import {  DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata'

export function Publish() {
  const { accountId,ocean } = useOcean()
  const { publish, publishStepText } = usePublish()
  const [ddo, setDdo] = useState<DDO | undefined>()

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
  }

  const publishAsset = async () => {
    const ddo = await publish(asset as Metadata, '90','access','','')
    console.log(ddo)
    const pool = ocean.pool.createDTPool(accountId,ddo.dataToken,'90','9','0.03')
    setDdo(ddo)
  }
  return (
    <>
      <div>Publish</div>
      <div>
        <button onClick={publishAsset}>Publish</button>
      </div>
      <div>Status: {publishStepText}</div>
      <div>DID: {ddo && ddo.id} </div>
    </>
  )
}
