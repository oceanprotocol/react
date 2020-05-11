import { useState } from 'react'
import { Logger } from '@oceanprotocol/squid'
import { useOcean } from '../../providers'
import {
  SearchQuery,
  Aquarius,
  QueryResult
} from '@oceanprotocol/squid/dist/node/aquarius/Aquarius'

// TODO searchText
interface UseSearch {
  searchWithQuery: (query: SearchQuery) => Promise<QueryResult>
  getPublishedList: (
    account: string,
    page: number,
    offset: number
  ) => Promise<QueryResult>
  searchError?: string
}

function useSearch(): UseSearch {
  const { ocean, account, config } = useOcean()
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
    account: string,
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
          'publicKey.owner': [account]
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

  return { searchWithQuery, getPublishedList, searchError }
}

export { useSearch, UseSearch }
export default useSearch
