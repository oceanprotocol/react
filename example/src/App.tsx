import React, { useEffect } from 'react'
import './App.css'
import { OceanProvider } from '@oceanprotocol/react'
import { Wallet } from './Wallet'
import { Publish } from './Publish'
import { Config, ConfigHelper } from '@oceanprotocol/lib'
import { AllDdos } from './AllDdos'
import { ConsumeDdo } from './ConsumeDdo'

function App() {
  // factory Address needs to be updated each time you deploy the contract on local network
  const config = {
    metadataStoreUri: 'http://aquarius:5000',
    providerUri: 'http://localhost:8030',
    nodeUri: `http://localhost:8545`,
    factoryAddress: '0x2fC1fd21cb222Dc180Ef817dE4c426fd9230b5A5'
  } as Config

  // const configRinkeby = {
  //   metadataStoreUri: 'https://aquarius.rinkeby.v3.dev-ocean.com',
  //   providerUri: 'https://provider.rinkeby.v3.dev-ocean.com',
  //   nodeUri: `https://rinkeby.infura.io/a983b53583044593956054de049922fd`,
  //   factoryAddress: '0xcDfEe5D80041224cDCe9AE2334E85B3236385EA3',
  //   oceanTokenAddress: '0x8967BCF84170c91B0d24D4302C2376283b0B3a07',
  // } as Config

  const configRinkeby = new ConfigHelper().getConfig('rinkeby')
  const init = async () => {}
  useEffect(() => {
    init()
  }, [])

  return (
    <div className="app">
      <OceanProvider config={configRinkeby}>
        <div className="container">
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
    </div>
  )
}

export default App
