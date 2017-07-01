const express = require("express");
const router = express.Router();
const PublicController = require("../controllers/PublicController");

router.get('/home-info', PublicController.homeInfo);

module.exports = router;