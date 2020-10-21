# `usePublish`

Publish data sets and create datatokens for them.

## Usage

```tsx
import React from 'react'
import { useOcean, usePublish } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { ocean, accountId } = useOcean()

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

  async function handlePublish() {
    const ddo = await publish(metadata, 'access')
    // Heads Up! You should now create pricing for your data set
    // with the `usePricing()` hook in another step.
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
