const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const authenticated = await User.authenticate(username, password);
    if (authenticated.message === "User not found") {
      return res.json({ message: `User not found` });
    } else {
      if (authenticated) {
        return res.json({ message: `User ${username} authenticated` });
      } else {
        return res.json({ message: "Invalid username/password" });
      }
    }
  } catch (e) {
    return next();
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const newUser = await User.register(
      username,
      password,
      first_name,
      last_name,
      phone
    );
    debugger;
    if (newUser.message === "user exists") {
      throw new ExpressError(
        "Username taken. Maybe try 'EarlyBirdGetsTheWorm'?",
        400
      );
    }
    return res.json({
      message: `User ${newUser.username} created successfully`,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
