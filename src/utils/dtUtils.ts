import { Logger, Ocean, Account, Config } from '@oceanprotocol/lib'
import { Decimal } from 'decimal.js'
import Pool from '../hooks/useMetadata/Pool'
import BestPrice from '../hooks/useMetadata/BestPrice'
import Web3 from 'web3'

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

  if (tokenPools === undefined || tokenPools.length === 0) {
    return {
      address: '',
      price: ''
    }
  }
  let cheapestPoolAddress = tokenPools[0]
  let cheapestPoolPrice = new Decimal(999999999999)

  if (tokenPools) {
    for (let i = 0; i < tokenPools.length; i++) {
      const poolPrice = await ocean.pool.getOceanNeeded(
        accountId,
        tokenPools[i],
        '1'
      )
      const decimalPoolPrice = new Decimal(poolPrice)

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
  dataTokenAddress: string,
  accountId: string
): Promise<BestPrice | undefined> {
  const cheapestPool = await getCheapestPool(ocean, accountId, dataTokenAddress)
  const cheapestExchange = await getCheapestExchange(ocean, dataTokenAddress)
  Decimal.set({ precision: 5 })

  const cheapestPoolPrice = new Decimal(
    cheapestPool.price !== '' ? cheapestPool.price : 999999999999
  )
  const cheapestExchangePrice = new Decimal(
    cheapestExchange.price !== '' ? cheapestExchange.price : 999999999999
  )

  if (cheapestPoolPrice < cheapestExchangePrice) {
    return {
      type: 'pool',
      address: cheapestPool.address,
      value: cheapestPool.price
    } as BestPrice
  } else {
    return {
      type: 'exchange',
      address: cheapestExchange.address,
      value: cheapestExchange.price
    } as BestPrice
  }
}
export async function getCheapestExchange(
  ocean: Ocean,
  dataTokenAddress: string
) {
  if (!ocean || !dataTokenAddress) return
  try {
    const tokenExchanges = await ocean.fixedRateExchange.searchforDT(
      dataTokenAddress,
      '1'
    )

    if (tokenExchanges === undefined || tokenExchanges.length === 0) {
      return {
        address: '',
        price: ''
      }
    }
    let cheapestExchangeAddress = tokenExchanges[0].exchangeID
    let cheapestExchangePrice = new Decimal(tokenExchanges[0].fixedRate)

    for (let i = 0; i < tokenExchanges.length; i++) {
      const decimalExchangePrice = new Decimal(
        Web3.utils.fromWei(tokenExchanges[i].fixedRate)
      )

      if (decimalExchangePrice < cheapestExchangePrice) {
        cheapestExchangePrice = decimalExchangePrice
        cheapestExchangeAddress = tokenExchanges[i].exchangeID
      }
    }

    return {
      address: cheapestExchangeAddress,
      price: cheapestExchangePrice.toString()
    }
  } catch (err) {
    Logger.log(err)
    return {
      address: '',
      price: ''
    }
  }
}

export async function checkAndBuyDT(
  ocean: Ocean,
  dataTokenAddress: string,
  account: Account,
  config: Config
) {
  const userOwnedTokens = await ocean.accounts.getTokenBalance(
    dataTokenAddress,
    account
  )
  Logger.log(`User has ${userOwnedTokens} tokens`)
  if (userOwnedTokens === '0') {
    const bestPrice = await getBestDataTokenPrice(
      ocean,
      dataTokenAddress,
      account.getId()
    )

    switch (bestPrice.type) {
      case 'pool': {
        const price = new Decimal(bestPrice.value).times(1.05).toString()
        const maxPrice = new Decimal(bestPrice.value).times(2).toString()
        Logger.log('Buying token from pool', bestPrice, account.getId(), price)
        const buyResponse = await ocean.pool.buyDT(
          account.getId(),
          bestPrice.address,
          '1',
          price,
          maxPrice
        )
        Logger.log('DT buy response', buyResponse)
        return buyResponse
      }
      case 'exchange': {
        Logger.log('Buying token from exchange', bestPrice, account.getId())
        await ocean.datatokens.approve(
          config.oceanTokenAddress,
          config.fixedRateExchangeAddress,
          bestPrice.value,
          account.getId()
        )
        const exchange = await ocean.fixedRateExchange.buyDT(
          bestPrice.address,
          '1',
          account.getId()
        )
        Logger.log('DT exchange buy response', exchange)
        return exchange
      }
    }
  }
}
