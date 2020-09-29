export interface PriceOptions {
  price: number
  tokensToMint: number
  type: 'fixed' | 'dynamic' | string
  weightOnDataToken: string
  swapFee: string
}
