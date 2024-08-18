const jwt = require("jsonwebtoken");
const redisClient = require("./signin").redisClient;

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token };
    })
    .catch(console.log);
};

const handleRegister = (req, res, db, bcrypt, saltRounds) => {
  const { email, password, name } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json("Incorrect user credentials!");
  }

  db.select("email")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      if (data.length) {
        return res
          .status(400)
          .json("Unable to register! Please use different email!");
      } else {
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        return db
          .transaction((trx) => {
            return trx
              .insert({
                hash: hash,
                email: email,
              })
              .into("login")
              .returning("email")
              .then((loginEmail) => {
                return trx("users")
                  .returning("*")
                  .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date(),
                  })
                  .then((user) => {
                    return user && user[0].id
                      ? createSession(user[0])
                      : Promise.reject("Unable to sign up. Please try again!");
                  })
                  .then((session) => {
                    res.json(session);
                  })
                  .catch((err) => res.status(400).json(err));
              })
              .then(trx.commit)
              .catch(trx.rollback);
          })
          .catch((err) => res.status(400).json("Unable to register!"));
      }
    })
    .catch((err) => res.status(400).json("Database error!"));
};

module.exports = {
  handleRegister: handleRegister,
};
