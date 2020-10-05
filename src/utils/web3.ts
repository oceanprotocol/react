import Web3 from 'web3'
import { Account } from '@oceanprotocol/lib'
import { Balance } from 'providers'

export async function getAccountId(web3: Web3): Promise<string> {
  const accounts = await web3.eth.getAccounts()
  return accounts[0]
}

export async function getBalance(account: Account): Promise<Balance> {
  const eth = await account.getEtherBalance()
  const ocean = await account.getOceanBalance()

  return { eth, ocean }
}
