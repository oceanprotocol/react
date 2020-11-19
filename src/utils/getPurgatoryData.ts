import axios from 'axios'
const purgatoryUrl = 'https://market-purgatory.oceanprotocol.com/api/'

export interface AccountPurgatoryData {
  address: string
  reason: string
}

export async function getAccountPurgatoryData(
  address: string
): Promise<AccountPurgatoryData> {
  const response = await axios(`${purgatoryUrl}account?address=${address}`)
  const responseJson = await response.data[0]
  return { address: responseJson?.address, reason: responseJson?.reason }
}
