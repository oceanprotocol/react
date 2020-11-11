import { PurgatoryData } from '@oceanprotocol/lib'
const purgatoryUrl = 'https://market-purgatory.oceanprotocol.com/api/asset'

export default async function getAssetData(
  did: string
): Promise<PurgatoryData> {
  const response = await fetch(`${purgatoryUrl}?did=${did}`)
  const responseJson = await response.json()
  return { did: responseJson.did, reason: responseJson.reason }
}
