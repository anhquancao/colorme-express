const express = require("express");
const router = express.Router();
const ImageController = require("../controllers/ImageController");

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload',upload.single('image'), ImageController.upload);

module.exports = router;