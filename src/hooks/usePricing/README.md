# `usePricing`

Hook with helper utilities to create fixed price exchanges or liquidity pools for your data set, mint datatokens , buy and sell datatokens

## Usage

```tsx
import React from 'react'
import { useOcean, useCreatePricing } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()
  const dataTokenAddress = '0x00000'
  // Publish helpers
  const { createPricing } = usePricing()
  
  const priceOptions = {
    price: 10,
    dtAmount: 10,
    type: 'fixed',
    weightOnDataToken: '',
    swapFee: ''
  }

  async function handleCreatePricing() {
    await createPricing(dataTokenAddress, priceOptions)
  }

  async function handleMint() {
    await mint(dataTokenAddress, '1')
  }
  async function handleBuyDT() {
    await buyDT(dataTokenAddress, '1')
  }
  async function handleSellDT() {
    await sellDT(dataTokenAddress, '1')
  }
  
  return (
    <div>
      <h1>Post for sale</h1>

      <p>Your account: {accountId}</p>
      <button onClick={handleMint}>Mint DT</button>
      <button onClick={handleCreatePricing}>Post for sale</button>
       <button onClick={handleBuyDT}>Buy DT</button>
      <button onClick={handleSellDT}>Sell DT</button>
    </div>
  )
}
```
