import Web3 from 'web3'
import { Account } from '@oceanprotocol/lib'
import { Balance } from '../providers'

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => {
      reader.abort()
      reject(new DOMException('Problem parsing input file.'))
    }
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsText(file)
  })
}

export const feedback: { [key in number]: string } = {
  99: 'Decrypting file URL...',
  0: '1/3 Ordering asset...',
  1: '1/3 Transfering data token.',
  2: '2/3 Payment confirmed. Requesting access...'
}

export const publishFeedback: { [key in number]: string } = {
  0: '1/4 Creating datatoken ...',
  1: '2/4 Minting tokens ...',
  3: '3/4 Publishing asset ...',
  4: '4/4 Asset published succesfully'
}

export async function getAccountId(web3: Web3): Promise<string> {
  const accounts = await web3.eth.getAccounts()
  return accounts[0]
}

export async function getBalance(account: Account): Promise<Balance> {
  const eth = await account.getEtherBalance()
  const ocean = await account.getOceanBalance()

  return { eth, ocean }
}
