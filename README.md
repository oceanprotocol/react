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
    // or fallback to injected providers by default
    // so it works with any browser wallet out of the box

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
  // Initialize, get existing, or reinitialize Ocean
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

### Specs

#### `useOcean()`

```tsx
interface UseOcean {
    ocean: Ocean
    account: string
    balance: { ocean: string, eth: string }
    status: OceanConnectionStatus
}

const result: UseOcean = useOcean(config: OceanConfig)
```


#### `useConsume()`

```tsx
interface ConsumeOptions {
    ocean: Ocean
}

interface UseConsume {
    consumeAsset: (ddo: DDO, account: string) => void
    isLoading: boolean
    step: number
    error: string | undefined
}

const result: UseConsume = useConsume(options: ConsumeOptions)
```