const { Big } = require('../../utils')

const TRANSACTION_TYPES = Object.freeze({
  RELAYER_FUNDING: 'RELAYER_FUNDING',
  BROKER_FUNDING: 'BROKER_FUNDING',
  WALLET_DEPOSIT: 'WALLET_DEPOSIT'
})

/**
 * Returns a summary of a wallet
 *
 * @param {GrpcUnaryMethod~request} request - request object
 * @param {Logger} request.logger
 * @param {Object<string>} request.params
 * @param {Array<Engine>} request.engines
 * @param {Object} responses
 * @param {Function} responses.EmptyResponse
 * @returns {EmptyResponse}
 */
async function walletSummary ({ logger, params, engines }, { WalletSummaryResponse }) {
  const { symbol } = params
  const engine = engines.get(symbol)

  if (!engine) {
    logger.error(`Could not find engine: ${symbol}`)
    throw new Error(`Unable to generate address for symbol: ${symbol}`)
  }

  const transactions = await engine.getChainTransactions()
  engine.client.getTransactions({}, (err, { transactions }) => {
    if (err) throw err
    transactions.forEach(t => {
      console.log(t)
      console.log(t.destAddresses)
    })
  })

  console.log(transactions)

  const formattedTransactions = transactions.map(({ amount, transaction, blockNumber, timestamp, fees }) => {
    let determinedType = ''

    if (Big(amount).lt(0)) {
      determinedType = TRANSACTION_TYPES.RELAYER_FUNDING
    } else if (Big(amount).gt(0) && Big(fees).gt(0)) {
      determinedType = TRANSACTION_TYPES.BROKER_FUNDING
    } else {
      determinedType = TRANSACTION_TYPES.WALLET_DEPOSIT
    }

    return {
      // TODO: need to see if there is a way to differentiate between withdrawl and adding
      // funds to the actual wallet
      type: determinedType,
      amount: Big(amount).div(engine.quantumsPerCommon).toString(),
      transaction,
      blockNumber,
      timestamp,
      fees: Big(fees).div(engine.quantumsPerCommon).toString()
    }
  })

  console.log(formattedTransactions)

  return new WalletSummaryResponse(formattedTransactions)
}

module.exports = walletSummary
