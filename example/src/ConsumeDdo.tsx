import React from 'react'
import { useOcean, usePublish, useConsume } from '@oceanprotocol/react'
import { Metadata, DDO } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useEffect } from 'react'

export function ConsumeDdo() {
  const { accountId, ocean } = useOcean()
  const { consumeStepText, consume, consumeError } = useConsume()
  const [did, setDid] = useState<string | undefined>()
  useEffect(() => {
    async function init() {}
    init()
  }, [ocean])

  const consumeDid = async () => {
    if (did === undefined) return

    await consume(did, 'access')
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
      </div>
      <div>{consumeStepText}</div>
      <div>{consumeError}</div>
    </>
  )
}
