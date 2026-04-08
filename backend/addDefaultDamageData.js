require('dotenv').config();
const mongoose = require('mongoose');
const RoadAsset = require('./models/RoadAsset');
const DamageReport = require('./models/DamageReport');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const inspector = await User.findOne({ username: 'inspector' });
    if (!inspector) {
      throw new Error('Inspector user not found. Create inspector user first.');
    }

    const indexes = await RoadAsset.collection.indexes();
    if (indexes.some((idx) => idx.name === 'uniqueId_1')) {
      await RoadAsset.collection.dropIndex('uniqueId_1');
      console.log('Dropped stale uniqueId_1 index from roadassets collection');
    }

    const defaultRoads = [
      {
        roadId: 'RD-101',
        name: 'NH-44 Expressway',
        section: 'North Corridor',
        type: 'Highway',
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.3850],
          address: 'Hyderabad North Expressway',
        },
        length: 120,
        width: 14,
        budgetAllocation: 1800000,
        condition: 'Fair',
      },
      {
        roadId: 'RD-102',
        name: 'City Sector Road',
        section: 'Downtown Avenue',
        type: 'Urban Street',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: 'Bangalore Downtown',
        },
        length: 8,
        width: 9,
        budgetAllocation: 300000,
        condition: 'Good',
      },
      {
        roadId: 'RD-103',
        name: 'River Bridge Link',
        section: 'East Bridge',
        type: 'Bridge',
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
          address: 'Mumbai East Bridge',
        },
        length: 2.5,
        width: 12,
        budgetAllocation: 950000,
        condition: 'Poor',
      },
    ];

    const existingRoads = await RoadAsset.find({ roadId: { $in: defaultRoads.map((road) => road.roadId) } });
    const existingIds = existingRoads.map((road) => road.roadId);
    const roadsToCreate = defaultRoads.filter((road) => !existingIds.includes(road.roadId));

    if (roadsToCreate.length) {
      const insertedRoads = await RoadAsset.insertMany(roadsToCreate);
      console.log('Inserted road assets:', JSON.stringify(insertedRoads, null, 2));
    } else {
      console.log('Default road assets already exist.');
    }

    const allRoads = await RoadAsset.find({ roadId: { $in: defaultRoads.map((road) => road.roadId) } });
    const roadMap = {};
    allRoads.forEach((road) => {
      roadMap[road.roadId] = road;
    });

    const defaultReports = [
      {
        roadAsset: roadMap['RD-101']._id,
        reportedBy: inspector._id,
        damageType: 'Potholes',
        severity: 'High',
        description: 'Multiple large potholes on the northbound lane causing damage to vehicles.',
        location: { type: 'Point', coordinates: [78.4871, 17.3860] },
        photos: ['https://example.com/pothole1.jpg'],
      },
      {
        roadAsset: roadMap['RD-102']._id,
        reportedBy: inspector._id,
        damageType: 'Cracks',
        severity: 'Medium',
        description: 'Widespread surface cracks along the downtown avenue, needs inspection.',
        location: { type: 'Point', coordinates: [77.5950, 12.9720] },
        photos: ['https://example.com/cracks1.jpg'],
      },
      {
        roadAsset: roadMap['RD-103']._id,
        reportedBy: inspector._id,
        damageType: 'Surface Deterioration',
        severity: 'Critical',
        description: 'Bridge deck is severely deteriorated with exposed rebar and potholes.',
        location: { type: 'Point', coordinates: [72.8780, 19.0765] },
        photos: ['https://example.com/bridge1.jpg'],
      },
    ];

    const existingReports = await DamageReport.find({
      description: { $in: defaultReports.map((report) => report.description) },
    });
    const existingDescriptions = existingReports.map((report) => report.description);
    const reportsToCreate = defaultReports.filter((report) => !existingDescriptions.includes(report.description));

    const generateReportId = () => `DR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reportsToCreateWithIds = reportsToCreate.map((report) => ({
      ...report,
      reportId: generateReportId(),
    }));

    if (reportsToCreateWithIds.length) {
      const insertedReports = await DamageReport.insertMany(reportsToCreateWithIds);
      console.log('Inserted damage reports:', JSON.stringify(insertedReports, null, 2));
    } else {
      console.log('Default damage reports already exist. No new reports inserted.');
    }

    console.log('Default data insertion complete.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error inserting default data:', err);
    process.exit(1);
  }
})();
