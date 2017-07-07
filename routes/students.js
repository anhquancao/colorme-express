const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentsController');

router.get('/:gen_id/:filter', StudentController.paidStudent);

module.exports = router;