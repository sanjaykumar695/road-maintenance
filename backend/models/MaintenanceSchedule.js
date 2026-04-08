const mongoose = require('mongoose');

const maintenanceScheduleSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: String,
      unique: true,
    },
    damageReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DamageReport',
      required: true,
    },
    roadAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadAsset',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    workDescription: String,
    estimatedCost: Number,
    actualCost: Number,
    materialsUsed: [
      {
        name: String,
        quantity: Number,
        unit: String,
        cost: Number,
      },
    ],
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    completionDate: Date,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate schedule ID
maintenanceScheduleSchema.pre('save', async function (next) {
  if (!this.scheduleId) {
    this.scheduleId = 'MS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

module.exports = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);
