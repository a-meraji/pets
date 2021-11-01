const { Router } = require("express");
const manageUserController = require("../controller/manageUserController.js");
const { userUpdate_validate } = require("../middleware/formValidation");

const router = Router();

router.get("/user/read", manageUserController.readUser_get);
router.post(
  "/user/update",
  userUpdate_validate,
  manageUserController.updateUser_post
);
router.post("user/location/update", manageUserController.updateLocation_post);
router.delete("/user/delete", manageUserController.deleteUser_get);
router.get("/user/query", manageUserController.queryUsers_get);

module.exports = router;