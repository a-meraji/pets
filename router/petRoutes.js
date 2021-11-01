const { Router } = require("express");
const petController = require("../controller/petController.js");

const router = Router();

router.post("/pet/create", petController.createPet_post);
router.get("/pet/read", petController.readPet_get);
router.post("/pet/update", petController.petUpdate_post);
router.post("/pet/geoquery", petController.geoQuery_post);
router.get("/pet/query", petController.filterQueryPet_get);
router.delete("/pet/delete", petController.petDelete_delete);

module.exports = router;
