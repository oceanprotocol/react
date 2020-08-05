import { Logger, Ocean, Account } from '@oceanprotocol/lib'
import { Decimal } from 'decimal.js'
export async function getCheapestPool(
  ocean: Ocean,
  accountId: string,
  dataTokenAddress: string
): Promise<{ poolAddress: string; poolPrice: string }> {
  const tokenPools = await ocean.pool.searchPoolforDT(
    accountId,
    dataTokenAddress
  )
  Logger.log('DT Pool found', tokenPools)
  if(tokenPools===undefined || tokenPools.length===0){
    return {
      poolAddress: '',
      poolPrice: '0'
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
      Logger.log('Pool price ', tokenPools[i], poolPrice)
      if (decimalPoolPrice < cheapestPoolPrice) {
        cheapestPoolPrice = decimalPoolPrice
        cheapestPoolAddress = tokenPools[i]
      }
    }
  }

  return {
    poolAddress: cheapestPoolAddress,
    poolPrice: cheapestPoolPrice.toString()
  }
}

export async function getBestDataTokenPrice(
  ocean: Ocean,
  accountId: string,
  dataTokenAddress: string
): Promise<string> {
  const bestPool = await getCheapestPool(ocean, accountId, dataTokenAddress)

  return bestPool.poolPrice
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
  let cheapestPool
  if (userOwnedTokens === '0') {
    cheapestPool = await getCheapestPool(
      ocean,
      account.getId(),
      dataTokenAddress
    )
    Decimal.set({ precision: 5 })
    const price = new Decimal(cheapestPool.poolPrice).times(1.05).toString()
    const maxPrice = new Decimal(cheapestPool.poolPrice).times(2).toString()
    Logger.log('Buying token', cheapestPool, account.getId(), price)
    const buyResponse = await ocean.pool.buyDT(
      account.getId(),
      cheapestPool.poolAddress,
      '1',
      price,
      maxPrice
    )
    Logger.log('DT buy response', buyResponse)
    return buyResponse
  }
}
