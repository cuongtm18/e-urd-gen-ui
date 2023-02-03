const printJson = async (data = {}) => {
  console.log(JSON.stringify(data, null, 2))
}

module.exports = {
  printJson
}
