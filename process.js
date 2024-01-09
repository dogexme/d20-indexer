const db = require('./tbdbprocess')
const { tonumber, bnminus, bnadd } = require('./bn')
const logger = require('./logger')
const rpcClient = require('./rpcUtil')
const MaxRetriesReachedError = require('./MaxRetriesReachedError')
const configUtil = require('./configUtil')

async function process(txInfos, tick) {
  // 遍历交易数组
  for (let txInfo of txInfos) {
    console.log(`content: ${txInfo.content},id: ${txInfo.id}`)
    try {
      if (txInfo.content != ``) {
        let txFlag = 1
        await db.query('START TRANSACTION')
        let infoObj = JSON.parse(txInfo.content)
        if (infoObj.op === `deploy`) {
          let record = []
          record.push(infoObj.tick)
          let address = txInfo.address
          record.push(address)
          record.push(txInfo.date)
          record.push(infoObj.max)
          record.push(infoObj.lim)

          let result = await db.selectRecord(infoObj.tick)
          if (result.length === 0) {
            await db.insertRecord(infoObj.tick, record)
          }
        }

        if (infoObj.op === `mint`) {
          let address = txInfo.address
          let mintaddress = await rpcClient.getmintAddress(txInfo.txnid)
          if (mintaddress === address) {
            let result = await db.selectRecord(infoObj.tick)
            if (result.length > 0) {
              if (result[0].mint_over === 0) {
                if (
                  bnminus(result[0].max, result[0].mint_val) > 0 &&
                  tonumber(infoObj.amt) <= tonumber(result[0].lim) &&
                  bnadd(result[0].mint_val, infoObj.amt) <= tonumber(result[0].max)
                ) {
                  let mintAll = bnadd(result[0].mint_val, parseInt(infoObj.amt))
                  await db.updateRecord(infoObj.tick, mintAll, result[0].id)
                  let balance = await db.selectBalanceRecord(
                    infoObj.tick,
                    address
                  )

                  if (balance.length > 0) {
                    let ball = bnadd(balance[0].balance, infoObj.amt)
                    await db.updateBalanceRecord(
                      infoObj.tick,
                      ball,
                      balance[0].id,
                    )
                  } else {
                    let balRecord = []
                    balRecord.push(address)
                    balRecord.push(infoObj.tick)
                    balRecord.push(infoObj.amt)
                    await db.insertBalanceRecord(infoObj.tick, balRecord)
                  }
                } else {
                  //异常数据flag设置为2
                  txFlag = 2
                }
                if (
                  bnadd(result[0].mint_val, infoObj.amt) ===
                  tonumber(result[0].max) &&
                  tonumber(infoObj.amt) <= tonumber(result[0].lim)
                ) {
                  await db.updateDrcFlagRecord(infoObj.tick, result[0].id)
                }
              } else {
                //异常数据flag设置为2
                txFlag = 2
              }
            }
          } else {
            //异常数据flag设置为2
            txFlag = 2
          }
        }

        if (infoObj.op === `transfer`) {
          let address = txInfo.address
          let mintaddress = await rpcClient.getmintAddress(txInfo.txnid)
          if (mintaddress === address) {
            let balance = await db.selectBalanceRecord(infoObj.tick, address)
            //本身必须持有才能铸造转移铭文
            if (balance.length > 0) {
              let sunAmt = tonumber(balance[0].balance)

              if (tonumber(infoObj.amt) <= sunAmt) {
                let record = []
                record.push(address)
                record.push(infoObj.amt)
                record.push(txInfo.txnid)
                record.push(infoObj.tick.toLowerCase())
                await db.insertTransferRecord(infoObj.tick, record)
              }
            }
          }
        }

        await db.updateTxInfoFlag(infoObj.tick, txInfo.id, txFlag)
        await db.query('COMMIT')
      } else {
        //如果是普通交易，查询上一级的输入交易，从表里面查询是否已经有转移数据。
        let address = txInfo.address
        let txnid = txInfo.txnid_pre
        await transferTick(tick, address, txnid, txInfo.id, txInfo.txnid)
      }
    } catch (error) {
      console.log(`Error: ${error}`)
      await db.query('ROLLBACK')
      if (error instanceof MaxRetriesReachedError) {
        throw error
      } else {
        if (!error instanceof TypeError) {
          logger.error(`Error: ${error}`)
          logger.error(`txnid: ${txInfo.id}`)
          logger.error('Transaction rolled back.')
        }
      }
    }
  }
}

/**
 * 转移铭文处理
 *
 * @param {*} drcData
 * @param {*} transferData
 * @param {*} address
 * @param {*} txnid
 */
async function transferTick(tick, address, txnid, txnInfoId, curTxnid) {
  try {
    let transferInfo = await db.selectTransferRecordByTxnid(tick, txnid)

    let isNeedTxTransfer = false

    let txTrsRecord = []

    if (transferInfo.length > 0) {
      // Start the transaction
      await db.query('START TRANSACTION')
      let balance = await db.selectBalanceRecord(
        transferInfo[0].tick,
        transferInfo[0].address,
      )

      txTrsRecord.push(transferInfo[0].address)
      txTrsRecord.push(address)
      txTrsRecord.push(curTxnid)
      txTrsRecord.push(transferInfo[0].tick)
      txTrsRecord.push(transferInfo[0].amt)

      if (balance.length <= 0) {
        await db.query('COMMIT')
        return
      }

      //减去转移的铭文数量
      if (balance.length > 0) {
        let ball = bnminus(balance[0].balance, transferInfo[0].amt)
        if (ball >= 0) {
          await db.updateBalanceRecord(
            transferInfo[0].tick,
            ball,
            balance[0].id,
          )
        } else {
          await db.query('COMMIT')
          return
        }
      }

      //查询接受人的数据
      let balanceRecv = await db.selectBalanceRecord(
        transferInfo[0].tick,
        address,
      )

      if (balanceRecv.length > 0) {
        let ball = bnadd(balanceRecv[0].balance, transferInfo[0].amt)
        if (ball >= 0) {
          isNeedTxTransfer = true
          await db.updateBalanceRecord(
            transferInfo[0].tick,
            ball,
            balanceRecv[0].id,
          )
        } else {
          await db.query('COMMIT')
          return
        }
      } else {
        isNeedTxTransfer = true
        //不存在就新增
        let balRecord = []
        balRecord.push(address)
        balRecord.push(transferInfo[0].tick)
        balRecord.push(transferInfo[0].amt)
        await db.insertBalanceRecord(transferInfo[0].tick, balRecord)
      }

      if (isNeedTxTransfer) {
        db.insertTxTrsInfo(transferInfo[0].tick, txTrsRecord)
      }
      //最后更新flag 字段，标志已经转移成功
      await db.updateTransferFlag(transferInfo[0].tick, 1, transferInfo[0].id)
      await db.updateTxInfoFlag(tick, txnInfoId, 1)
      // Commit the transaction
      await db.query('COMMIT')
    } else {
      await db.updateTxInfoFlag(tick, txnInfoId, 1)
    }
  } catch (error) {
    await db.query('ROLLBACK')
    if (error instanceof MaxRetriesReachedError) {
      throw error
    } else {
      // If any error occurred, rollback the transaction
      logger.error('Error occurred:', error)
      logger.log('Transaction rolled back.')
    }
  }
}

async function processTxInfo() {
  const tick = configUtil.getConfigValue('ticks')
  while (true) {
    try {
      let indexBlocks = await db.selectIndexBlockInfo(tick)
      if (indexBlocks && indexBlocks.length > 0) {
        // 遍历交易数组
        for (let indexBlock of indexBlocks) {
          let txInfos = await db.selectTxInfo(tick, indexBlock.block)

          if (txInfos && txInfos.length > 0) {
            await process(txInfos, tick)
          }

          await db.updateIndexBlockInfoFlag(tick, indexBlock.id)
          //处理完一个区块的数据后修改数据库设置为已处理
          await db.updateCurrentBlock(tick, indexBlock.block)
        }
      } else {
        console.info(`Error: there is no data to process`)
        await new Promise((resolve) => setTimeout(resolve, 30000))
      }
    } catch (err) {
      console.error(`Error: ${err.message}`)
      // 如果发生错误，等待一段时间再重试
      await new Promise((resolve) => setTimeout(resolve, 30000))
    }
  }
}

processTxInfo()
