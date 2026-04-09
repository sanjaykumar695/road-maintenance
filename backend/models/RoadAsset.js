const mongoose = require('mongoose');

const roadAssetSchema = new mongoose.Schema(
  {
    roadId: {
      type: String,
      required: [true, 'Please provide a unique road ID'],
      unique: true,
      trim: true,
    },
    roadName: {
      type: String,
      required: [true, 'Please provide road name'],
      trim: true,
    },
    roadType: {
      type: String,
      enum: ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other'],
      required: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide road address'],
      trim: true,
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
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      default: 'Fair',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Create geospatial index for location
roadAssetSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('RoadAsset', roadAssetSchema);
