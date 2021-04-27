module.exports = {
  async isSetup(id, db) {
    return await new Promise(resolve => {
      db.queryUserById(id, (result, db) => {
        resolve(result == null ? false : result.initialSetup);
      })
    }).catch(console.log)
  },

  async dashboardData(id, db) {
    return await new Promise(resolve => {
      db.queryUserById(id, (result, db) => {
        resolve (result.data)
      })
    }).catch(console.error)
  }
}