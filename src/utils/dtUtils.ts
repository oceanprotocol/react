import { Logger, Ocean, Account, Config, BestPrice } from '@oceanprotocol/lib'
import { TransactionReceipt } from 'web3-core'
import { Decimal } from 'decimal.js'
import Pool from 'hooks/useMetadata/Pool'
import Web3 from 'web3'

export async function getCheapestPool(
  ocean: Ocean,
  dataTokenAddress: string
): Promise<Pool | null> {
  if (!ocean || !dataTokenAddress) return null

  const tokenPools = await ocean.pool.searchPoolforDT(dataTokenAddress)

  if (tokenPools === undefined || tokenPools.length === 0) {
    return {
      address: '',
      price: 0
    }
  }
  let cheapestPoolAddress = tokenPools[0]
  let cheapestPoolPrice = new Decimal(999999999999)

  if (tokenPools) {
    for (let i = 0; i < tokenPools.length; i++) {
      const poolPrice = await ocean.pool.getOceanNeeded(tokenPools[i], '1')
      const decimalPoolPrice = new Decimal(poolPrice)

      if (decimalPoolPrice < cheapestPoolPrice) {
        cheapestPoolPrice = decimalPoolPrice
        cheapestPoolAddress = tokenPools[i]
      }
    }
  }

  const oceanReserve = await ocean.pool.getOceanReserve(cheapestPoolAddress)
  const dtReserve = await ocean.pool.getDTReserve(cheapestPoolAddress)

  return {
    address: cheapestPoolAddress,
    price: Number(cheapestPoolPrice),
    ocean: Number(oceanReserve),
    datatoken: Number(dtReserve)
  }
}

export async function getFirstPool(
  ocean: Ocean,
  dataTokenAddress: string
): Promise<Pool | null> {
  if (!ocean || !dataTokenAddress) return null

  const tokenPools = await ocean.pool.searchPoolforDT(dataTokenAddress)

  if (tokenPools === undefined || tokenPools.length === 0) {
    return {
      address: '',
      price: 0
    }
  }
  const firstPoolAddress = tokenPools[0]
  const firstPoolPrice = await ocean.pool.getOceanNeeded(firstPoolAddress, '1')
  const oceanReserve = await ocean.pool.getOceanReserve(firstPoolAddress)
  const dtReserve = await ocean.pool.getDTReserve(firstPoolAddress)

  return {
    address: firstPoolAddress,
    price: Number(firstPoolPrice),
    ocean: Number(oceanReserve),
    datatoken: Number(dtReserve)
  }
}

export async function getCheapestExchange(
  ocean: Ocean,
  dataTokenAddress: string
): Promise<Pool | undefined> {
  try {
    const tokenExchanges = await ocean.fixedRateExchange.searchforDT(
      dataTokenAddress,
      '1'
    )
    if (tokenExchanges === undefined || tokenExchanges.length === 0) {
      return {
        address: '',
        price: 0
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
      address: cheapestExchangeAddress || '',
      price: Number(cheapestExchangePrice)
    }
  } catch (err) {
    Logger.log(err)
    return {
      address: '',
      price: 0
    }
  }
}

export async function getBestDataTokenPrice(
  ocean: Ocean,
  dataTokenAddress: string
): Promise<BestPrice> {
  const cheapestPool = await getFirstPool(ocean, dataTokenAddress)
  const cheapestExchange = await getCheapestExchange(ocean, dataTokenAddress)
  Decimal.set({ precision: 5 })

  const cheapestPoolPrice = new Decimal(
    cheapestPool && cheapestPool.price !== 0 ? cheapestPool.price : 999999999999
  )
  const cheapestExchangePrice = new Decimal(
    cheapestExchange && cheapestExchange?.price !== 0
      ? cheapestExchange.price
      : 999999999999
  )

  if (cheapestPoolPrice < cheapestExchangePrice) {
    return {
      type: 'pool',
      address: cheapestPool?.address,
      value: cheapestPool?.price,
      ocean: cheapestPool?.ocean,
      datatoken: cheapestPool?.datatoken
    } as BestPrice
  } else {
    return {
      type: 'exchange',
      address: cheapestExchange?.address,
      value: Number(cheapestExchange?.price)
    } as BestPrice
  }
}
