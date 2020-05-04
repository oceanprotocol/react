# `Web3Provider`

To get you started, we added this basic `Web3Provider` which assumes an injected provider (like MetaMask), and will ask for user permissions automatically on first mount.

Also provides a `useWeb3` helper hook to access its context values from any component.

We suggest you replace this provider with a more complete solution, since there are many UX considerations not handled in that basic provider, like activate only on user intent, listen for account & network changes, display connection instructions and errors, etc.

Some great solutions we liked to work with:

- [web3-react](https://github.com/NoahZinsmeister/web3-react)
- [web3modal](https://github.com/web3modal/web3modal)

## Usage

Wrap your whole app with the `Web3Provider`:

```tsx
import { Web3Provider } from '@oceanprotocol/react'

function MyApp() {
  return (
    <Web3Provider>
      {({ web3, chainId, account, balance, enable }) => (
        <ul>
          <li>Web3 available: {`${Boolean(web3)}`}</li>
          <li>Chain ID: {chainId}</li>
          <li>Account: {account}</li>
          <li>Balance: {balance}</li>
        </ul>
      )}
    </Web3Provider>
  )
}
```

You can then access the provider context values with the `useWeb3` hook:

```tsx
import { useWeb3 } from '@oceanprotocol/react'

function MyComponent() {
  const { web3, chainId, account, balance, enable } = useWeb3()

  return (
    <ul>
      <li>Web3 available: {`${Boolean(web3)}`}</li>
      <li>Chain ID: {chainId}</li>
      <li>Account: {account}</li>
      <li>Balance: {balance}</li>
    </ul>
  )
}
```
