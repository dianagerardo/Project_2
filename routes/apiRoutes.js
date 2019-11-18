var db = require("../models");
const passport = require("passport");
const passportJWT = require("passport-jwt");
// const jwt = require("jsonwebtoken");
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "wowwow";
const jwt = require("jsonwebtoken");

module.exports = app => {
  // this is all the password routes
  // get all users
  app.get("/users", function(req, res) {
    console.log(db.User_Login);
    db.User_Logins.getAllUsers().then(user => res.json(user));
  });

  // create some helper functions to work on the database
  // const createUser = async ({ name, password }) => {
  //   return await User.create({ name, password });
  // };
  // const getAllUsers = async () => {
  //   return await User.findAll();
  // };
  const getUser = async obj => {
    console.log(db.User_Login);
    return await db.User_Login.findOne({
      where: obj
    });
  };

  // protected route
  app.get(
    "/protected",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      res.json({
        msg: "Congrats! You are seeing this because you are authorized"
      });
    }
  );

  // register route
  app.post("/user_login", function(req, res) {
    const userPassword = req.body.password;
    const userName = req.body.user_email;
    console.log(userName, userPassword);
    db.User_Login.create({
      userName: userName,
      password: userPassword
    }).then(user => res.json({ user, msg: "account created successfully" }));
  });

  //login route
  app.post("/protected", async function(req, res) {
    const userPassword = req.body.password;
    const userName = req.body.user_email;
    if (userPassword && userName) {
      let user = await getUser({ userName });
      console.log(user.password);
      if (!user) {
        res.status(401).json({ message: "No such user found" });
      }
      if (user.password == userPassword) {
        // from now on we"ll identify the user by the id and the id is the
        // only personalized value that goes into our token
        let payload = { id: user.id };
        let token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({ msg: "ok", token: token });
      } else {
        res.status(401).json({ msg: "userPassword is incorrect" });
      }
    }
  });

  app.get(
    "/protected",
    passport.authenticate("jwt", { session: false }),
    function(req, res) {
      res.json("Success! You can now see this without a token.");
    }
  );
  // Testing Only Remove before we publish
  app.post("/testing/123", function(req, res) {
    db.User_Data.create(req.body).then(function(returnThis) {
      res.json(returnThis);
    });
  });

  app.get("/testing/:key", function(req, res) {
    db.User_Data.findAll({
      where: { key: req.params.key }
    }).then(function(dataz) {
      res.json(dataz);
    });
  });

  app.put("/testing/123/:key", function(req, res) {
    console.log(req.body[0]);
    db.User_Data.update(
      { quote: req.body.text },
      { where: { key: req.params.key } }
    ).then(function(dbResult) {
      res.json(dbResult);
    });
  });
};
