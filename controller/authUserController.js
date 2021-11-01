const User = require("../model/User");
const jwtMiddleware = require("../middleware/jwtMiddleware");

// handle errors
const handleErrors = (err) => {
  console.log(`error massage: ${err.message}`);
  console.log(`error code: ${err.code}`);

  let errors = { email: "", password: "" };

  //incorect email
  if (err.message === "incorrect email or username") {
    errors.email = "that email is not registerd";
  }
  //incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is incorrect";
  }

  //duplicate email error
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

const maxAge = process.env.JWT_AGE * 24 * 60 * 60;

module.exports.signup_post = async (req, res) => {
  const { name, last_name, email, username, password, phone } = req.body;
  const location = [];
  try {
    const user = await User.create({
      name,
      last_name,
      email,
      username,
      password,
      phone,
      location,
    });

    const token = jwtMiddleware.createToken(
      user._id,
      process.env.JWT_SECRET,
      maxAge
    );
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ hasJWT: true });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = await User.login(email, username, password);

    const token = jwtMiddleware.createToken(
      user._id,
      process.env.JWT_SECRET,
      maxAge
    );

    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ hasJWT: true });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(201).json({ logout: true });
  } catch (err) {
    res.status(400).send(err);
  }
};

//verify JWT token 
module.exports.checkAuth_get = async (req, res) => {
  const token = req.cookies.jwt;
  const secret = process.env.JWT_SECRET;
  try {
    //decode and verify token
    const id = await jwtMiddleware.jwtVerifier(token, secret);
    if (id) {
      res.status(200).json({ isValid: true });
    } else if (id === undefined) {
      throw Error ("user validation failed")
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors, isValid: false });
  }
};