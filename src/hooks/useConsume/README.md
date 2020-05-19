# `useConsume`

Get access to, and download a data asset.

## Usage

```tsx
import React from 'react'
import { useWeb3, useMetadata, useConsume } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get web3 from Web3Provider context
  const { web3, account } = useWeb3()

  // Get metadata for this asset
  const { title, metadata } = useMetadata(did)

  // consume asset
  const { consume, consumeStep } = useConsume()

  async function handleDownload() {
    await consume(did)
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {web3.utils.fromWei(metadata.main.price)}</p>

      <p>Your account: {account}</p>
      <button onClick={handleDownload}>
        {consumeStep || 'Download Asset'}
      </button>
    </div>
  )
}
```
