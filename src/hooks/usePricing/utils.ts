export function getCreatePricingPoolFeedback(
  dtSymbol: string
): { [key: number]: string } {
  return {
    99: `Minting ${dtSymbol} ...`,
    0: 'Creating pool ...',
    1: `Approving ${dtSymbol} ...`,
    2: 'Approving OCEAN ...',
    3: 'Setup pool ...',
    4: 'Pool created.'
  }
}

export function getCreatePricingExchangeFeedback(
  dtSymbol: string
): { [key: number]: string } {
  return {
    99: `Minting ${dtSymbol} ...`,
    0: 'Creating exchange ...',
    1: `Approving ${dtSymbol} ...`,
    2: 'Fixed exchange created.'
  }
}

export function getBuyDTFeedback(dtSymbol: string): { [key: number]: string } {
  return {
    1: '1/3 Approving OCEAN ...',
    2: `2/3 Buying ${dtSymbol} ...`,
    3: `3/3 ${dtSymbol} bought.`
  }
}

export function getSellDTFeedback(dtSymbol: string): { [key: number]: string } {
  return {
    1: '1/3 Approving OCEAN ...',
    2: `2/3 Selling ${dtSymbol} ...`,
    3: `3/3 ${dtSymbol} sold.`
  }
}
