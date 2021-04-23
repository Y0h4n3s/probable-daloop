module.exports = {
  authenticate(user, pass, db) {
    if (db.queryUserByUsername(user)) {
      return user + pass
    }
    return void 0;
  },

  signUpNewUser(user, pass, db) {
    db.addUser(user, pass);
  }
}