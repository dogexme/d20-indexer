const bitcore = require('bitcore-lib-doge')
const { Script } = bitcore
const db = require('./tbdbstart')
const workerpool = require('workerpool')
const logger = require('./logger')
const rpcClient = require('./rpcUtil')
const MaxRetriesReachedError = require('./MaxRetriesReachedError')
const verify = require('./verify')

workerpool.worker({
  getTxInfo: async function (tick, txid, block, index) {
    let flag = false
    const txnInfo = []
    txnInfo.push(block)
    txnInfo.push(index)
    txnInfo.push(txid)
    try {
      const rawTransaction = await rpcClient.getRawTransaction(txid)

      if (rawTransaction.data.result.vin[0].hasOwnProperty('scriptSig')) {
        let info = await extract(rawTransaction.data.result.vin)
        let infoObj = null
        try { infoObj = JSON.parse(info.toString()) } catch (error) { }
        if (infoObj) {
          const jsonstr = JSON.stringify(infoObj)
          txnInfo.push(jsonstr)
          if (infoObj.op === `deploy` &&
            verify.isValidDeployJsonStructure(info.toString(), tick)) {
            const result = await db.selectRecord(infoObj.tick.toLowerCase())
            if (result.length === 0) {
              const address = rawTransaction.data.result.vout[0].scriptPubKey.addresses
              txnInfo.push(address[0])
              txnInfo.push(``)
              txnInfo.push(`deploy`)
              flag = true
            }
          }

          if (
            infoObj.op === `mint` &&
            verify.isValidMintJsonStructure(info.toString(), tick)
          ) {
            const result = await db.selectRecord(infoObj.tick.toLowerCase())
            if (
              (result.length > 0 && result[0].mint_over === 0) || result.length === 0) {
              const address = rawTransaction.data.result.vout[0].scriptPubKey.addresses
              const txnid = rawTransaction.data.result.vin[0].txid
              txnInfo.push(address[0])
              txnInfo.push(txnid)
              txnInfo.push(`mint`)
              flag = true
            }
          }

          if (
            infoObj.op === `transfer` &&
            verify.isValidTransferJsonStructure(info.toString(), tick)
          ) {
            const address = rawTransaction.data.result.vout[0].scriptPubKey.addresses
            const txnid = rawTransaction.data.result.vin[0].txid
            const mintfeeaddress = rpcClient.decodemintaddress(rawTransaction)
            if (address[0] != mintfeeaddress) return

            txnInfo.push(address[0])
            txnInfo.push(txnid)
            txnInfo.push(`mint_transfer`)
            flag = true
          }
        } else {
          if (rawTransaction.data.result.vin[0].vout === 0) {
            txnInfo.push(``)
            const address = rawTransaction.data.result.vout[0].scriptPubKey.addresses
            txnInfo.push(address[0])

            const pretxnid = rawTransaction.data.result.vin[0].txid
            const preRawTransaction =
              await await rpcClient.getRawTransaction(pretxnid)
            const preadrlist = preRawTransaction.data.result.vout[0].scriptPubKey.addresses || []
            const mintfeeaddress = rpcClient.decodemintaddress(preRawTransaction)
            if (preadrlist[0] != mintfeeaddress) return

            if (
              preRawTransaction.data.result.vin[0].hasOwnProperty('scriptSig')
            ) {
              let preinfo = await extract(preRawTransaction.data.result.vin)
              if (preinfo.toString() != ``) {
                let preinfoObj = JSON.parse(preinfo.toString())
                if (
                  preinfoObj.op === `transfer` &&
                  verify.isValidTransferJsonStructure(preinfo.toString(), tick)
                ) {
                  txnInfo.push(pretxnid)
                  txnInfo.push(`transfer`)
                  flag = true
                }
              }
            }
          }
        }
      }
      if (flag) {
        db.insertTxnRecord(tick, txnInfo)
      }
    } catch (error) {
      if (error instanceof MaxRetriesReachedError) {
        throw error
      } else if (!error instanceof TypeError) {
        console.log(error)
        logger.error(`Error: ${error}`)
        logger.error(`txid: ${txid}`)
      }
    }
  },
})

async function extract(transaction) {
  try {
    if (transaction && transaction[0].scriptSig.hex) {
      let script = Script.fromHex(transaction[0].scriptSig.hex)
      let chunks = script.chunks

      let prefix = chunks.shift().buf.toString('utf8')
      if (prefix != 'ord') {
        return ``
      }

      let pieces = chunkToNumber(chunks.shift())
      let contentType = chunks.shift().buf.toString('utf8')
      let data = Buffer.alloc(0)
      let remaining = pieces

      while (remaining && chunks.length) {
        let n = chunkToNumber(chunks.shift())

        if (n !== remaining - 1) {
          throw new Error(`error data format`)
        }

        data = Buffer.concat([data, chunks.shift().buf])
        remaining -= 1
      }
      return data
    } else {
      return ``
    }
  } catch (error) { }
  return ``
}

function chunkToNumber(chunk) {
  if (chunk.opcodenum == 0) return 0
  if (chunk.opcodenum == 1) return chunk.buf[0]
  if (chunk.opcodenum == 2) return chunk.buf[1] * 255 + chunk.buf[0]
  if (chunk.opcodenum > 80 && chunk.opcodenum <= 96) return chunk.opcodenum - 80
  return undefined
}
