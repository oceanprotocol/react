import React, { useEffect, useState } from 'react'
import { useMetadata } from '@oceanprotocol/react'

export function MetadataExample({ did }: { did: string }) {
  const { title, getBestPrice } = useMetadata(did)
  const [price, setPrice] = useState<string>()

  useEffect(() => {
    async function init(): Promise<void> {
      if (title) {
        const price = await getBestPrice()
        setPrice(price)
      }
    }
    init()
  }, [title])

  return (
    <>
      <div>
        {title} - {price}
      </div>
    </>
  )
}
