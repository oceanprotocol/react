export interface PriceOptions {
  price: number
  dtAmount: number
  type: 'fixed' | 'dynamic' | string
  weightOnDataToken: string
  swapFee: string
}
