import React from 'react'
import { useOcean, usePublish } from '@oceanprotocol/react'
import { Metadata, DDO } from '@oceanprotocol/lib'
import { useState } from 'react'

export function Publish() {
  const { accountId } = useOcean()
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

  const marketAddress = '0x4D156A2ef69ffdDC55838176C6712C90f60a2285'

  const publishAsset = async () => {
    const ddo = await publish(asset as Metadata, '4', marketAddress, [
      { serviceType: 'access', cost: '1' }
    ])
    console.log(ddo)
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
