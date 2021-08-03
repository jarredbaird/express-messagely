/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** User of the site. */

class User {
  constructor(username, password, firstName, lastName, phone, joinAt) {
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.joinAt = joinAt;
  }

  async save() {
    try {
      const results = await db.query(
        `
        insert into users
          (username, password, first_name, last_name, phone, join_at)
        values
          ($1, $2, $3, $4, $5, $6)
        returning
          (username, password, first_name, last_name, phone, join_at)
        `,
        [
          this.username,
          this.password,
          this.firstName,
          this.lastName,
          this.phone,
          this.joinAt,
        ]
      );
      return this;
    } catch (e) {
      if (e.code === "23505") {
        await db.query(
          `
          update 
            users 
          set 
            username=$1, 
            password=$2, 
            first_name=$3, 
            last_name=$4, 
            phone=$5
          where
            id = $6`,
          [
            this.username,
            this.password,
            this.firstName,
            this.lastName,
            this.phone,
            this.id,
          ]
        );
        return this;
      }
      return e;
    }
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register(username, password, first_name, last_name, phone) {
    try {
      const results = await db.query(`select * from users where username=$1`, [
        username,
      ]);
      const userExists = results.rows[0];
      if (userExists) {
        throw new Error("user exists");
      }
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const newUser = new User(
        username,
        hashedPassword,
        first_name,
        last_name,
        phone,
        new Date(Date.now()).toJSON()
      );
      newUser.save();
      return newUser;
    } catch (e) {
      return e;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const results = await db.query(
        `select username, password from users where username=$1`,
        [username]
      );
      const user = results.rows[0];
      if (!user) {
        throw new Error("User not found");
      }
      const authenticated = await bcrypt.compare(password, user.password);
      return authenticated;
    } catch (e) {
      return e;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {}

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {}

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {}

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {}
}

module.exports = User;
