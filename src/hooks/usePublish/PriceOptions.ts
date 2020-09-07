export interface PriceOptions {
  price?: number
  tokensToMint: number
  type: 'simple' | 'advanced' | string
  weightOnDataToken: string
  liquidityProviderFee: string
}
