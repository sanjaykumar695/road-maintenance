const mongoose = require('mongoose');

const damageReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    roadAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadAsset',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    damageType: {
      type: String,
      enum: ['Potholes', 'Cracks', 'Surface Deterioration', 'Flooding', 'Subsidence', 'Other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    photos: [String],
    status: {
      type: String,
      enum: ['Reported', 'Under Review', 'Scheduled', 'In Progress', 'Completed', 'Closed'],
      default: 'Reported',
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: Date,
    acceptedByManager: {
      type: Boolean,
      default: false,
    },
    acceptedDate: Date,
    completedDate: Date,
    completionNotes: String,
    verifiedByUser: {
      type: Boolean,
      default: false,
    },
    verifiedDate: Date,
    verificationNotes: String,
    reportDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Auto-generate report ID
damageReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    this.reportId = 'DR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

module.exports = mongoose.model('DamageReport', damageReportSchema);
