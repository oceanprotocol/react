import { ICoreOptions } from 'web3modal/dist/helpers/types'

export async function getDefaultProviders(): Promise<Partial<ICoreOptions>> {
  return { cacheProvider: true }
}
