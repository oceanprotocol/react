export interface PriceOptions {
  price: number
  dtAmount: number
  oceanAmount: number
  type: 'fixed' | 'dynamic' | string
  weightOnDataToken: string
  swapFee: string
}
