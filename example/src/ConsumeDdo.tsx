import React from 'react'
import {
  useOcean,
  useConsume,
  useCompute,
  computeOptions
} from '@oceanprotocol/react'
import { useState } from 'react'
import { useEffect } from 'react'

export function ConsumeDdo() {
  const { ocean } = useOcean()
  const { consumeStepText, consume, consumeError } = useConsume()
  const { compute, computeStepText } = useCompute()
  const [did, setDid] = useState<string | undefined>()
  useEffect(() => {
    async function init() {}
    init()
  }, [ocean])

  const consumeDid = async () => {
    if (did === undefined) return
    const ddo = await ocean.assets.resolve(did)

    await consume(did, ddo.dataToken, 'access')
  }

  const computeDid = async () => {
    if (did === undefined) return
    const ddo = await ocean.assets.resolve(did)
    console.log(ddo)
    console.log('ocean dt', ocean.datatokens)

    const computeService = ddo.findServiceByType('compute')
    console.log('ddo compute service', computeService)
    const serv = ddo.findServiceById(computeService.index)

    console.log('ddo compute service resolved', serv)
    await compute(
      did,
      computeService,
      ddo.dataToken,
      "console.log('test')",
      computeOptions[0].value
    )
  }
  const handleChange = (e: any) => {
    setDid(e.target.value)
  }
  return (
    <>
      <div>Consume</div>
      <div>
        DID <input onChange={handleChange}></input>
      </div>
      <div>
        <button onClick={consumeDid}>Consume did</button>
        <button onClick={computeDid}>Compute</button>
      </div>
      <div>
        {consumeStepText}
        {computeStepText}
      </div>
      <div>{consumeError}</div>
    </>
  )
}
