# @oceanprotocol/react

> React hooks & components on top of squid.js

## Installation

```bash
npm install @oceanprotocol/react
```

## Usage

First, wrap your App with the `OceanProvider`:

```tsx
import React from 'react'
import { OceanProvider } from '@oceanprotocol/react'

export default function MyApp({ children }: { children: any }) {
    // TODO: setup web3 first

    return (
        <OceanProvider web3={web3}>
            <h1>My App</h1>
            {children}
        </OceanProvider>
        
    )
}
```

Then within your component use the provided hooks to interact with Ocean's functionality:

```tsx
import React from 'react'
import { useOcean, OceanConfig, useConsume } from '@oceanprotocol/react'

const oceanConfig: OceanConfig = {
    nodeUri: '',
    ...
}

export default function MyComponent() {
  // Initialize, get existing, or reinitalize Ocean
  const { ocean, account } = useOcean(oceanConfig)

  // consume asset
  const { consumeAsset, isLoading, step } = useConsume(ocean)

  async function handleClick() {
      const ddo = 'did:op:0x000000000'
      await consumeAsset(ddo, account)
  }

  return (
    <div>
        Your account: {account}

        <button onClick={handleClick}>
            {isLoading ? step : 'Download Asset' }
        </button>
    </div>
  )
}
```