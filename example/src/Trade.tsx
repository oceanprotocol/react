import React from 'react'
import { useOcean, usePricing } from '@oceanprotocol/react'
// import { useOcean, usePublish } from '@oceanprotocol/react'
import { DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { Metadata } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Metadata'

export function Trade() {
  const { ocean, accountId } = useOcean()
  const { createPricing, buyDT, sellDT, pricingStep, pricingStepText, isLoading: pricingIsLoading, pricingError} = usePricing()
  const [did, setDid] = useState<string | undefined>()
  const handleBuy = async () => {
    if (!did) { console.error("No DID"); return}
    const ddo = await ocean.assets.resolve(did)
    if(ddo){
      const tx = await buyDT(ddo.dataToken,'1')
      console.log(tx)
    }
    else{
      console.error("Publish the asset first and create a pricing")
    }
  }
  const handleSell = async () => {
    if (!did) { console.error("No DID"); return}
    const ddo = await ocean.assets.resolve(did)
    if(ddo){
      const tx = await buyDT(ddo.dataToken,'1')
      console.log(tx)
    }
    else{
      console.error("Publish the asset first and create a pricing")
    }
  }
  const handleChange = (e: any) => {
    setDid(e.target.value)
  }
  return (
    <>
      <div>Trade Datatoken</div>
      <div>
        DID <input onChange={handleChange}></input>
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
