import { Logger, Ocean, Account } from '@oceanprotocol/lib'
import { Decimal } from 'decimal.js'
import Pool from '../hooks/useMetadata/Pool'

export async function getCheapestPool(
  ocean: Ocean,
  accountId: string,
  dataTokenAddress: string
): Promise<Pool> {
  if (!ocean || !accountId || !dataTokenAddress) return

  const tokenPools = await ocean.pool.searchPoolforDT(
    accountId,
    dataTokenAddress
  )
  // Logger.log('DT Pool found', tokenPools)
  if (tokenPools === undefined || tokenPools.length === 0) {
    return {
      address: '',
      price: ''
    }
  }
  let cheapestPoolAddress
  let cheapestPoolPrice = new Decimal(999999999999)

  if (tokenPools) {
    for (let i = 0; i < tokenPools.length; i++) {
      const poolPrice = await ocean.pool.getOceanNeeded(
        accountId,
        tokenPools[i],
        '1'
      )
      const decimalPoolPrice = new Decimal(poolPrice)
      Logger.log('Pool price ', tokenPools[i], decimalPoolPrice.toString())
      if (decimalPoolPrice < cheapestPoolPrice) {
        cheapestPoolPrice = decimalPoolPrice
        cheapestPoolAddress = tokenPools[i]
      }
    }
  }

  return {
    address: cheapestPoolAddress,
    price: cheapestPoolPrice.toString()
  }
}

export async function getBestDataTokenPrice(
  ocean: Ocean,
  accountId: string,
  dataTokenAddress: string
): Promise<string> {
  const bestPool = await getCheapestPool(ocean, accountId, dataTokenAddress)

  return bestPool.price
}
export async function getCheapestExchange(
  ocean: Ocean,
  dataTokenAddress: string
) {
  if (!ocean || !dataTokenAddress) return

  const tokenExchanges = await ocean.fixedRateExchange.searchforDT(
    dataTokenAddress,
    '1'
  )
  Logger.log('Exchanges found', tokenExchanges)
  if (tokenExchanges === undefined || tokenExchanges.length === 0) {
    return {
      address: '',
      price: ''
    }
  }
  let cheapestExchangeAddress
  let cheapestExchangePrice = new Decimal(999999999999)

  if (tokenExchanges) {
    for (let i = 0; i < tokenExchanges.length; i++) {
      const exchangePrice = tokenExchanges[i].fixedRate

      const decimalExchangePrice = new Decimal(exchangePrice)
      Logger.log(
        'Pool price ',
        tokenExchanges[i],
        decimalExchangePrice.toString()
      )
      if (decimalExchangePrice < cheapestExchangePrice) {
        cheapestExchangePrice = decimalExchangePrice
        cheapestExchangeAddress = tokenExchanges[i]
      }
    }
  }

  return {
    address: cheapestExchangeAddress,
    price: cheapestExchangePrice.toString()
  }
}

export async function checkAndBuyDT(
  ocean: Ocean,
  dataTokenAddress: string,
  account: Account
) {
  const userOwnedTokens = await ocean.accounts.getTokenBalance(
    dataTokenAddress,
    account
  )
  Logger.log(`User has ${userOwnedTokens} tokens`)
  if (userOwnedTokens === '0') {
    const cheapestPool = await getCheapestPool(
      ocean,
      account.getId(),
      dataTokenAddress
    )
    const cheapestExchange = await getCheapestExchange(ocean, dataTokenAddress)
    Decimal.set({ precision: 5 })
    const cheapestPoolPrice = new Decimal(cheapestPool.price)
    const cheapestExchangePrice = new Decimal(cheapestExchange.price)

    if (cheapestExchangePrice > cheapestPoolPrice) {
      const price = new Decimal(cheapestPool.price).times(1.05).toString()
      const maxPrice = new Decimal(cheapestPool.price).times(2).toString()
      Logger.log('Buying token', cheapestPool, account.getId(), price)
      const buyResponse = await ocean.pool.buyDT(
        account.getId(),
        cheapestPool.address,
        '1',
        price,
        maxPrice
      )
      Logger.log('DT buy response', buyResponse)
      return buyResponse
    } else {
      const exchange = await ocean.fixedRateExchange.buyDT(
        cheapestExchange.address,
        '1',
        account.getId()
      )
      return exchange
    }
  }
}
