const express = require('express');
const router = express.Router();
const crudController = require('../controllers/crud.controller');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Apply middleware to all CRUD routes
router.use('/:model', apiKeyAuth);

router.post('/:model', crudController.create);
router.get('/:model', crudController.readAll);
router.get('/:model/:id', crudController.readOne);
router.put('/:model/:id', crudController.update);
router.delete('/:model/:id', crudController.remove);

module.exports = router;
