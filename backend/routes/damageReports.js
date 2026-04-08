const express = require('express');
const router = express.Router();
const {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  getCriticalReports,
  assignReport,
  acceptAssignment,
  completeWork,
  verifyCompletion,
  getMyAssignments,
  getMyReports,
} = require('../controllers/damageReportController');
const { auth, managerAuth } = require('../middleware/auth');

router.get('/', auth, getAllReports);
router.get('/critical', managerAuth, getCriticalReports);
router.get('/my-reports', auth, getMyReports);
router.get('/my-assignments', auth, getMyAssignments);
router.get('/:id', auth, getReportById);
router.post('/', auth, createReport);
router.put('/:id', auth, updateReport);
router.put('/:id/assign', auth, assignReport);
router.put('/:id/accept', auth, acceptAssignment);
router.put('/:id/complete', auth, completeWork);
router.put('/:id/verify', auth, verifyCompletion);

module.exports = router;
