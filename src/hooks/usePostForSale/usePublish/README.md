# `usePublish`

Post asset for sale by creating liquidity pools or fixed rate exchange

## Usage

```tsx
import React from 'react'
import { useOcean, usePostforSale } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()

  // Publish helpers
  const { publish, publishStep } = usePostforSale()
  
  const priceOptions = {
    price: 10,
    dtAmount: 10,
    type: 'fixed',
    weightOnDataToken: '',
    swapFee: ''
  }

  async function handlePostforSale() {
    const ddo = await createPricing(dataTokenAddress, priceOptions)
  }

  return (
    <div>
      <h1>Post for sale</h1>

      <p>Your account: {accountId}</p>
      <button onClick={handlePostforSale}>Post for sale</button>
    </div>
  )
}
```
