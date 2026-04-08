const RoadAsset = require('../models/RoadAsset');

// @desc    Get all road assets
// @route   GET /api/roads
// @access  Private
exports.getAllRoads = async (req, res) => {
  try {
    const { type, condition } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (condition) filter.condition = condition;

    const roads = await RoadAsset.find(filter).populate('assignedManager createdBy');
    res.status(200).json({
      success: true,
      count: roads.length,
      roads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single road asset
// @route   GET /api/roads/:id
// @access  Private
exports.getRoadById = async (req, res) => {
  try {
    const road = await RoadAsset.findById(req.params.id).populate('assignedManager createdBy');
    if (!road) {
      return res.status(404).json({ message: 'Road not found' });
    }
    res.status(200).json({
      success: true,
      road,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create road asset
// @route   POST /api/roads
// @access  Private/Manager
exports.createRoad = async (req, res) => {
  try {
    const { roadId, name, section, type, coordinates, address, length, width, assignedManager, budgetAllocation } = req.body;

    const road = await RoadAsset.create({
      roadId,
      name,
      section,
      type,
      location: {
        type: 'Point',
        coordinates,
        address,
      },
      length,
      width,
      assignedManager,
      budgetAllocation,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      road,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update road asset
// @route   PUT /api/roads/:id
// @access  Private/Manager
exports.updateRoad = async (req, res) => {
  try {
    let road = await RoadAsset.findById(req.params.id);
    if (!road) {
      return res.status(404).json({ message: 'Road not found' });
    }

    road = await RoadAsset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      road,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update road condition
// @route   PUT /api/roads/:id/condition
// @access  Private
exports.updateRoadCondition = async (req, res) => {
  try {
    const { status, description } = req.body;
    const road = await RoadAsset.findById(req.params.id);

    if (!road) {
      return res.status(404).json({ message: 'Road not found' });
    }

    road.condition = status;
    road.conditionHistory.push({
      status,
      reportedDate: new Date(),
      description,
    });

    await road.save();
    res.status(200).json({
      success: true,
      road,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete road asset
// @route   DELETE /api/roads/:id
// @access  Private/Admin
exports.deleteRoad = async (req, res) => {
  try {
    const road = await RoadAsset.findByIdAndDelete(req.params.id);
    if (!road) {
      return res.status(404).json({ message: 'Road not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Road deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get roads near coordinates
// @route   GET /api/roads/near?longitude=X&latitude=Y
// @access  Private
exports.getRoadsNear = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;

    const roads = await RoadAsset.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: maxDistance || 5000, // 5km default
        },
      },
    });

    res.status(200).json({
      success: true,
      count: roads.length,
      roads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
