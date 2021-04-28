const {MongoClient, ObjectId} = require('mongodb');
const { initialSetup, updateTimetable } = require('./UserHelper');

const DbOps = {
  async createConnection(url, options={}) {
    var client = new MongoClient(url, options);
    await client.connect();
    this.client = client;
    this.db = client.db("probable_daloop");
  },

  async listDatabases(){
    databasesList = await this.client.db("probable_daloop").admin().listDatabases();
 
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
    callback(result, this.db);
  },

  async clearDb() {
    this.db.collection("users").deleteMany({});
  },

  async listDocuments() {
    const result = await this.db.collection("users").find({});
    return result;
  },

  async initialSetup(id , tasks, callback) {
    const result = await this.db.collection("users").updateOne({_id: ObjectId(id)}, {$set: {initialSetup: true, "data": tasks}})
    callback(result)
  },

  async updateTimetable(id, timetable, callback) {
    const result = await this.db.collection('users').updateOne({_id: ObjectId(id)}, {$set: {"data.timeTable": timetable} })
    //console.log(result)
    callback(result, this)
  }
}

module.exports = DbOps;