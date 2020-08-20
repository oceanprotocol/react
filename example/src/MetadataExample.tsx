import React, { useEffect, useState } from 'react'
import { useMetadata } from '@oceanprotocol/react'

export function MetadataExample({ did }: { did: string }) {
  const { title, pool } = useMetadata(did)

  return (
    <>
      <div>
        {title} - {pool && pool.price + ' - ' + pool.address}
      </div>
    </>
  )
}
