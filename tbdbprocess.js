const mysql = require('mysql')
const util = require('util')
const logger = require('./logger') // 路径应根据实际情况进行调整
const MaxRetriesReachedError = require('./MaxRetriesReachedError')
const configUtil = require('./configUtil')

const MAX_RETRIES = configUtil.getConfigValue('MAX_RETRIES')

const host = configUtil.getConfigValue('data_host')
const user = configUtil.getConfigValue('data_user')
const password = configUtil.getConfigValue('data_password')
const database = configUtil.getConfigValue('database')

const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database,
})

const query = util.promisify(connection.query).bind(connection)

const insertRecord = async (tick, data) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (tick, owener_address, deploy_time, max, lim) 
      VALUES (?, ?, ?, ?, ?)`

      const tableName = `tbl_drc_info_${tick.toLowerCase()}`

      return await query(insertQuery, [tableName, ...data])
    } catch (error) {
      logger.error(`insertRecord Error: ${error} data:${JSON.stringify(data)}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const insertBalanceRecord = async (tick, data) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (address,tick, balance) 
      VALUES (?, ?, ?)`
      const tableName = `tbl_drc_balance_${tick.toLowerCase()}`
      return await query(insertQuery, [tableName, ...data])
    } catch (error) {
      logger.error(
        `insertBalanceRecord Error: ${error}  data:${JSON.stringify(data)}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateRecord = async (tick, mintVal, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET mint_val = ? WHERE id = ?`

      const tableName = `tbl_drc_info_${tick.toLowerCase()}`

      return await query(updateQuery, [tableName, mintVal, id])
    } catch (error) {
      logger.error(`updateRecord Error: ${error},id:${id},mintVal:${mintVal}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const deleteRecord = async (tick, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let deleteQuery = `DELETE FROM ?? WHERE id = ?`

      const tableName = `tbl_drc_info_${tick.toLowerCase()}`

      return await query(deleteQuery, [tableName, id])
    } catch (error) {
      logger.error(`deleteRecord Error: ${error},id:${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectBalanceRecord = async (tick, addresses) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE tick = ? and address =?`

      const tableName = `tbl_drc_balance_${tick.toLowerCase()}`

      return await query(selectQuery, [tableName, tick, addresses])
    } catch (error) {
      logger.error(
        `selectBalanceRecord Error: ${error},addresses:${addresses},tick:${tick}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateBalanceRecord = async (tick, balance, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET balance = ? WHERE id = ?`

      const tableName = `tbl_drc_balance_${tick.toLowerCase()}`

      return await query(updateQuery, [tableName, balance, id])
    } catch (error) {
      logger.error(
        `updateBalanceRecord Error: ${error},id:${id} ,balance:${balance}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateDrcFlagRecord = async (tick, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET mint_over = 1 WHERE id = ?`
      const tableName = `tbl_drc_info_${tick.toLowerCase()}`
      return await query(updateQuery, [tableName, id])
    } catch (error) {
      logger.error(`updateDrcFlagRecord Error: ${error},id:${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const insertTransferRecord = async (tick, data) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (address, amt, txnid,tick) 
      VALUES (?, ?, ?, ?)`

      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(insertQuery, [tableName, ...data])
    } catch (error) {
      logger.error(
        `insertTransferRecord Error: ${error} data:${JSON.stringify(data)}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectTransferRecord = async (address, tick) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE address = ? and tick=?`
      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, address, tick])
    } catch (error) {
      logger.error(
        `selectTransferRecord Error: ${error},address:${address},tick:${tick}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateTransferFlag = async (tick, flag, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET flag = ? WHERE id = ?`
      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(updateQuery, [tableName, flag, id])
    } catch (error) {
      logger.error(`updateTransferFlag Error: ${error},id: ${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const deleteTransferRecord = async (tick, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let deleteQuery = `DELETE FROM ?? WHERE id = ?`
      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(deleteQuery, [tableName, id])
    } catch (error) {
      logger.error(`deleteTransferRecord Error: ${error},id:${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectTransferRecordByTxnid = async (tick, txnid) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE txnid = ?`
      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, txnid])
    } catch (error) {
      logger.error(
        `selectTransferRecordByTxnid Error: ${error},txnid: ${txnid}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectSumByAddressAndTick = async (address, tick) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT address, tick, SUM(amt) as total_amt FROM ?? WHERE address = ? AND tick = ?  and flag = 0 GROUP BY address, tick`
      const tableName = `tbl_transfer_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, address, tick])
    } catch (error) {
      logger.error(
        `selectSumByAddressAndTick Error: ${error},address:${address},tick:${tick}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectTxInfo = async (tick, block) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE flag=0 and block=? order by block,tx_index`
      const tableName = `tbl_tx_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, block])
    } catch (error) {
      logger.error(`selectTxInfo Error: ${error},block:${block}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateTxInfoFlag = async (tick, id, flag) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET flag = ? WHERE id = ?`
      const tableName = `tbl_tx_info_${tick.toLowerCase()}`
      return await query(updateQuery, [tableName, flag, id])
    } catch (error) {
      logger.error(`updateTxInfoFlag Error: ${error},id:${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateCurrentBlock = async (tick, block) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET block= ? where id=1`
      const tableName = `tbl_current_block_${tick.toLowerCase()}`
      return await query(updateQuery, [tableName, block])
    } catch (error) {
      logger.error(`updateCurrentBlock Error: ${error},block:${block}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const insertTxTrsInfo = async (tick, data) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (sender,receiver,txid,tick,amt) 
      VALUES (?, ?, ?, ?, ?)`

      const tableName = `tbl_tx_transfer_info_${tick.toLowerCase()}`
      return await query(insertQuery, [tableName, ...data])
    } catch (error) {
      logger.error(
        `insertTxTrsInfo Error: ${error},data:${JSON.stringify(data)}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const updateIndexBlockInfoFlag = async (tick, id) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let updateQuery = `UPDATE ?? SET flag = 1 WHERE id = ?`
      const tableName = `tbl_block_index_info_${tick.toLowerCase()}`
      return await query(updateQuery, [tableName, id])
    } catch (error) {
      logger.error(`updateIndexBlockInfoFlag Error: ${error},id: ${id}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectIndexBlockInfo = async (tick) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE flag=0 order by block LIMIT 10`
      const tableName = `tbl_block_index_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName])
    } catch (error) {
      logger.error(`selectIndexBlockInfo Error: ${error}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectRecord = async (tick) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT * FROM ?? WHERE tick = ?`
      const tableName = `tbl_drc_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, tick])
    } catch (error) {
      logger.error(`selectRecord Error: ${error},tick:${tick}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

module.exports = {
  insertRecord,
  selectRecord,
  updateRecord,
  deleteRecord,
  selectBalanceRecord,
  insertBalanceRecord,
  updateBalanceRecord,
  updateDrcFlagRecord,
  insertTransferRecord,
  selectTransferRecord,
  updateTransferFlag,
  deleteTransferRecord,
  selectTransferRecordByTxnid,
  query,
  selectSumByAddressAndTick,
  selectTxInfo,
  updateTxInfoFlag,
  updateCurrentBlock,
  insertTxTrsInfo,
  updateIndexBlockInfoFlag,
  selectIndexBlockInfo,
}
