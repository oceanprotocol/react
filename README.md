# @oceanprotocol/react

> React hooks & components on top of squid.js

## Installation

```bash
npm install @oceanprotocol/react
```

## Usage

```tsx
import React from 'react'
import { useOcean, OceanConfig, useConsume } from '@oceanprotocol/react'

const oceanConfig: OceanConfig = {
    nodeUri: '',
    ...
}

export default function MyComponent() {
  // TODO: setup web3 first
  const { ocean, account } = useOcean(web3, oceanConfig)
  const { consumeAsset, isLoading, step } = useConsume()

  async function handleClick() {
      const ddo = 'did:op:0x000000000'
      await consumeAsset(ddo)
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