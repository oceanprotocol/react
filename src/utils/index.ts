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

export function isDDO(toBeDetermined): toBeDetermined is DDO {
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
  0: '1/6 Creating datatoken ...',
  2: '2/6 Encrypting files ...',
  4: '3/6 Generating proof ...',
  6: '4/6 Storing ddo ...',
  7: '5/6 Minting tokens ...',
  8: '6/6 Asset published succesfully'
}

export * from './web3'
