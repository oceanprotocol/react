# `useMetadata`

Get metadata for a specific data asset.

`useMetadata` has 3 uses:

- `useMetadata(did)` : it gets the DDO and then loads all the values (title, metadata etc)
- `useMetadata(ddo)` : it uses the passed DDO and the loads all the values, in case you already got a list of DDOs, so you don't have to fetch the DDO once again
- `useMetadata()` : loads nothing, useful for using functions like `getPrice` or `getPool` with minimal calls

## Usage

```tsx
import React from 'react'
import { useMetadata } from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get metadata for this asset
  const { title, metadata, price } = useMetadata(did)

  const { main, additionalInformation } = metadata

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {price}</p>
    </div>
  )
}
```
