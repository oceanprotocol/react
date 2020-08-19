import React, { useEffect, useState } from 'react'
import { useMetadata } from '@oceanprotocol/react'

export function MetadataExample({ did }: { did: string }) {
  const { title, isLoaded, getBestPrice } = useMetadata(did)
  const [price, setPrice] = useState<string>()

  useEffect(() => {
    async function init(): Promise<void> {
      if (isLoaded) {
        const price = await getBestPrice()
        setPrice(price)
      }
    }
    init()
  }, [isLoaded])

  return (
    <>
      <div>
        {title} - {price}
      </div>
    </>
  )
}
