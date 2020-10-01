import React from 'react'
import { useOcean } from '@oceanprotocol/react'
import { DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useEffect } from 'react'
import shortid from 'shortid'
import { MetadataExample } from './MetadataExample'

export function AllDdos() {
  const { chainId, account, accountId, ocean } = useOcean()

  const [ddos, setDdos] = useState<DDO[]>()

  useEffect(() => {
    async function init() {
      if (!ocean || !accountId || !accountId) return

      const assets = await ocean.assets.ownerAssets(accountId)
      // const assets = await ocean.assets.query({
      //   page: 1,
      //   offset: 10,
      //   query: {},
      //   sort: { created: -1 }
      // })
      console.log('assets', assets.results)
      setDdos(assets.results.slice(0, 4))
    }
    init()
  }, [ocean, account, chainId, accountId])

  return (
    <>
      <div>Assets</div> <br />
      <div style={{ flexDirection: 'column' }}>
        {ddos?.map((ddo) => {
          return (
            <div key={shortid.generate()}>
              <MetadataExample ddo={ddo} />
              <br />
            </div>
          )
        })}
      </div>
    </>
  )
}
