module.exports = {
  async authenticate(user, pass, db) {
    var result = await new Promise((resolve, reject) => {
      db.queryUserByUsername(user, (result, db) => {
        resolve(result && result.password == pass ? result : null)
      }) 
    }).catch(console.error)
    return result
    
  },

  async signUpNewUser(user, pass, db) {
    var result =  await new Promise(resolve => {
      db.queryUserByUsername(user, async (result, db) => {
      if (result == null) {
        const result = await db.collection("users").insertOne({username: user, password: pass, initialSetup: false});
        resolve(true)
      }
      resolve(false)
    })
  })
    return result;
   
  }
}