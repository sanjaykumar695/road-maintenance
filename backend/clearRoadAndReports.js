const mongoose = require('mongoose');
require('dotenv').config();
const RoadAsset = require('./models/RoadAsset');
const DamageReport = require('./models/DamageReport');
const MaintenanceSchedule = require('./models/MaintenanceSchedule');

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    const roadCountBefore = await RoadAsset.countDocuments();
    const reportCountBefore = await DamageReport.countDocuments();
    const scheduleCountBefore = await MaintenanceSchedule.countDocuments();

    console.log(`Before cleanup: roads=${roadCountBefore}, reports=${reportCountBefore}, schedules=${scheduleCountBefore}`);

    await RoadAsset.deleteMany({});
    await DamageReport.deleteMany({});
    await MaintenanceSchedule.deleteMany({});

    const roadCountAfter = await RoadAsset.countDocuments();
    const reportCountAfter = await DamageReport.countDocuments();
    const scheduleCountAfter = await MaintenanceSchedule.countDocuments();

    console.log(`After cleanup: roads=${roadCountAfter}, reports=${reportCountAfter}, schedules=${scheduleCountAfter}`);
    console.log('Cleared road, report, and schedule data while preserving users.');

    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

clearData();
