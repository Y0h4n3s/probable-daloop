module.exports = {
  async isSetup(id, db) {
    return await new Promise(resolve => {
      db.queryUserById(id, (result, db) => {
        resolve(result == null ? false : result.initialSetup);
      })
    }).catch(console.error)
  },

  async dashboardData(id, db) {
    return await new Promise(resolve => {
      db.queryUserById(id, (result, db) => {
        resolve (result.data)
      })
    }).catch(console.error)
  }

  ,

  async updateTimetable(id, timeTable, db) {
    return await new Promise(resolve => {
      db.updateTimetable(id, timeTable, async (result, db) => {
        await db.queryUserById(id, (result2, db) => resolve(result2))
      })
    }).catch(console.error)
  }
}