const {MongoClient} = require('mongodb')


const DbOps = {
  async createConnection(url) {
    var client = new MongoClient(url);
    await client.connect();
    this.client = client;
  },

  async listDatabases(){
    console.log(this)
    databasesList = await this.client.db("probable_daloop").admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  },

  async addUser(username, password) {
    const result = await this.client.db("probable_daloop").collection("users").insertOne({username: username, password: password});
  },

  async queryUserByUsername (username) {
    const result = await this.client.db("probable_daloop").collection("users").findOne({username: username});
    return result;
  }
}

module.exports = DbOps;