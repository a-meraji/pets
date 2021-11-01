const User = require("../model/User");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const bycrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;

// handle errors
const handleErrors = (err) => {
  console.log(`error massage: ${err.message}`);
  console.log(`error code: ${err.code}`);

  let errors = { token: "", password: "", location: "" };

  //short password
  if (err.message === "short password") {
    errors.password = "minimum password length is 3 character";
  }
  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is incorrect";
  }
  //user not found by given id
  if (err.message === "user not found") {
    errors.token = "user not found";
  }
  //user not found by given id
  if (err.message === "unvalid ownerID") {
    errors.token = "user not found";
  }
  //location not provided
  if (err.message === "location undefined") {
    error.location = "couldn't get location";
  }
  // duplicate username
  if (err.code === 11000) {
    errors.email = "that email is already registerd";
    return errors;
  }
  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

//find one user by ID or by Username
module.exports.readUser_get = async (req, res) => {
  try {
    let userOrId = {};
    if (req.query.id) {
      userOrId["_id"] = req.query.id;
      //validate id
      if (
        !ObjectId.isValid(userOrId["_id"]) ||
        String(new ObjectId(userOrId["_id"])) !== userOrId["_id"]
      ) {
        throw Error("unvalid ownerID");
      }
    } else if (req.query.username) {
      userOrId["username"] = req.query.username;
    }
    User.findOne(userOrId, (err, docs) => {
      if (err) throw Error(err);
      res.status(200).json(docs);
    });
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

// update user info
//email confirmation will be add lator
module.exports.updateUser_post = async (req, res) => {
  const { name, last_name, username, phone, email } = req.body;

  const tempUpdate = { name, last_name, username, phone, email };
  const finalUpdate = {};
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    //decode and varify token
    const id = await jwtMiddleware.jwtVerifier(token, secret);

    // filter all null values and make an object to pass for update values
    for (key in tempUpdate) {
      if (tempUpdate[key] !== undefined && tempUpdate[key] != "") {
        finalUpdate[key] = tempUpdate[key];
      }
    }

    if (id) {
      User.findByIdAndUpdate(id, finalUpdate, function (err, docs) {
        if (err) {
          const error = handleErrors(err);
          res.status(500).json({ updated: false, error });
        } else {
          res.status(200).json({ docs, updated: true });
        }
      });
    } else {
      throw Error("user validation failed");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ updated: false, error });
  }
};

// authenticate and then change password
module.exports.updatePassword_post = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (new_password.length < 3) {
    throw Error("short password");
  }
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    //cedode and verify token
    const id = await jwtMiddleware.jwtVerifier(token, secret);
    if (id) {
      const user = await User.findById(id);
      // compare passwords if success generate new password and update
      if (user) {
        const auth = await bycrypt.compare(current_password, user.password);
        if (auth) {
          const salt = await bycrypt.genSalt();
          const final_password = await bycrypt.hash(new_password, salt);
          User.findByIdAndUpdate(
            id,
            {
              password: final_password,
            },
            function (err, docs) {
              if (err) {
                const error = handleErrors(err);
                res.status(500).json({ updated: false, error });
              } else {
                res.status(200).json({ updated: true });
              }
            }
          );
        } else {
          throw Error("incorrect password");
        }
      } else {
        throw Error("user not found");
      }
    } else {
      throw Error("user validation failed");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ updated: false, error });
  }
};

// update geolocation info & coordinates
module.exports.updateLocation_post = async (req, res) => {
  const { u_location } = req.body;
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    if (u_location !== undefined) {
      const id = await jwtMiddleware.jwtVerifier(token, secret);
      if (id) {
        User.findByIdAndUpdate(id, { location: u_location }, (err, docs) => {
          if (err) {
            const error = handleErrors(err);
            res.status(500).json({ updated: false, error });
          } else {
            res.status(200).json({ updated: true });
          }
        });
      } else {
        throw Error("user validation failed");
      }
    } else {
      throw Error("location undefined");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ updated: false, error });
  }
};

//verify token if success then delete account
module.exports.deleteUser_get = async (req, res) => {
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;

  try {
    const id = await jwtMiddleware.jwtVerifier(token, secret);
    if (id) {
      User.findByIdAndRemove(id, false, (err, docs) => {
        if (err) {
          const error = handleErrors(err);
          res.status(500).json({ deleted: false, error });
        } else {
          res.status(200).json({ deleted: true });
        }
      });
    } else {
      throw Error("user validation failed");
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ deleted: false, error });
  }
};

//fine users by name, last-name, username
module.exports.queryUsers_get = async (req, res) => {
  try {
    if (Object.keys(req.query).length === 0) {
      res.status(200).json({ message: "nothing to search" });
    } else {
      const { name, last_name, username } = req.query;
      const temp = { name, last_name, username };
      let condition = {};
      for (key in temp) {
        if (temp[key] !== undefined && temp[key] != "") {
          condition[key] = temp[key];
        }
      }
      User.find(condition, (err, docs) => {
        if (err) throw Error(err);
        res.status(200).json(docs);
      });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};
