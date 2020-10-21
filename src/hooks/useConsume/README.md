# `useConsume`

Get access to, and download a data asset.

## Usage

```tsx
import React from 'react'
import { useOcean, useConsume } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'
const dtBalance = 20

export default function MyComponent() {
  const { accountId } = useOcean()

  // Get metadata for this asset
  const { title, price, ddo } = useMetadata(did)

  // Pricing helpers
  const { buyDT } = usePricing(ddo)

  // Consume helpers
  const { consume, consumeStep } = useConsume()

  const hasDatatoken = dtBalance >= 1

  async function handleDownload() {
    !hasDatatoken && (await buyDT('1'))
    await consume(did, ddo.dataToken, 'access')
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {price}</p>

      <p>Your account: {accountId}</p>
      <button onClick={handleDownload}>
        {consumeStep || 'Download Asset'}
      </button>
    </div>
  )
}
```
