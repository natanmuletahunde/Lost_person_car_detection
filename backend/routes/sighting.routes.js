const express = require('express');
const router = express.Router();
const { reportSighting, getMySightings, getAllSightings, getSightingById, updateSighting, deleteSighting, getNearbySightings } = require('../controllers/sighting.controller');
const { protect, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { reportSightingValidation, updateSightingValidation } = require('../validations/sighting.validation');

router.get('/nearby', protect, getNearbySightings);

router.get('/my-sightings', protect, getMySightings);
router.post('/', protect, reportSightingValidation, validate, reportSighting);

router.get('/', protect, authorize('admin', 'moderator'), getAllSightings);
router.get('/:id', protect, getSightingById);
router.patch('/:id', protect, authorize('admin', 'moderator'), updateSightingValidation, validate, updateSighting);
router.delete('/:id', protect, authorize('admin'), deleteSighting);

module.exports = router;
