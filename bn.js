const BigNumber = require('bignumber.js')

const tonumber = (value) => {
  return new BigNumber(value).toNumber() || 0
}

const tofix = (value, p) => {
  return new BigNumber(value || 0).toFixed(p, BigNumber.ROUND_DOWN)
}

const bnminus = (a, b) => {
  return new BigNumber(a).minus(new BigNumber(b)).toNumber()
}

const bndiv = (a, b) => {
  return new BigNumber(a).div(new BigNumber(b)).toNumber()
}

const bnmult = (a, b) => {
  return new BigNumber(a).multipliedBy(new BigNumber(b)).toNumber()
}

const bnadd = (a, b) => {
  return new BigNumber(a).plus(new BigNumber(b)).toNumber()
}

const bncomp = (a, b) => {
  return new BigNumber(a).comparedTo(new BigNumber(b))
}

function isNumeric(str) {
  return /^\d+$/.test(str)
}

function isfloat8(str) {
  return /^(0|[1-9]\d*)(\.\d{1,8})?$/.test(str)
}

// const test = () => {
//   console.log(isNumeric("22 22    "))
//   console.log(isNumeric("02222"))
//   console.log(isfloat8("022222 "))
//   console.log(isfloat8("2222 "))
// }
// test()

module.exports = {
  tonumber,
  tofix,
  bnminus,
  bndiv,
  bnmult,
  bnadd,
  bncomp,
  isNumeric,
  isfloat8
}
