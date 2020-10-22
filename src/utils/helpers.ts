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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
