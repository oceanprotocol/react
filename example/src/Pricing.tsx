import React from 'react'
import { useOcean, usePricing } from '@oceanprotocol/react'
// import { useOcean, usePublish } from '@oceanprotocol/react'
import { DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata'

export function Trade() {
  const { ocean, accountId } = useOcean()
  const {
    createPricing,
    buyDT,
    sellDT,
    mint,
    pricingStep,
    pricingStepText,
    pricingIsLoading,
    pricingError
  } = usePricing()
  const [datatoken, setDatatoken] = useState<string | undefined>()
  const handleBuy = async () => {
    const tx = await buyDT(datatoken, '1')
    console.log(tx)
  }
  const handleSell = async () => {
    const tx = await buyDT(datatoken, '1')
    console.log(tx)
  }
  const handleChange = (e: any) => {
    setDatatoken(e.target.value)
  }
  const handlePostForSale = async () => {
    if (datatoken) {
      const priceOptions = {
        price: 7,
        dtAmount: 10,
        type: 'fixed',
        weightOnDataToken: '',
        swapFee: ''
      }
      const tx = await createPricing(datatoken, priceOptions)
      console.log(tx)
    }
  }
  return (
    <>
      <div>Trade Datatoken</div>
      <div>
        Datatoken <input onChange={handleChange}></input>
      </div>
      <div>
        <button onClick={handlePostForSale}>Post for sale</button>
      </div>
      <div>
        <button onClick={handleBuy}>Buy 1 DT</button>
      </div>
      <div>
        <button onClick={handleSell}>Sell 1 DT</button>
      </div>
      <div>
        IsLoading: {pricingIsLoading.toString()} || Status: {pricingStepText}
      </div>
    </>
  )
}
