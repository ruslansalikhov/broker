const { Big } = require('../../utils')

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
async function walletSummary ({ logger, params, engines }, { EmptyResponse }) {
  const { symbol } = params
  const engine = engines.get(symbol)

  if (!engine) {
    logger.error(`Could not find engine: ${symbol}`)
    throw new Error(`Unable to generate address for symbol: ${symbol}`)
  }

  // {"transaction":"76754ef3b69b0ff8cec3fdd54ea5dd566a20bf9594d848370cfe75359394146a","amount":"200000000","blockNumber":646,"timestamp":null,"fees":"0"}
  const transactions = await engine.getChainTransactions()

  logger.info('stuff', { transactions })

  return new EmptyResponse({})
}

module.exports = walletSummary
