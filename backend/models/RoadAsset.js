const mongoose = require('mongoose');

const roadAssetSchema = new mongoose.Schema(
  {
    roadId: {
      type: String,
      required: [true, 'Please provide a unique road ID'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide road name'],
      trim: true,
    },
    section: String,
    type: {
      type: String,
      enum: ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other'],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },
    length: {
      type: Number,
      required: true,
    },
    width: Number,
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      default: 'Fair',
    },
    conditionHistory: [
      {
        status: String,
        reportedDate: Date,
        description: String,
      },
    ],
    budgetAllocation: Number,
    lastMaintenanceDate: Date,
    purchaseOrders: [
      {
        poNumber: String,
        description: String,
        supplier: String,
        cost: Number,
        status: String,
        orderDate: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Create geospatial index for location
roadAssetSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('RoadAsset', roadAssetSchema);
