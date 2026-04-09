const express = require('express');
const router = express.Router();
const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  getStatistics,
} = require('../controllers/maintenanceController');
const { auth, managerAuth } = require('../middleware/auth');

router.get('/', auth, getAllSchedules);
router.get('/stats', auth, getStatistics);
router.get('/:id', auth, getScheduleById);
router.post('/', managerAuth, createSchedule);
router.put('/:id', managerAuth, updateSchedule);

module.exports = router;
