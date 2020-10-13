# `OceanProvider`

The `OceanProvider` maintains a connection to the Ocean Protocol network in multiple steps:

1. On mount, setup [Web3Modal](https://github.com/Web3Modal/).
2. Once connection with Web3Modal is started, Web3 becomes available.
3. Once Web3 becomes available, connection to Ocean Protocol components are initiated, all available under the `ocean` object.

With the included `useOcean` helper hook you can access all context values from any component.

## Usage

Wrap your whole app with the `OceanProvider`:

```tsx
import React, { ReactNode } from 'react'
import { OceanProvider } from '@oceanprotocol/react'
import { ConfigHelper } from '@oceanprotocol/lib'

const web3ModalOpts = {
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions // required
}

const oceanDefaultConfig = new ConfigHelper().getConfig(
  'mainnet',
  'YOUR_INFURA_PROJECT_ID'
)

const config = {
  ...oceanDefaultConfig,
  metadataCacheUri: 'https://your-metadata-cache.com',
  providerUri: 'https://your-provider.com'
}

export default function MyApp({
  children
}: {
  children: ReactNode
}): ReactNode {
  return (
    <OceanProvider initialConfig={config} web3ModalOpts={web3ModalOpts}>
      <h1>My App</h1>
      {children}
    </OceanProvider>
  )
}
```

The `OceanProvider` uses [Web3Modal](https://github.com/Web3Modal/) to make its initial wallet connection. If you do not pass `web3ModalOpts` as a prop, only the default injected provider will be available. Adding more providers requires you to add them as dependencies to your project and pass them as `providerOptions`. See all the available [Provider Options](https://github.com/Web3Modal/web3modal#provider-options).

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
