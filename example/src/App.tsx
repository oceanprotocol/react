import React, { useEffect } from 'react'
import './App.css'
import { OceanProvider } from '@oceanprotocol/react'
import { Wallet } from './Wallet'
import { Publish } from './Publish'
import { ConfigHelper } from '@oceanprotocol/lib'
import { NetworkMonitor } from './NetworkMonitor'
import { AllDdos } from './AllDdos'
import { ConsumeDdo } from './ConsumeDdo'

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
