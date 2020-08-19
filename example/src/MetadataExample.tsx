import React, { useEffect, useState } from 'react'
import { useMetadata } from '@oceanprotocol/react'

export function MetadataExample({ did }: { did: string }) {
  const { title, bestPrice } = useMetadata(did)

  return (
    <>
      <div>
        {title} - {bestPrice}
      </div>
    </>
  )
}
