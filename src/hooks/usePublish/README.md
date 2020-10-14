# `usePublish`

Create data tokens, Mint and Publish data sets

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

  const dataTokenOptions = {
    tokensToMint: 10
  }

  async function handlePublish() {
    const ddo = await publish(metadata, 'access', dataTokenOptions)
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
