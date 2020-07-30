# `OceanProvider`

The `OceanProvider` maintains a connection to the Ocean Protocol network in multiple steps:

1. On mount, connect to Aquarius instance right away so any asset metadata can be retrieved before, and independent of any Web3 connections.
2. Once Web3 becomes available, a connection to all Ocean Protocol network components is established.
3. Once Ocean becomes available, spits out some info about it.

Also provides a `useOcean` helper hook to access its context values from any component.

## Usage

Wrap your whole app with the `OceanProvider`:

```tsx
import React, { ReactNode } from 'react'
import { OceanProvider, Config } from '@oceanprotocol/react'

const config: Config = {
  nodeUri: '',
  metadataStoreUri: '',
  ...
}

export default function MyApp({
  children
}: {
  children: ReactNode
}): ReactNode {
  return (
    <OceanProvider config={config} web3ModalOpts={web3ModalOpts}>
        <h1>My App</h1>
        {children}
    </OceanProvider>
  )
}
```

You can then access the provider context values with the `useOcean` hook:

```tsx
import { useOcean } from '@oceanprotocol/react'

function MyComponent() {
  const { ocean, accountId } = useOcean()

  return (
    <ul>
      <li>Ocean available: {`${Boolean(ocean)}`}</li>
      <li>Account: {accountId}</li>
    </ul>
  )
}
```
