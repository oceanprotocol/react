import { DDO, DID } from '@oceanprotocol/lib'

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

export function isDDO(
  toBeDetermined: DID | string | DDO
): toBeDetermined is DDO {
  if ((toBeDetermined as DDO).id) {
    return true
  }
  return false
}

export const feedback: { [key in number]: string } = {
  99: 'Decrypting file URL...',
  0: '1/3 Looking for data token. Buying if none found...',
  1: '2/3 Transfering data token.',
  2: '3/3 Payment confirmed. Requesting access...'
}

export const publishFeedback: { [key in number]: string } = {
  0: '1/5 Creating datatoken ...',
  2: '2/5 Encrypting files ...',
  4: '3/5 Storing ddo ...',
  6: '4/5 Minting tokens ...',
  8: '5/5 Asset published succesfully'
}

export * from './web3'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
