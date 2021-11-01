const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bycrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  username: {
    type: String,
    unique: true,
    required: [true, "please enter your username"],
    minlength: [3, "Minimum username length is 3 characters"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  phone: {
    type: Number,
    unique: true,
    required: [true, "please provide your phone number"],
    minlength: [11, "this number does not looks valid"],
  },
  location: {
    type: Array,
    required: [false, "location not provided"],
  },
});

// fires before doc saved to db in order to hash the password
userSchema.pre("save", async function (next) {
  const salt = await bycrypt.genSalt();
  this.password = await bycrypt.hash(this.password, salt);
  next();
});

//fires after docs save
userSchema.post("save", (doc, next) => {
  console.log("new user created & saved");
  next();
});

//static method to login user
userSchema.statics.login = async function (email, username, password) {
  const user = email
    ? await this.findOne({ email })
    : await this.findOne({ username });
  if (user) {
    const auth = await bycrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email or username");
};

//static method to sure username or email is uniqe
userSchema.statics.uniqUsername = async function (username, email, phone) {
  let uniq = {}
  if(username){
    uniq = await this.findOne({"username":username})
  }else if(email) {
    uniq = await this.findOne({"email":email})
  }else if(phone){
    uniq = await this.findOne({"phone":phone})
  }
  console.log(uniq);
  if(uniq != null){
    return false
  }
  else{
    return true
  }
}

const User = mongoose.model("user", userSchema);

module.exports = User;