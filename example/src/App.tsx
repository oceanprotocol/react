import React, { useEffect } from 'react'
import './App.css'
import { OceanProvider } from '@oceanprotocol/react'
import { Wallet } from './Wallet'
import { Publish } from './Publish'
// import { Config } from '@oceanprotocol/lib'
import { ConfigHelper } from '@oceanprotocol/lib'
import { AllDdos } from './AllDdos'
import { ConsumeDdo } from './ConsumeDdo'
import { NetworkMonitor } from './NetworkMonitor'

// factory Address needs to be updated each time you deploy the contract on local network
// const config: Config = {
//   metadataStoreUri: 'http://aquarius:5000',
//   providerUri: 'http://localhost:8030',
//   nodeUri: `http://localhost:8545`,
//   factoryAddress: '0x2fC1fd21cb222Dc180Ef817dE4c426fd9230b5A5'
// }

const configRinkeby = new ConfigHelper().getConfig('rinkeby')

const providerOptions = {}

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions
}

function App() {
  const init = async () => {}

  useEffect(() => {
    init()
  }, [])

  return (
    <OceanProvider initialConfig={configRinkeby} web3ModalOpts={web3ModalOpts}>
      <div className="container">
        <NetworkMonitor />
        <div>
          <Wallet />
        </div>
        <div>
          <AllDdos />
        </div>

        <div>
          <Publish />
        </div>

        <div>
          <ConsumeDdo />
        </div>
      </div>
    </OceanProvider>
  )
}

export default App
