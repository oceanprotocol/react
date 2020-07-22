# `useMetadata`

Get metadata for a specific data asset.

## Usage

```tsx
import React from 'react'
import { useMetadata } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get metadata for this asset
  const { ddo, title, metadata } = useMetadata(did)

  const { main, additionalInformation } = metadata

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {main.price}</p>
    </div>
  )
}
```
