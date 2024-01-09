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

const insertTxnRecord = async (tick, data) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (block,tx_index,txnid,content, address,txnid_pre,op)  VALUES (?, ?, ?, ?, ?, ?, ?)`
      const tableName = `tbl_tx_info_${tick.toLowerCase()}`
      return await query(insertQuery, [tableName, ...data])
    } catch (error) {
      logger.error(
        `insertTxnRecord Error: ${error} ,data:${JSON.stringify(data)}`,
      )
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const selectTxInfoById = async (tick, txnid) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let selectQuery = `SELECT id FROM ?? WHERE txnid=?`

      const tableName = `tbl_tx_info_${tick.toLowerCase()}`
      return await query(selectQuery, [tableName, txnid])
    } catch (error) {
      logger.error(`selectTxInfoById Error: ${error},txnid:${txnid}`)
      retries++
      if (retries >= MAX_RETRIES) {
        // 在达到最大重试次数后，抛出一个特定的错误
        throw new MaxRetriesReachedError('Max retries reached')
      }
    }
  }
}

const insertIndexBlockInfo = async (tick, block) => {
  let retries = 0
  while (retries < MAX_RETRIES) {
    try {
      let insertQuery = `INSERT INTO ?? (block)  VALUES (?)`

      const tableName = `tbl_block_index_info_${tick.toLowerCase()}`
      return await query(insertQuery, [tableName, block])
    } catch (error) {
      logger.error(`insertIndexBlockInfo Error: ${error},block: ${block}`)
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
  insertTxnRecord,
  selectTxInfoById,
  insertIndexBlockInfo,
  selectRecord
}
