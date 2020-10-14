# `usePricing`

Post asset for sale by creating liquidity pools or fixed rate exchange
Buy DT
Sell DT

## Usage

```tsx
import React from 'react'
import { useOcean, usePostforSale } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()

  // Publish helpers
  const { createPricing, buyDT, sellDT } = usePricing()
  
  const priceOptions = {
    price: 10,
    dtAmount: 10,
    type: 'fixed',
    weightOnDataToken: '',
    swapFee: ''
  }

  async function handleCreatePricing() {
    const ddo = await createPricing(dataTokenAddress, priceOptions)
  }

  async function handleBuyDT() {
    const ddo = await buyDT(dataTokenAddress, 1)
  }
  async function handleSellDT() {
    const ddo = await sellDT(dataTokenAddress, 1)
  }

  return (
    <div>
      <h1>Post for sale</h1>

      <p>Your account: {accountId}</p>
      <button onClick={handleCreatePricing}>Post for sale</button>
      <button onClick={handleBuyDT}>Buy DT</button>
      <button onClick={handleSellDT}>Sell DT</button>
    </div>
  )
}
```
