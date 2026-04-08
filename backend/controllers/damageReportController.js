const DamageReport = require('../models/DamageReport');
const RoadAsset = require('../models/RoadAsset');

// @desc    Get all damage reports
// @route   GET /api/damage-reports
// @access  Private
exports.getAllReports = async (req, res) => {
  try {
    const { status, severity, roadAsset } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (roadAsset) filter.roadAsset = roadAsset;

    const reports = await DamageReport.find(filter)
      .populate('roadAsset reportedBy assignedTo');
    
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single damage report
// @route   GET /api/damage-reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await DamageReport.findById(req.params.id)
      .populate('roadAsset reportedBy assignedTo');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create damage report
// @route   POST /api/damage-reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { roadAsset, damageType, severity, description, coordinates, photos } = req.body;

    // Verify road exists
    const road = await RoadAsset.findById(roadAsset);
    if (!road) {
      return res.status(404).json({ message: 'Road asset not found' });
    }

    const report = await DamageReport.create({
      roadAsset,
      reportedBy: req.user.id,
      damageType,
      severity,
      description,
      location: {
        type: 'Point',
        coordinates,
      },
      photos: photos || [],
    });

    // Update road condition if severe
    if (severity === 'Critical' || severity === 'High') {
      road.condition = 'Critical';
      await road.save();
      report.alertSent = true;
      await report.save();
    }

    const populatedReport = await report.populate('roadAsset reportedBy');

    res.status(201).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update damage report
// @route   PUT /api/damage-reports/:id
// @access  Private
exports.updateReport = async (req, res) => {
  try {
    let report = await DamageReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report = await DamageReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('roadAsset reportedBy assignedTo');

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get critical/severe damage reports
// @route   GET /api/damage-reports/critical
// @access  Private/Manager
exports.getCriticalReports = async (req, res) => {
  try {
    const reports = await DamageReport.find({
      severity: { $in: ['Critical', 'High'] },
      status: { $ne: 'Completed' },
    })
      .populate('roadAsset reportedBy assignedTo assignedBy')
      .sort({ reportDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign report to manager
// @route   PUT /api/damage-reports/:id/assign
// @access  Private/Admin
exports.assignReport = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can assign reports' });
    }

    // Check if assigned user is a manager
    const User = require('../models/User');
    const manager = await User.findById(assignedTo);
    if (!manager || manager.role !== 'Maintenance Manager') {
      return res.status(400).json({ message: 'Assigned user must be a maintenance manager' });
    }

    report.assignedTo = assignedTo;
    report.assignedBy = req.user.id;
    report.assignedDate = new Date();
    report.status = 'Under Review';
    await report.save();

    const populatedReport = await report.populate('roadAsset reportedBy assignedTo assignedBy');

    res.status(200).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept assignment by manager
// @route   PUT /api/damage-reports/:id/accept
// @access  Private/Manager
exports.acceptAssignment = async (req, res) => {
  try {
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the assigned manager
    if (report.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only assigned manager can accept this report' });
    }

    report.acceptedByManager = true;
    report.acceptedDate = new Date();
    report.status = 'In Progress';
    await report.save();

    const populatedReport = await report.populate('roadAsset reportedBy assignedTo assignedBy');

    res.status(200).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete work by manager
// @route   PUT /api/damage-reports/:id/complete
// @access  Private/Manager
exports.completeWork = async (req, res) => {
  try {
    const { completionNotes } = req.body;
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the assigned manager
    if (report.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only assigned manager can complete this report' });
    }

    // Check if work was accepted
    if (!report.acceptedByManager) {
      return res.status(400).json({ message: 'Manager must accept assignment before completing work' });
    }

    report.completedDate = new Date();
    report.completionNotes = completionNotes;
    report.status = 'Completed';
    await report.save();

    const populatedReport = await report.populate('roadAsset reportedBy assignedTo assignedBy');

    res.status(200).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify completion by end user
// @route   PUT /api/damage-reports/:id/verify
// @access  Private/End User
exports.verifyCompletion = async (req, res) => {
  try {
    const { verificationNotes } = req.body;
    const report = await DamageReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the reporter
    if (report.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the original reporter can verify completion' });
    }

    // Check if work is completed
    if (report.status !== 'Completed') {
      return res.status(400).json({ message: 'Work must be completed before verification' });
    }

    report.verifiedByUser = true;
    report.verifiedDate = new Date();
    report.verificationNotes = verificationNotes;
    report.status = 'Closed';
    await report.save();

    const populatedReport = await report.populate('roadAsset reportedBy assignedTo assignedBy');

    res.status(200).json({
      success: true,
      report: populatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reports assigned to current manager
// @route   GET /api/damage-reports/my-assignments
// @access  Private/Manager
exports.getMyAssignments = async (req, res) => {
  try {
    const reports = await DamageReport.find({
      assignedTo: req.user.id,
    })
      .populate('roadAsset reportedBy assignedTo assignedBy')
      .sort({ assignedDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reports reported by current user
// @route   GET /api/damage-reports/my-reports
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const reports = await DamageReport.find({
      reportedBy: req.user.id,
    })
      .populate('roadAsset reportedBy assignedTo assignedBy')
      .sort({ reportDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
