const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const DamageReport = require('../models/DamageReport');

// @desc    Get all maintenance schedules
// @route   GET /api/maintenance-schedules
// @access  Private
exports.getAllSchedules = async (req, res) => {
  try {
    const { status, roadAsset } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (roadAsset) filter.roadAsset = roadAsset;

    const schedules = await MaintenanceSchedule.find(filter)
      .populate('damageReport roadAsset assignedTeam');

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single maintenance schedule
// @route   GET /api/maintenance-schedules/:id
// @access  Private
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await MaintenanceSchedule.findById(req.params.id)
      .populate('damageReport roadAsset assignedTeam');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create maintenance schedule
// @route   POST /api/maintenance-schedules
// @access  Private/Manager
exports.createSchedule = async (req, res) => {
  try {
    const { damageReport, roadAsset, scheduledDate, assignedTeam, workDescription, estimatedCost } = req.body;

    // Verify damage report exists
    const report = await DamageReport.findById(damageReport);
    if (!report) {
      return res.status(404).json({ message: 'Damage report not found' });
    }

    const schedule = await MaintenanceSchedule.create({
      damageReport,
      roadAsset,
      scheduledDate,
      assignedTeam,
      workDescription,
      estimatedCost,
    });

    // Update damage report status
    report.status = 'Scheduled';
    await report.save();

    const populatedSchedule = await schedule.populate('damageReport roadAsset assignedTeam');

    // Emit real-time update for dashboard statistics
    const stats = await getUpdatedStats();
    global.io.emit('statsUpdate', stats);

    res.status(201).json({
      success: true,
      schedule: populatedSchedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update maintenance schedule
// @route   PUT /api/maintenance-schedules/:id
// @access  Private/Manager
exports.updateSchedule = async (req, res) => {
  try {
    let schedule = await MaintenanceSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // If status is changed to "Completed", update related damage report
    if (req.body.status === 'Completed' && schedule.status !== 'Completed') {
      const report = await DamageReport.findById(schedule.damageReport);
      if (report) {
        report.status = 'Completed';
        await report.save();
      }
    }

    schedule = await MaintenanceSchedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('damageReport roadAsset assignedTeam');

    // Emit real-time update for dashboard statistics
    const stats = await getUpdatedStats();
    global.io.emit('statsUpdate', stats);

    res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get updated statistics
const getUpdatedStats = async () => {
  try {
    const totalSchedules = await MaintenanceSchedule.countDocuments();
    const completedSchedules = await MaintenanceSchedule.countDocuments({ status: 'Completed' });
    const inProgressSchedules = await MaintenanceSchedule.countDocuments({ status: 'In Progress' });
    const totalExpenditure = await MaintenanceSchedule.aggregate([
      { $group: { _id: null, total: { $sum: '$actualCost' } } },
    ]);

    return {
      total: totalSchedules,
      completed: completedSchedules,
      inProgress: inProgressSchedules,
      totalExpenditure: totalExpenditure[0]?.total || 0,
    };
  } catch (error) {
    console.error('Error getting updated stats:', error);
    return null;
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance-schedules/stats
// @access  Private/Manager
exports.getStatistics = async (req, res) => {
  try {
    const stats = await MaintenanceSchedule.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$actualCost' },
        },
      },
    ]);

    const totalSchedules = await MaintenanceSchedule.countDocuments();
    const completedSchedules = await MaintenanceSchedule.countDocuments({ status: 'Completed' });
    const inProgressSchedules = await MaintenanceSchedule.countDocuments({ status: 'In Progress' });
    const totalExpenditure = await MaintenanceSchedule.aggregate([
      { $group: { _id: null, total: { $sum: '$actualCost' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalSchedules,
        completed: completedSchedules,
        inProgress: inProgressSchedules,
        totalExpenditure: totalExpenditure[0]?.total || 0,
        breakdown: stats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
