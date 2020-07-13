import React, { useEffect } from 'react';
import './App.css';
import { OceanProvider } from '@oceanprotocol/react'
import { LogLevel } from '@oceanprotocol/lib/dist/node/utils/Logger';
import { Wallet } from './Wallet';
import { Publish } from './Publish';
import { Config } from '@oceanprotocol/lib';

function App() {

  // factory Address needs to be updated each time you deploy the contract on local network
  const config = {
    metadataStoreUri: 'http://aquarius:5000',
    providerUri: 'http://localhost:8030',
    nodeUri: `http://localhost:8545`,
    factoryAddress: '0x2fC1fd21cb222Dc180Ef817dE4c426fd9230b5A5'
  } as Config
  const init = async () => {


  }
  useEffect(() => {
    init()
  }, [])


  return (
    <div className="app">
      <OceanProvider config={config}>
        <div className="container">
          <div><Wallet /></div>

          <div><Publish /></div>


          <div>comp2</div>

        </div>
      </OceanProvider>

    </div>
  );
}

export default App;
