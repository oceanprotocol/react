import { Ocean, Config, Account, Logger } from '@oceanprotocol/squid'
import Balance from '@oceanprotocol/squid/dist/node/models/Balance'
import Web3 from 'web3'

export async function connectOcean(
  web3: Web3,
  config: Config
): Promise<{
  ocean: Ocean
  account: Account
  accountId: string
  balance: Balance
}> {
  Logger.debug('Connecting to Ocean...')
  const ocean = await Ocean.getInstance({
    web3Provider: web3.currentProvider,
    ...config
  })
  Logger.debug('Ocean instance ready.')

  const oceanAccounts = await ocean.accounts.list()
  const account = oceanAccounts[0]
  const accountId = account.getId()
  const balance = await account.getBalance()

  return { ocean, account, accountId, balance }
}
