import axios, { AxiosResponse } from 'axios'
import Web3 from 'web3'
import { DID } from '@oceanprotocol/squid'

export declare type RatingResponse = [string, number]
export declare type GetRatingResponse = {
  comment: string
  datePublished: string
  vote: number
}

export function gethash(message: string): string {
  let hex = ''
  for (let i = 0; i < message.length; i++) {
    hex += '' + message.charCodeAt(i).toString(16)
  }
  const hexMessage = '0x' + hex
  return hexMessage
}

export async function rateAsset({
  did,
  web3,
  value,
  configUrl
}: {
  did: DID | string
  web3: Web3
  value: number
  configUrl: string
}): Promise<RatingResponse | string> {
  try {
    const timestamp = Math.floor(+new Date() / 1000)
    const accounts = await web3.eth.getAccounts()
    const signature = await web3.eth.personal.sign(
      gethash(`${timestamp}`),
      accounts ? accounts[0] : '',
      ''
    )
    const ratingBody = {
      did,
      vote: value,
      comment: '',
      address: accounts[0],
      timestamp: timestamp,
      signature: signature
    }

    const response: AxiosResponse = await axios.post(configUrl, ratingBody)
    if (!response) return 'No Response'
    return response.data
  } catch (error) {
    console.error(error.message)
    return `Error: ${error.message}`
  }
}

export async function getAssetRating({
  did,
  account,
  configUrl
}: {
  did: DID | string
  account: string
  configUrl: string
}): Promise<GetRatingResponse | undefined> {
  try {
    if (!account) return

    const response = await axios.get(configUrl, {
      params: {
        did: did,
        address: account
      }
    })
    const votesLength = response.data.length

    if (votesLength > 0) {
      return response.data[votesLength - 1]
    }
  } catch (error) {
    console.error(error.message)
  }
}
