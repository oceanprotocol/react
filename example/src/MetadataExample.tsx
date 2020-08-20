import React, { useEffect, useState } from 'react'
import { useMetadata } from '@oceanprotocol/react'
import { DDO } from '@oceanprotocol/lib'

export function MetadataExample({ ddo }: { ddo: DDO }) {
  const { title, poolAddress, price } = useMetadata(ddo)

  return (
    <>
      <div>
        {title} - price = {price} // pool = {poolAddress}
      </div>
    </>
  )
}
