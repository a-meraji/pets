const { Router } = require("express");
const authUserController = require("../controller/authUserController.js");

const router = Router();

router.post("/signup", authUserController.signup_post);
router.post("/login", authUserController.login_post);
router.get("/logout", authUserController.logout_get);
router.get("/checkauth", authUserController.checkAuth_get);

module.exports = router;
