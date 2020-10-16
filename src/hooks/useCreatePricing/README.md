# `usePricing`

Hook with helper utilities to create fixed price exchanges or liquidity pools for your data set

## Usage

```tsx
import React from 'react'
import { useOcean, useCreatePricing } from '@oceanprotocol/react'
import { Metadata } from '@oceanprotocol/lib'

export default function MyComponent() {
  const { accountId } = useOcean()
  const dataTokenAddress = '0x00000'
  // Publish helpers
  const { createPricing } = useCreatePricing()
  
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

  
  return (
    <div>
      <h1>Post for sale</h1>

      <p>Your account: {accountId}</p>
      <button onClick={handleCreatePricing}>Post for sale</button>
    </div>
  )
}
```
