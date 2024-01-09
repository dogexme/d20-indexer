const { tonumber, isNumeric, isfloat8 } = require("./bn")

function isValidDeployJsonStructure(str, tick) {
  try {
    const infoObj = JSON.parse(str)
    const format_string = JSON.stringify(infoObj)
    const expectedKeys = new Set(['p', 'op', 'tick', 'max', 'lim'])
    const keys = Object.keys(infoObj)
    const tmpFlag =
      keys.length === expectedKeys.size &&
      keys.every((key) => expectedKeys.has(key))

    const valVflag =
      infoObj.p === `drc-20` &&
      typeof infoObj.max === `string` &&
      typeof infoObj.lim === `string` &&
      isNumeric(infoObj.max) &&
      isNumeric(infoObj.lim) &&
      tonumber(infoObj.max) > 0 &&
      tonumber(infoObj.lim) > 0 &&
      tick.toLowerCase() === infoObj.tick.toLowerCase() &&
      format_string.length < 500

    const lengthVflag =
      infoObj.tick &&
      infoObj.tick.length >= 4 &&
      infoObj.tick.length <= 6 &&
      infoObj.max.length <= 20 &&
      infoObj.lim.length <= 20

    return tmpFlag && valVflag && lengthVflag
  } catch (e) {
    return false
  }
}

function isValidMintJsonStructure(str, tick) {
  try {
    const infoObj = JSON.parse(str)
    const format_string = JSON.stringify(infoObj)
    const expectedKeys = new Set(['p', 'op', 'tick', 'amt'])
    const keys = Object.keys(infoObj)
    const tmpFlag =
      keys.length === expectedKeys.size &&
      keys.every((key) => expectedKeys.has(key))
    const valVflag =
      infoObj.p === `drc-20` &&
      typeof infoObj.amt === `string` &&
      isNumeric(infoObj.amt) &&
      tonumber(infoObj.amt) > 0 &&
      tick.toLowerCase() === infoObj.tick.toLowerCase()

    const lengthVflag =
      infoObj.tick &&
      infoObj.tick.length >= 4 &&
      infoObj.tick.length <= 6 &&
      infoObj.amt.length <= 20 &&
      format_string.length < 500

    return tmpFlag && valVflag && lengthVflag
  } catch (e) {
    return false
  }
}

function isValidTransferJsonStructure(str, tick) {
  try {
    const infoObj = JSON.parse(str)
    const format_string = JSON.stringify(infoObj)
    const expectedKeys = new Set(['p', 'op', 'tick', 'amt'])
    const keys = Object.keys(infoObj)
    const tmpFlag =
      keys.length === expectedKeys.size &&
      keys.every((key) => expectedKeys.has(key))
    const valVflag =
      infoObj.p === `drc-20` &&
      typeof infoObj.amt === `string` &&
      isfloat8(infoObj.amt) &&
      tick.toLowerCase() === infoObj.tick.toLowerCase()

    const lengthVflag =
      infoObj.tick &&
      infoObj.tick.length >= 4 &&
      infoObj.tick.length <= 6 &&
      infoObj.amt.length < 29 &&
      format_string.length < 500

    return tmpFlag && valVflag && lengthVflag
  } catch (e) {
    return false
  }
}

module.exports = {
  isValidMintJsonStructure,
  isValidDeployJsonStructure,
  isValidTransferJsonStructure
}
