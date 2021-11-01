const { check, validationResult } = require("express-validator");

exports.userUpdate_validate = [
  check("username")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 character"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
  check("email").isEmail().withMessage("int's not a valid email"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
  check("phone").isMobilePhone().withMessage("it's not a valid phone number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
