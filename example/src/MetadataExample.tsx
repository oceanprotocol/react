import React from 'react'
import { useMetadata } from '@oceanprotocol/react'
import { DDO } from '@oceanprotocol/lib'

export function MetadataExample({ ddo }: { ddo: DDO }) {
  const { title, price, did } = useMetadata(ddo)

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
  )
}
