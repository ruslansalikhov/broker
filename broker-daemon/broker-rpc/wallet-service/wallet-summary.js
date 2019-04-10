const { Big } = require('../../utils')

const TRANSACTION_TYPES = Object.freeze({
  RELAYER_FUNDING: 'RELAYER_FUNDING',
  BROKER_FUNDING: 'BROKER_FUNDING'
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

  console.log(transactions)

  const formattedTransactions = transactions.map(({ amount, transaction, blockNumber, timestamp, fees }) => {
    return {
      // TODO: need to see if there is a way to differentiate between withdrawl and adding
      // funds to the actual wallet
      type: Big(amount).gt(0) ? TRANSACTION_TYPES.BROKER_FUNDING : TRANSACTION_TYPES.RELAYER_FUNDING,
      amount,
      transaction,
      blockNumber,
      timestamp,
      fees
    }
  })

  console.log(formattedTransactions)

  return new WalletSummaryResponse(formattedTransactions)
}

module.exports = walletSummary
