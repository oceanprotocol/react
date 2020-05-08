# `useCompute`

The `OceanProvider` maintains a connection to the Ocean Protocol network in multiple steps:

1. On mount, connect to Aquarius instance right away so any asset metadata can be retrieved before, and independent of any Web3 connections.
2. Once Web3 becomes available, a connection to all Ocean Protocol network components is established.
3. Once Ocean becomes available, spits out some info about it.

Also provides a `useOcean` helper hook to access its context values from any component.

## Usage

```tsx
import React from 'react'
import {
  useWeb3,
  useOcean,
  useMetadata,
  useCompute,
  computeOptions,
  ComputeValue,
  readFileContent
} from '@oceanprotocol/react'

const did = 'did:op:0x000000000'

export default function MyComponent() {
  // Get web3 from built-in Web3Provider context
  const { web3 } = useWeb3()

  // Get Ocean instance from built-in OceanProvider context
  const { ocean, account } = useOcean()

  // Get metadata for this asset
  const { title, metadata } = useMetadata(did)


  // compute asset
  const { compute, computeStep } = useCompute()
  // raw code text
  const [algorithmRawCode, setAlgorithmRawCode] = useState('')
  const [computeContainer, setComputeContainer] = useState<ComputeValue>()
  async function handleCompute() {
    await consume(did,algorithmRawCode,computeContainer)
  }

  async function onChangeHandler(event){
    const fileText = await readFileContent(files[0])
    setAlgorithmRawCode(fileText)
  }
  async function handleSelectChange(event: any)  {
    const comType = event.target.value
    setComputeContainer(comType)
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>Price: {web3.utils.fromWei(metadata.main.price)}</p>

      <p>Your account: {account}</p>
      <label for="computeOptions">Select image to run the algorithm</label>
      <select id="computeOptions"  onChange={handleSelectChange}>
        {computeOptions.map((x) => (
            <option value={x.value}>{x.name}</option>
        )
        }
      </select>
      <input type="file" name="file" onChange={onChangeHandler}/>
      <button onClick={handleCompute}>
        {computeStep || 'Start compute job'}
      </button>
    </div>
  )
}
```
