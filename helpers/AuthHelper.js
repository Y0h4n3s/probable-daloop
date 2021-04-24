module.exports = {
  async authenticate(user, pass, db) {
    var result = await new Promise(resolve => {
      db.queryUserByUsername(user, (result, db) => {
        resolve(result)
      }) 
    }).catch(console.log)
    return result
    
  },

  async signUpNewUser(user, pass, db) {
    var result =  await new Promise(resolve => {
      db.queryUserByUsername(user, async (result, db) => {
      if (result == null) {
        const result = await db.collection("users").insertOne({username: user, password: pass, initialSetup: false});
        console.log(result)
        resolve(true)
      }
      resolve(false)
    })
  })
    return result;
   
  }
}