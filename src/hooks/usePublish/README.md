# `usePublish`

Publish data sets, and create data tokens and liquidity pools for them.

## Usage

```tsx
import React from 'react'
import { useOcean, usePublish } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()

  // Publish helpers
  const { publish, publishStep } = usePublish()

  const metadata: MetaData = {
    main: {
      name: 'Asset'
    },
    additionalInformation: {
      description: 'My Cool Asset'
    }
  }

  const priceOptions = {
    price: 10,
    tokensToMint: 10,
    type: 'fixed',
    weightOnDataToken: '',
    swapFee: ''
  }

  async function handlePublish() {
    const ddo = await publish(metadata, priceOptions, 'access')
  }

  return (
    <div>
      <h1>Publish</h1>

      <p>Your account: {accountId}</p>
      <button onClick={handlePublish}>Publish</button>
    </div>
  )
}
```
