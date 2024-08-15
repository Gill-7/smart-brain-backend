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
        db.transaction((trx) => {
          trx
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
                  res.json(user[0]);
                });
            })
            .then(trx.commit)
            .catch(trx.rollback);
        }).catch((err) => res.status(400).json("Unable to register!"));
      }
    })
    .catch((err) => res.status(400).json("Database error!"));
};

module.exports = {
  handleRegister: handleRegister,
};
