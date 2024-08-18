const handleProfile = (req, res, db) => {
  db.select("*")
    .from("users")
    .where({
      id: req.params.id,
    })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("not found");
      }
    })
    .catch((err) => res.status(400).json("error getting user"));
};

const handleProfileUpdate = (req, res, db) => {
  const { id } = req.params;
  const { name, date_of_birth } = req.body.formInput;

  let updateFields = {};

  if (name) {
    updateFields.name = name;
  }

  if (date_of_birth) {
    updateFields.date_of_birth = date_of_birth;
  }

  if (Object.keys(updateFields).length > 0) {
    db("users")
      .where("id", "=", id)
      .update(updateFields)
      .then((resp) => {
        if (resp) {
          res.json("success");
        } else {
          res.status(400).json("Unable to update!");
        }
      })
      .catch((err) => {
        res.status(400).json("Error updating user!");
      });
  } else {
    res.status(400).json("Unable to Update!");
  }
};

module.exports = {
  handleProfile,
  handleProfileUpdate,
};
