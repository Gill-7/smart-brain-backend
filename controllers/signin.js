const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

const handleSignIn = (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("Incorrect user credentials!");
  }

  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      if (data.length === 0) {
        return Promise.reject("wrong credentials!!!"); // User does not exist
      }
      const isValid = bcrypt.compareSync(password, data[0].hash);

      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            if (user.length) {
              return user[0];
            } else {
              return Promise.reject("unable to get user");
            }
          });
      } else {
        return Promise.reject("wrong credentials!!!");
      }
    })
    .catch((err) => {
      Promise.reject(err);
    });
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.json({ id: reply });
  });
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSessions = (user) => {
  //JWT token and user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token };
    })
    .catch(console.log);
};

const signInAuthentication = (req, res, db, bcrypt) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignIn(req, res, db, bcrypt)
        .then((data) => {
          return data.id && data.email
            ? createSessions(data)
            : Promise.reject("Wrong credentials");
        })
        .then((session) => {
          res.json(session);
        })
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signInAuthentication: signInAuthentication,
  redisClient: redisClient,
};
