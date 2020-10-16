# `usePricing`

Hook to buy and sell datatokens

## Usage

```tsx
import React from 'react'
import { useOcean, useTrade } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()
  const dataTokenAddress = '0x00000'
  // Publish helpers
  const { buyDT, sellDT } = useTrade()
  
  
  async function handleBuyDT() {
    await buyDT(dataTokenAddress, '1')
  }
  async function handleSellDT() {
    await sellDT(dataTokenAddress, '1')
  }

  return (
    <div>
      <h1>Trade</h1>

      <button onClick={handleBuyDT}>Buy DT</button>
      <button onClick={handleSellDT}>Sell DT</button>
    </div>
  )
}
```
