import React, { useEffect, useState } from 'react'
import './App.css'
import { OceanProvider } from '@oceanprotocol/react'
import { Wallet } from './Wallet'
import { Publish } from './Publish'
import { ConfigHelper, Logger } from '@oceanprotocol/lib'
import { AllDdos } from './AllDdos'
import { ConsumeDdo } from './ConsumeDdo'
import { NetworkMonitor } from './NetworkMonitor'
import { LogLevel } from '@oceanprotocol/lib/dist/node/utils'

const configRinkeby = new ConfigHelper().getConfig('rinkeby')
const providerOptions = {}

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions
}

function App() {
  console.log(configRinkeby)
  Logger.setLevel(LogLevel.Verbose)
  const init = async () => {}

  useEffect(() => {
    init()
  }, [])

  const [did, setDid] = useState<string | undefined>()

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
