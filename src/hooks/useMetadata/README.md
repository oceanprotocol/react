# `useMetadata`

Get metadata for a specific data asset.

`useMetadata` has 3 uses:
 - `useMetadata(did)` : it gets the ddo and then loads all the values (title, metadata etc)
 - `useMetadata(ddo)` : it uses the passed ddo and the loads all the values, in case you already got a list of ddo, so you don't have to fetch the ddo once again
 - `useMetadata()` : loads nothing, useful for using functions like `getBestPrice` or `getBestPool` (maybe more in the future) with minimal calls

## Usage

```tsx
import React from 'react'
import { useMetadata } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get metadata for this asset
  const { ddo, title, metadata, bestPrice} = useMetadata(did)

  const { main, additionalInformation } = metadata

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {bestPrice}</p>
    </div>
  )
}
```
