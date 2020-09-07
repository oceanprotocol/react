# `useConsume`

Get access to, and download a data asset.

## Usage

```tsx
import React from 'react'
import { useOcean, useConsume } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  const { accountId } = useOcean()

  // Get metadata for this asset
  const { title, price } = useMetadata(did)

  // Consume helpers
  const { consume, consumeStep } = useConsume()

  async function handleDownload() {
    await consume(did)
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
