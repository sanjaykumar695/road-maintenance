require('dotenv').config();
const mongoose = require('mongoose');
const RoadAsset = require('./models/RoadAsset');
const DamageReport = require('./models/DamageReport');
const MaintenanceSchedule = require('./models/MaintenanceSchedule');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const roads = await RoadAsset.find({}).lean();
    const reports = await DamageReport.find({}).lean();
    const schedules = await MaintenanceSchedule.find({}).lean();
    console.log('--- ROADS ---');
    console.log(JSON.stringify(roads, null, 2));
    console.log('--- DAMAGE REPORTS ---');
    console.log(JSON.stringify(reports, null, 2));
    console.log('--- MAINTENANCE SCHEDULES ---');
    console.log(JSON.stringify(schedules, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
