const mongoose = require('mongoose');
require('dotenv').config();
const RoadAsset = require('./models/RoadAsset');
const User = require('./models/User');
const DamageReport = require('./models/DamageReport');
const MaintenanceSchedule = require('./models/MaintenanceSchedule');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await RoadAsset.deleteMany({});
    await User.deleteMany({});
    await DamageReport.deleteMany({});
    await MaintenanceSchedule.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const endUser = await User.create({
      username: 'yaswanth',
      email: 'yaswanth@gmail.com',
      password: 'yaswanth123', // Will be hashed by pre-save hook
      role: 'End User/Inspector',
      department: 'Road Inspection',
      contactNumber: '9876543210',
    });

    const manager = await User.create({
      username: 'tharun',
      email: 'tharun@gmail.com',
      password: 'tharun123',
      role: 'Maintenance Manager',
      department: 'Maintenance',
      contactNumber: '9876543211',
    });

    const admin = await User.create({
      username: 'sanjay',
      email: 'sanjay@gmail.com',
      password: 'sanjay123',
      role: 'Admin',
      department: 'Administration',
      contactNumber: '9876543212',
    });

    console.log('Created sample users');

    // Create sample road assets added by end users
    const sampleRoads = [
      {
        roadId: 'RD-001',
        roadName: 'Mumbai-Pune Highway',
        roadType: 'Highway',
        address: 'Pune-Mumbai Route, Maharashtra',
        location: {
          type: 'Point',
          coordinates: [73.8567, 19.0760], // Mumbai coordinates
        },
        condition: 'Good',
        createdBy: endUser._id,
      },
      {
        roadId: 'RD-002',
        roadName: 'Delhi Ring Road',
        roadType: 'Urban Street',
        address: 'Ring Road, Delhi',
        location: {
          type: 'Point',
          coordinates: [77.2245, 28.6139], // Delhi coordinates
        },
        condition: 'Fair',
        createdBy: endUser._id,
      },
      {
        roadId: 'RD-003',
        roadName: 'Bangalore-Airport Road',
        roadType: 'Highway',
        address: 'Bangalore to International Airport, Karnataka',
        location: {
          type: 'Point',
          coordinates: [77.7064, 13.1939], // Bangalore coordinates
        },
        condition: 'Excellent',
        createdBy: endUser._id,
      },
      {
        roadId: 'RD-004',
        roadName: 'Chennai Inner Ring Road',
        roadType: 'Urban Street',
        address: 'Inner Ring Road, Chennai',
        location: {
          type: 'Point',
          coordinates: [80.2707, 13.0827], // Chennai coordinates
        },
        condition: 'Poor',
        createdBy: endUser._id,
      },
      {
        roadId: 'RD-005',
        roadName: 'Kolkata Bypass',
        roadType: 'Rural Path',
        address: 'Eastern Metropolitan Bypass, Kolkata',
        location: {
          type: 'Point',
          coordinates: [88.3668, 22.5726], // Kolkata coordinates
        },
        condition: 'Critical',
        createdBy: endUser._id,
      },
      {
        roadId: 'RD-006',
        roadName: 'Ahmedabad-Vadodara Highway',
        roadType: 'Highway',
        address: 'National Highway 48, Gujarat',
        location: {
          type: 'Point',
          coordinates: [72.5458, 23.0225], // Ahmedabad coordinates
        },
        condition: 'Fair',
        createdBy: endUser._id,
      },
    ];

    const createdRoads = await RoadAsset.create(sampleRoads);
    console.log('Created sample road assets');

    // Create sample damage reports
    const sampleReports = [
      {
        roadAsset: createdRoads[0]._id, // Mumbai-Pune Highway
        reportedBy: endUser._id,
        damageType: 'Potholes',
        severity: 'High',
        description: 'Large potholes on highway causing traffic hazards',
        location: {
          type: 'Point',
          coordinates: [73.8567, 19.0760],
        },
        status: 'Scheduled',
      },
      {
        roadAsset: createdRoads[1]._id, // Delhi Ring Road
        reportedBy: endUser._id,
        damageType: 'Cracks',
        severity: 'Medium',
        description: 'Multiple cracks on road surface',
        location: {
          type: 'Point',
          coordinates: [77.2245, 28.6139],
        },
        status: 'In Progress',
      },
      {
        roadAsset: createdRoads[2]._id, // Bangalore-Airport Road
        reportedBy: endUser._id,
        damageType: 'Surface Deterioration',
        severity: 'Critical',
        description: 'Severe surface deterioration affecting road safety',
        location: {
          type: 'Point',
          coordinates: [77.7064, 13.1939],
        },
        status: 'Completed',
      },
      {
        roadAsset: createdRoads[3]._id, // Ahmedabad-Vadodara Highway
        reportedBy: endUser._id,
        damageType: 'Potholes',
        severity: 'Low',
        description: 'Small potholes that need attention',
        location: {
          type: 'Point',
          coordinates: [72.5458, 23.0225],
        },
        status: 'Scheduled',
      },
    ];

    const createdReports = await DamageReport.create(sampleReports);
    console.log('Created sample damage reports');

    // Create sample maintenance schedules
    const now = new Date();
    const sampleSchedules = [
      {
        damageReport: createdReports[0]._id,
        roadAsset: createdRoads[0]._id,
        scheduledDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTeam: manager._id,
        workDescription: 'Fill large potholes with bituminous concrete',
        estimatedCost: 15000,
        status: 'Scheduled',
      },
      {
        damageReport: createdReports[1]._id,
        roadAsset: createdRoads[1]._id,
        scheduledDate: now,
        assignedTeam: manager._id,
        workDescription: 'Seal cracks to prevent water infiltration',
        estimatedCost: 8500,
        status: 'In Progress',
      },
      {
        damageReport: createdReports[2]._id,
        roadAsset: createdRoads[2]._id,
        scheduledDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        assignedTeam: manager._id,
        workDescription: 'Resurface damaged area completely',
        estimatedCost: 45000,
        actualCost: 46500,
        status: 'Completed',
        completionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        notes: 'Work completed with minor additional cost due to ground preparation',
      },
      {
        damageReport: createdReports[3]._id,
        roadAsset: createdRoads[3]._id,
        scheduledDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        assignedTeam: manager._id,
        workDescription: 'Small pothole repair',
        estimatedCost: 3500,
        status: 'Scheduled',
      },
    ];

    const createdSchedules = await MaintenanceSchedule.create(sampleSchedules);
    console.log('Created sample maintenance schedules');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample Users Created:');
    console.log(`- End User: yaswanth / yaswanth@gmail.com`);
    console.log(`- Manager: tharun / tharun@gmail.com`);
    console.log(`- Admin: sanjay / sanjay@gmail.com`);
    console.log('\nSample Roads Created:');
    createdRoads.forEach((road) => {
      console.log(`- ${road.roadId}: ${road.roadName} (${road.roadType}) - ${road.condition}`);
    });
    console.log('\nSample Damage Reports Created:');
    createdReports.forEach((report) => {
      console.log(`- ${report.reportId}: ${report.damageType} (${report.severity})`);
    });
    console.log('\nSample Maintenance Schedules Created:');
    console.log(`- Scheduled: 2`);
    console.log(`- In Progress: 1`);
    console.log(`- Completed: 1`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
