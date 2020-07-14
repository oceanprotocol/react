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
