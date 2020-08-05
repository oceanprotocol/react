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
  0: '1/3 Looking for data token. Buying if none found...',
  1: '2/3 Transfering data token.',
  2: '3/3 Payment confirmed. Requesting access...'
}

export const publishFeedback: { [key in number]: string } = {
  0: '1/4 Creating datatoken ...',
  1: '2/4 Minting tokens ...',
  3: '3/4 Publishing asset ...',
  4: '4/4 Asset published succesfully'
}

export * from './web3'
