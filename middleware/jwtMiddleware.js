const jwt = require("jsonwebtoken");

//check jwt exist and is verifed
module.exports.jwtVerifier = async (token, secret) => {
  let id;
  if (token && secret) {
    id = await jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        throw Error("unvalid jwt token");
      } else {
        return decodedToken.id;
      }
    });
  }
  return id;
};

module.exports.createToken = (id, secret, maxAge) => {
  return jwt.sign({ id }, secret, { expiresIn: maxAge });
};