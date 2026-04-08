# Database Schema Documentation

## User Model

```javascript
{
  _id: ObjectId,
  username: String (unique, required, min 3 chars),
  email: String (unique, required, valid email format),
  password: String (hashed, required, min 6 chars),
  role: String (enum: ['Admin', 'Maintenance Manager', 'End User/Inspector']),
  isActive: Boolean (default: true),
  department: String,
  contactNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

## RoadAsset Model

```javascript
{
  _id: ObjectId,
  roadId: String (unique, required),
  name: String (required),
  section: String,
  type: String (enum: ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other']),
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number] // [longitude, latitude]
    address: String
  },
  length: Number (required, in km),
  width: Number (in meters),
  assignedManager: ObjectId (ref: User),
  condition: String (enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'], default: 'Fair'),
  conditionHistory: [
    {
      status: String,
      reportedDate: Date,
      description: String
    }
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
      orderDate: Date
    }
  ],
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- Geospatial index on `location.coordinates` for proximity queries

## DamageReport Model

```javascript
{
  _id: ObjectId,
  reportId: String (unique, auto-generated format: "DR-{timestamp}-{random}"),
  roadAsset: ObjectId (ref: RoadAsset, required),
  reportedBy: ObjectId (ref: User, required),
  damageType: String (enum: ['Potholes', 'Cracks', 'Surface Deterioration', 'Flooding', 'Subsidence', 'Other']),
  severity: String (enum: ['Low', 'Medium', 'High', 'Critical'], required),
  description: String (required),
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number] // [longitude, latitude]
  },
  photos: [String] (array of photo URLs),
  status: String (enum: ['Reported', 'Under Review', 'Scheduled', 'In Progress', 'Completed', 'Closed'], default: 'Reported'),
  alertSent: Boolean (default: false),
  assignedTo: ObjectId (ref: User),
  reportDate: Date (default: current date),
  createdAt: Date,
  updatedAt: Date
}
```

**Behavior:**
- Automatically generates unique `reportId` before saving
- If severity is 'Critical' or 'High', sets `alertSent` to true
- Updates associated road condition to 'Critical'

## MaintenanceSchedule Model

```javascript
{
  _id: ObjectId,
  scheduleId: String (unique, auto-generated format: "MS-{timestamp}-{random}"),
  damageReport: ObjectId (ref: DamageReport, required),
  roadAsset: ObjectId (ref: RoadAsset, required),
  scheduledDate: Date (required),
  assignedTeam: ObjectId (ref: User),
  workDescription: String,
  estimatedCost: Number,
  actualCost: Number,
  materialsUsed: [
    {
      name: String,
      quantity: Number,
      unit: String,
      cost: Number
    }
  ],
  status: String (enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], default: 'Scheduled'),
  completionDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Behavior:**
- Automatically generates unique `scheduleId` before saving
- When status changes to 'Completed', updates associated damage report status to 'Completed'
- Updates associated damage report status to 'Scheduled' on creation

## Database Design Patterns

### Relationships
- **User → RoadAsset**: One manager can manage many roads (1:N)
- **User → DamageReport**: One inspector can report many damages (1:N)
- **RoadAsset → DamageReport**: One road can have many damage reports (1:N)
- **DamageReport → MaintenanceSchedule**: One damage can have one schedule (1:1)

### Geospatial Queries
Road assets use GeoJSON format for location data:
```javascript
location: {
  type: "Point",
  coordinates: [longitude, latitude]
}
```

Enable with index: `db.roadassets.createIndex({ "location": "2dsphere" })`

### Denormalization Patterns
- `DamageReport` stores reference to `RoadAsset` and `User` (avoided embedding for flexibility)
- `MaintenanceSchedule` references both `DamageReport` and `RoadAsset`

### Data Integrity
- `conditionHistory` captures all condition updates
- `purchaseOrders` stores all historical POs for road
- Damage reports are never deleted, only status is closed
- Maintenance schedules maintain audit trail

## Indexes for Performance

```javascript
// User indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })

// Road Asset indexes
db.roadassets.createIndex({ roadId: 1 }, { unique: true })
db.roadassets.createIndex({ "location": "2dsphere" })
db.roadassets.createIndex({ type: 1 })
db.roadassets.createIndex({ condition: 1 })
db.roadassets.createIndex({ assignedManager: 1 })

// Damage Report indexes
db.damagereports.createIndex({ reportId: 1 }, { unique: true })
db.damagereports.createIndex({ roadAsset: 1 })
db.damagereports.createIndex({ reportedBy: 1 })
db.damagereports.createIndex({ severity: 1 })
db.damagereports.createIndex({ status: 1 })

// Maintenance Schedule indexes
db.maintenanceschedules.createIndex({ scheduleId: 1 }, { unique: true })
db.maintenanceschedules.createIndex({ damageReport: 1 })
db.maintenanceschedules.createIndex({ roadAsset: 1 })
db.maintenanceschedules.createIndex({ status: 1 })
db.maintenanceschedules.createIndex({ scheduledDate: 1 })
```

## Data Validation Rules

### User
- Username: 3-255 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Minimum 6 characters (hashed with bcrypt salt 10)
- Role: One of enum values

### RoadAsset
- roadId: Non-empty, unique
- name: Non-empty string
- type: Must be from enum
- length: Positive number
- coordinates: Valid [longitude, latitude] pair

### DamageReport
- damageType: Must be from enum
- severity: Must be from enum
- description: Non-empty string
- coordinates: Valid [longitude, latitude] pair

### MaintenanceSchedule
- scheduledDate: Must be valid date/time
- estimatedCost: Positive number if provided
