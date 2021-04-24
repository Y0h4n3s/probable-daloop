const {MongoClient, ObjectId} = require('mongodb')

const DbOps = {
  async createConnection(url) {
    var client = new MongoClient(url);
    await client.connect();
    this.client = client;
    this.db = client.db("probable_daloop");
  },

  async listDatabases(){
    console.log(this)
    databasesList = await this.client.db("probable_daloop").admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  },

  async addUser(username, password) {
    const result = await this.db.collection("users").insertOne({username: username, password: password, initialSetup: false});
  },

  async queryUserByUsername (username, callback) {
    const result = await this.db.collection("users").findOne({username: username});
    callback(result, this.db);
  },

  async queryUserById (id, callback) {
    const result = await this.db.collection("users").findOne({_id: ObjectId(id)});
    console.log(id)
    callback(result, this.db);
  },

  async clearDb() {
    this.db.collection("users").deleteMany({});
  },

  async listDocuments() {
    const result = await this.db.collection("users").find({});
    return result;
  }
}

module.exports = DbOps;