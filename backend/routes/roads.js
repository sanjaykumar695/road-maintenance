const express = require('express');
const router = express.Router();
const {
  getAllRoads,
  getRoadById,
  createRoad,
  updateRoadCondition,
  deleteRoad,
  getRoadsNear,
} = require('../controllers/roadAssetController');
const { auth, managerAuth, adminAuth } = require('../middleware/auth');

router.get('/', auth, getAllRoads);
router.get('/near', auth, getRoadsNear);
router.get('/:id', auth, getRoadById);
router.post('/', auth, createRoad);
router.put('/:id/condition', auth, updateRoadCondition);
router.delete('/:id', adminAuth, deleteRoad);

module.exports = router;
