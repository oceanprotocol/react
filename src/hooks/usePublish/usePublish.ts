import { useEffect } from 'react'
import { DDO, Metadata, DataTokens, Logger } from '@oceanprotocol/lib'
import { useOcean, } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { Service } from '@oceanprotocol/lib/dist/node/ddo/interfaces/Service'

interface UsePublish {

    publish: (asset: Metadata, price?: number) => Promise<DDO>

}

const factory = require('@oceanprotocol/contracts/artifacts/development/Factory.json')
const datatokensTemplate = require('@oceanprotocol/contracts/artifacts/development/DataTokenTemplate.json')

function usePublish(): UsePublish {
    const { web3, ocean, status, account,accountId, config } = useOcean()

    async function publish(asset: Metadata, price: number = 1): Promise<DDO> {
        if (status !== ProviderStatus.CONNECTED) return

        Logger.log('datatokens params ',factory.abi,datatokensTemplate.abi,ocean.datatokens.factoryAddress)
        const datatoken = new DataTokens(
            ocean.datatokens.factoryAddress,
            factory.abi,
            datatokensTemplate.abi,
            web3
        )     
        
        Logger.log('datatoken created', datatoken)
        const data = { t: 1, url: config.metadataStoreUri }
        const blob = JSON.stringify(data)
        const tokenAddress = await datatoken.create(blob, accountId)
        Logger.log('tokenAddress created', tokenAddress)
        const publishedDate = new Date(Date.now()).toISOString().split('.')[0] + 'Z'
        const timeout = 0
        let services: Service[] = []
        switch (asset.main.type) {
            case 'dataset': {
                const accessService = await ocean.assets.createAccessServiceAttributes(
                    account,
                    price,
                    publishedDate,
                    timeout
                )
                Logger.log('access service created', accessService)
                services = [accessService]
                break;
            }
            case 'algorithm': {

                break;
            }
        }


        const ddo = await ocean.assets.create(asset, account, services, tokenAddress)

        return ddo
    }


    useEffect(() => {
        async function init(): Promise<void> {

        }
        init()
    }, [])

    return {
        publish
    }
}

export { usePublish, UsePublish }
export default usePublish
