import { useState } from 'react'
import { Logger, DDO, ComputeJob } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import {
  SearchQuery,
  Aquarius,
  QueryResult
} from '@oceanprotocol/squid/dist/node/aquarius/Aquarius'
import { ComputeItem } from './ComputeItem'

// TODO searchText,
interface UseSearch {
  searchWithQuery: (query: SearchQuery) => Promise<QueryResult>
  getPublishedList: (page: number, offset: number) => Promise<QueryResult>
  getConsumedList: () => Promise<DDO[] | undefined>
  getComputeItems: () => Promise<ComputeItem[] | undefined>
  searchError?: string
}

function useSearch(): UseSearch {
  // should we call the useOcean hook in useSearch or in each function?
  const { ocean, account, config, accountId } = useOcean()
  const [searchError, setSearchError] = useState<string | undefined>()

  async function searchWithQuery(query: SearchQuery): Promise<QueryResult> {
    if (!ocean || !account) return

    setSearchError(undefined)

    try {
      const aquarius = new Aquarius(config.aquariusUri as string, Logger)
      return await aquarius.queryMetadata(query)
    } catch (error) {
      setSearchError(error.message)
    }
  }

  async function getPublishedList(
    page: number,
    offset: number
  ): Promise<QueryResult> {
    if (!ocean || !account) return

    setSearchError(undefined)

    try {
      const query = {
        page,
        offset,
        query: {
          'publicKey.owner': [accountId]
        },
        sort: {
          created: -1
        }
      } as SearchQuery

      return await searchWithQuery(query)
    } catch (error) {
      setSearchError(error.message)
    }
  }

  async function getConsumedList(): Promise<DDO[] | undefined> {
    const consumed = await ocean.assets.consumerAssets(accountId)
    const consumedItems = await Promise.all(
      consumed.map(async (did) => {
        const ddo = await ocean.assets.resolve(did)
        if (ddo) {
          // Since we are getting assets from chain there might be
          // assets from other marketplaces. So return only those assets
          // whose serviceEndpoint contains the configured Aquarius URI.
          const { serviceEndpoint } = ddo.findServiceByType('metadata')
          if (serviceEndpoint?.includes(config.aquariusUri)) return ddo
        }
      })
    )
    const filteredConsumedItems = consumedItems.filter(
      (value) => typeof value !== 'undefined'
    )
    return filteredConsumedItems
  }

  async function getComputeItems(): Promise<ComputeItem[] | undefined> {
    if (!ocean || !account) return
    const jobList = await ocean.compute.status(account)
    const computeItems = await Promise.all(
      jobList.map(async (job) => {
        if (!job) return
        const { did } = await ocean.keeper.agreementStoreManager.getAgreement(
          job.agreementId
        )

        const ddo = await ocean.assets.resolve(did)

        if (ddo) {
          // Since we are getting assets from chain there might be
          // assets from other marketplaces. So return only those assets
          // whose serviceEndpoint contains the configured Aquarius URI.
          const { serviceEndpoint } = ddo.findServiceByType('metadata')
          if (serviceEndpoint?.includes(config.aquariusUri)) {
            return { job, ddo }
          }
        }
      })
    )
    const filteredComputeItems = computeItems.filter(
      (value) => typeof value.ddo !== 'undefined'
    )
    return filteredComputeItems
  }

  return {
    searchWithQuery,
    getPublishedList,
    getConsumedList,
    getComputeItems,
    searchError
  }
}

export { useSearch, UseSearch }
export default useSearch
