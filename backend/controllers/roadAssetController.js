const RoadAsset = require('../models/RoadAsset');

// @desc    Get all road assets
// @route   GET /api/roads
// @access  Private
exports.getAllRoads = async (req, res) => {
  try {
    const { roadType, condition } = req.query;
    let filter = {};

    if (roadType) filter.roadType = roadType;
    if (condition) filter.condition = condition;

    const roads = await RoadAsset.find(filter).populate('createdBy');
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
    const road = await RoadAsset.findById(req.params.id).populate('createdBy');
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

// @desc    Create road asset (End User/Inspector only)
// @route   POST /api/roads
// @access  Private/End User
exports.createRoad = async (req, res) => {
  try {
    // Only End User/Inspector can create roads
    if (req.user.role !== 'End User/Inspector') {
      return res.status(403).json({ message: 'Only End Users/Inspectors can add roads' });
    }

    const { roadId, roadName, roadType, address, coordinates } = req.body;

    // Create the road with Location
    const road = await RoadAsset.create({
      roadId,
      roadName,
      roadType,
      address,
      location: {
        type: 'Point',
        coordinates, // [longitude, latitude]
      },
      condition: 'Fair', // Default condition
      createdBy: req.user.id,
    });

    const populatedRoad = await road.populate('createdBy');

    res.status(201).json({
      success: true,
      road: populatedRoad,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update road condition (Admin/Manager only)
// @route   PUT /api/roads/:id/condition
// @access  Private/Admin or Manager
exports.updateRoadCondition = async (req, res) => {
  try {
    const { condition } = req.body;
    
    // Only Admin or Manager can update condition
    if (!['Admin', 'Maintenance Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Admins or Managers can update road condition' });
    }

    const road = await RoadAsset.findById(req.params.id);

    if (!road) {
      return res.status(404).json({ message: 'Road not found' });
    }

    road.condition = condition;
    await road.save();

    res.status(200).json({
      success: true,
      road,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete road asset (Admin only)
// @route   DELETE /api/roads/:id
// @access  Private/Admin
exports.deleteRoad = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete roads' });
    }

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
