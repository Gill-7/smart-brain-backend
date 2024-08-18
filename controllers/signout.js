const redisClient = require("./signin").redisClient;

const handlerSignout = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json("Unable to signout!");
  }
  return redisClient.del(authorization, (err, response) => {
    if (err || !response) {
      return res.status(400).json("Failed to revoke token");
    }

    res.status(200).json("Successfully signed out");
  });
};

module.exports = {
  handlerSignout: handlerSignout,
};
