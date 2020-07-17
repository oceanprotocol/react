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
  0: '1/5 Creating datatoken ...',
  1: '2/5 Minting tokens ...',
  2: '3/5 Giving allowance to market to sell your tokens ...',
  3: '4/5 Publishing asset ...',
  4: '5/5 Asset published succesfully'
}
