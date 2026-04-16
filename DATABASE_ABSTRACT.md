# Database Abstract - Road Maintenance System

## 🗄️ Database Overview

**Database Type**: NoSQL (MongoDB)  
**Collections**: 4  
**Total Entities**: 4  
**Relationships**: 6 (1:N and 1:1)  
**Geospatial Support**: Yes (2D Sphere)  

---

## 📊 Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────┤

                              USER
                            ┌──────┐
                            │  _id │ (PK)
                            └──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    │ (1:N)     │ (1:N)    │ (1:N)
                    │          │          │
                    ▼          ▼          ▼
              ROADASSET   DAMAGEREPORT  MAINTENANCESCHEDULE
            (assignedManager) (reportedBy/assignedTo)  (assignedTeam)
                    │          │          │
                    │ (ref)    │ (ref)    │ (ref)
                    └──────────┼──────────┘
                               │
                            (1:N)
                               ▼
                         DAMAGEREPORT
                              │
                           (1:1)
                              ▼
                      MAINTENANCESCHEDULE


RELATIONSHIPS:
├─ User (1) ──────────→ (N) RoadAsset [assignedManager]
├─ User (1) ──────────→ (N) DamageReport [reportedBy/assignedTo]
├─ RoadAsset (1) ─────→ (N) DamageReport [roadAsset]
├─ DamageReport (1) ──→ (1) MaintenanceSchedule [damageReport]
└─ RoadAsset (1) ─────→ (N) MaintenanceSchedule [roadAsset]
```

---

## 🔑 Entities & Attributes

### 1. USER Entity

**Collection Name**: `users`  
**Primary Key**: `_id` (ObjectId)  
**Unique Keys**: `username`, `email`  

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Unique identifier |
| username | String | UNIQUE, REQUIRED, Length: 3-255 | Login username |
| email | String | UNIQUE, REQUIRED, Valid Email | User email address |
| password | String | REQUIRED, Min: 6 chars, Hashed | Bcrypt hashed password |
| role | String | ENUM: ['Admin', 'Maintenance Manager', 'End User/Inspector'] | User role/permission |
| isActive | Boolean | Default: true | Account status |
| department | String | Optional | Department assignment |
| contactNumber | String | Optional | Phone number |
| createdAt | Date | Default: now() | Record creation timestamp |
| updatedAt | Date | Default: now() | Last update timestamp |

**Constraints**:
- Username: 3-255 characters, alphanumeric + underscore
- Email: Valid email format
- Password: Minimum 6 characters (bcrypt salt 10)
- Role: Enum validation

**Indexes**:
```javascript
{ username: 1 } - UNIQUE
{ email: 1 } - UNIQUE
```

---

### 2. ROADASSET Entity

**Collection Name**: `roadassets`  
**Primary Key**: `_id` (ObjectId)  
**Unique Keys**: `roadId`  
**Foreign Keys**: `assignedManager` (references User._id), `createdBy` (references User._id)  

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Unique identifier |
| roadId | String | UNIQUE, REQUIRED | Road asset ID |
| name | String | REQUIRED | Road name |
| section | String | Optional | Road section/segment |
| type | String | ENUM: ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other'] | Road type |
| location.type | String | ENUM: ['Point'] | GeoJSON format |
| location.coordinates | Array[Numbers] | REQUIRED | [longitude, latitude] |
| location.address | String | Optional | Street address |
| length | Number | REQUIRED, Positive | Road length in km |
| width | Number | Optional, Positive | Road width in meters |
| assignedManager | ObjectId | Foreign Key → User._id | Manager reference |
| condition | String | ENUM: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'], Default: 'Fair' | Current condition |
| conditionHistory | Array[Object] | Optional | History records |
| conditionHistory.status | String | Enum condition | Status variant |
| conditionHistory.reportedDate | Date | Timestamp | When reported |
| conditionHistory.description | String | Optional | Reason for change |
| budgetAllocation | Number | Optional, Positive | Allocated budget |
| lastMaintenanceDate | Date | Optional | Last maintenance date |
| purchaseOrders | Array[Object] | Optional | PO records |
| purchaseOrders.poNumber | String | Unique per road | PO identifier |
| purchaseOrders.description | String | Optional | PO details |
| purchaseOrders.supplier | String | Optional | Supplier name |
| purchaseOrders.cost | Number | Optional, Positive | PO cost |
| purchaseOrders.status | String | Optional | PO status |
| purchaseOrders.orderDate | Date | Optional | Order timestamp |
| createdBy | ObjectId | Foreign Key → User._id | Creator reference |
| createdAt | Date | Default: now() | Creation timestamp |
| updatedAt | Date | Default: now() | Update timestamp |

**Constraints**:
- roadId: Non-empty, unique
- name: Non-empty string
- type: Must be from enum
- length: Positive number
- coordinates: Valid [longitude, latitude] pair
- Geospatial indexing enabled

**Indexes**:
```javascript
{ roadId: 1 } - UNIQUE
{ location: "2dsphere" } - GEOSPATIAL
{ type: 1 }
{ condition: 1 }
{ assignedManager: 1 }
```

---

### 3. DAMAGEREPORT Entity

**Collection Name**: `damagereports`  
**Primary Key**: `_id` (ObjectId)  
**Unique Keys**: `reportId`  
**Foreign Keys**: `roadAsset` (references RoadAsset._id), `reportedBy` (references User._id), `assignedTo` (references User._id)  

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Unique identifier |
| reportId | String | UNIQUE, Auto-generated | Format: "DR-{timestamp}-{random}" |
| roadAsset | ObjectId | REQUIRED, FK → RoadAsset._id | Associated road |
| reportedBy | ObjectId | REQUIRED, FK → User._id | Inspector/Reporter |
| damageType | String | ENUM: ['Potholes', 'Cracks', 'Surface Deterioration', 'Flooding', 'Subsidence', 'Other'] | Type of damage |
| severity | String | ENUM: ['Low', 'Medium', 'High', 'Critical'], REQUIRED | Severity level |
| description | String | REQUIRED, Non-empty | Damage description |
| location.type | String | ENUM: ['Point'] | GeoJSON format |
| location.coordinates | Array[Numbers] | Optional | [longitude, latitude] |
| photos | Array[String] | Optional | Photo URLs |
| status | String | ENUM: ['Reported', 'Under Review', 'Scheduled', 'In Progress', 'Completed', 'Closed'], Default: 'Reported' | Current status |
| alertSent | Boolean | Default: false | Alert notification flag |
| assignedTo | ObjectId | Optional, FK → User._id | Assigned manager |
| reportDate | Date | Default: now() | Report timestamp |
| createdAt | Date | Default: now() | Creation timestamp |
| updatedAt | Date | Default: now() | Update timestamp |

**Constraints**:
- damageType: Must be from enum
- severity: Must be from enum
- description: Non-empty string
- reportId: Auto-generated on save
- Auto-alerts: If severity is 'Critical' or 'High', alertSent set to true
- Auto-update: Updates associated RoadAsset condition to 'Critical'

**Indexes**:
```javascript
{ reportId: 1 } - UNIQUE
{ roadAsset: 1 }
{ reportedBy: 1 }
{ severity: 1 }
{ status: 1 }
```

---

### 4. MAINTENANCESCHEDULE Entity

**Collection Name**: `maintenanceschedules`  
**Primary Key**: `_id` (ObjectId)  
**Unique Keys**: `scheduleId`  
**Foreign Keys**: `damageReport` (references DamageReport._id), `roadAsset` (references RoadAsset._id), `assignedTeam` (references User._id)  

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| _id | ObjectId | Primary Key | Unique identifier |
| scheduleId | String | UNIQUE, Auto-generated | Format: "MS-{timestamp}-{random}" |
| damageReport | ObjectId | REQUIRED, FK → DamageReport._id | Associated damage |
| roadAsset | ObjectId | REQUIRED, FK → RoadAsset._id | Associated road |
| scheduledDate | Date | REQUIRED | Maintenance date |
| assignedTeam | ObjectId | Optional, FK → User._id | Team manager |
| workDescription | String | Optional | Work details |
| estimatedCost | Number | Optional, Positive | Estimated cost |
| actualCost | Number | Optional, Positive | Actual cost incurred |
| materialsUsed | Array[Object] | Optional | Material records |
| materialsUsed.name | String | Optional | Material name |
| materialsUsed.quantity | Number | Optional, Positive | Quantity used |
| materialsUsed.unit | String | Optional | Unit of measure |
| materialsUsed.cost | Number | Optional, Positive | Cost per unit |
| status | String | ENUM: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], Default: 'Scheduled' | Schedule status |
| completionDate | Date | Optional | Completion timestamp |
| notes | String | Optional | Additional notes |
| createdAt | Date | Default: now() | Creation timestamp |
| updatedAt | Date | Default: now() | Update timestamp |

**Constraints**:
- scheduledDate: Must be valid date/time
- estimatedCost: Positive number if provided
- scheduleId: Auto-generated on save
- Auto-updates: When status → 'Completed', updates DamageReport status to 'Completed'
- On creation: Updates DamageReport status to 'Scheduled'

**Indexes**:
```javascript
{ scheduleId: 1 } - UNIQUE
{ damageReport: 1 }
{ roadAsset: 1 }
{ status: 1 }
{ scheduledDate: 1 }
```

---

## 🔗 Relationship Details

### 1. User manages RoadAsset (1:N)
- **From**: User._id
- **To**: RoadAsset.assignedManager
- **Type**: One-to-Many
- **Cardinality**: 1 user can manage N roads
- **Optional**: Yes (assignedManager can be null)
- **Description**: A maintenance manager can be assigned to manage multiple road assets

### 2. User reports DamageReport (1:N)
- **From**: User._id
- **To**: DamageReport.reportedBy
- **Type**: One-to-Many
- **Cardinality**: 1 inspector can report N damages
- **Optional**: No (reportedBy is required)
- **Description**: An inspector creates damage reports for various roads

### 3. User assigned to DamageReport (1:N)
- **From**: User._id
- **To**: DamageReport.assignedTo
- **Type**: One-to-Many
- **Cardinality**: 1 manager can be assigned to N damage reports
- **Optional**: Yes (assignedTo can be null)
- **Description**: A manager can be assigned to review/handle multiple damage reports

### 4. RoadAsset has DamageReport (1:N)
- **From**: RoadAsset._id
- **To**: DamageReport.roadAsset
- **Type**: One-to-Many
- **Cardinality**: 1 road can have N damage reports
- **Optional**: No (roadAsset is required)
- **Description**: Each road asset can have multiple damage reports

### 5. DamageReport has MaintenanceSchedule (1:1)
- **From**: DamageReport._id
- **To**: MaintenanceSchedule.damageReport
- **Type**: One-to-One
- **Cardinality**: 1 damage has 1 maintenance schedule (optional)
- **Optional**: No (damageReport is required)
- **Description**: Each damage report is addressed by one maintenance schedule

### 6. RoadAsset has MaintenanceSchedule (1:N)
- **From**: RoadAsset._id
- **To**: MaintenanceSchedule.roadAsset
- **Type**: One-to-Many
- **Cardinality**: 1 road can have N maintenance schedules
- **Optional**: No (roadAsset is required)
- **Description**: Each road asset can have multiple maintenance schedules

---

## 📈 Cardinality Matrix

| From Entity | To Entity | Relationship | Cardinality | Type |
|-------------|-----------|--------------|-------------|------|
| User | RoadAsset | manages | 1:N | Optional |
| User | DamageReport | reports | 1:N | Required |
| User | DamageReport | assigned to | 1:N | Optional |
| RoadAsset | DamageReport | has | 1:N | Required |
| DamageReport | MaintenanceSchedule | has | 1:1 | Required |
| RoadAsset | MaintenanceSchedule | has | 1:N | Required |

---

## 🔐 Constraint Summary

### PRIMARY KEYS
- User._id
- RoadAsset._id
- DamageReport._id
- MaintenanceSchedule._id

### UNIQUE CONSTRAINTS
- User.username
- User.email
- RoadAsset.roadId
- DamageReport.reportId
- MaintenanceSchedule.scheduleId

### FOREIGN KEYS
- RoadAsset.assignedManager → User._id
- RoadAsset.createdBy → User._id
- DamageReport.roadAsset → RoadAsset._id
- DamageReport.reportedBy → User._id
- DamageReport.assignedTo → User._id
- MaintenanceSchedule.damageReport → DamageReport._id
- MaintenanceSchedule.roadAsset → RoadAsset._id
- MaintenanceSchedule.assignedTeam → User._id

### CHECK CONSTRAINTS (ENUMS)
- User.role ∈ ['Admin', 'Maintenance Manager', 'End User/Inspector']
- RoadAsset.type ∈ ['Highway', 'Urban Street', 'Bridge', 'Rural Path', 'Other']
- RoadAsset.condition ∈ ['Excellent', 'Good', 'Fair', 'Poor', 'Critical']
- DamageReport.damageType ∈ ['Potholes', 'Cracks', 'Surface Deterioration', 'Flooding', 'Subsidence', 'Other']
- DamageReport.severity ∈ ['Low', 'Medium', 'High', 'Critical']
- DamageReport.status ∈ ['Reported', 'Under Review', 'Scheduled', 'In Progress', 'Completed', 'Closed']
- MaintenanceSchedule.status ∈ ['Scheduled', 'In Progress', 'Completed', 'Cancelled']

---

## 🚀 Auto-Generated Values

### reportId (DamageReport)
**Pattern**: `DR-{timestamp}-{random}`  
**Generation**: Mongoose pre-save hook  
**Example**: `DR-1713275400000-a7f3k2`

### scheduleId (MaintenanceSchedule)
**Pattern**: `MS-{timestamp}-{random}`  
**Generation**: Mongoose pre-save hook  
**Example**: `MS-1713275400000-b9f4m5`

---

## 🗂️ Embedded vs Referenced

### Embedded Arrays (Denormalized)
- **RoadAsset.conditionHistory[]** - Historical record of condition changes
- **RoadAsset.purchaseOrders[]** - Associated purchase orders
- **MaintenanceSchedule.materialsUsed[]** - Materials consumed

### Referenced Fields (Normalized)
- **RoadAsset.assignedManager** → User._id (Reference)
- **RoadAsset.createdBy** → User._id (Reference)
- **DamageReport.roadAsset** → RoadAsset._id (Reference)
- **DamageReport.reportedBy** → User._id (Reference)
- **DamageReport.assignedTo** → User._id (Reference)
- **MaintenanceSchedule.damageReport** → DamageReport._id (Reference)
- **MaintenanceSchedule.roadAsset** → RoadAsset._id (Reference)
- **MaintenanceSchedule.assignedTeam** → User._id (Reference)

---

## 📍 Geospatial Support

### Collections with Geospatial Data
1. **RoadAsset.location** - Road coordinates
2. **DamageReport.location** - Damage location coordinates

### GeoJSON Format
```javascript
{
  type: "Point",
  coordinates: [longitude, latitude]
}
```

### Geospatial Indexes
```javascript
db.roadassets.createIndex({ "location": "2dsphere" })
db.damagereports.createIndex({ "location": "2dsphere" })
```

### Supported Queries
- Proximity queries (roads near coordinates)
- Distance calculations
- Polygon containment checks

---

## 📊 Data Flow & Dependencies

```
User Registration
        ↓
    User Entity Created
        ├─→ Road Manager creates RoadAsset
        │                  ↓
        │          RoadAsset Stored in DB
        │                  ↓
        └─→ Inspector detects damage
                   ↓
            DamageReport Created
                   ├─→ Checks Severity
                   │     ├─→ If Critical/High → Alert Sent
                   │     └─→ Updates RoadAsset.condition
                   │
                   └─→ Manager Reviews
                        ↓
                   Creates MaintenanceSchedule
                        ├─→ Allocates Team
                        ├─→ Estimates Cost
                        └─→ Tracks Materials
                             ↓
                        Updates DamageReport Status
                             ↓
                        Marks as Completed
```

---

## 🔍 Query Patterns

### Common Queries

**1. Find all roads for a manager**
```javascript
{ assignedManager: ObjectId }
```

**2. Find critical/high damage reports**
```javascript
{ severity: { $in: ['Critical', 'High'] } }
```

**3. Find damage reports for a road**
```javascript
{ roadAsset: ObjectId }
```

**4. Find active maintenance schedules**
```javascript
{ status: { $in: ['Scheduled', 'In Progress'] } }
```

**5. Find roads near coordinates**
```javascript
{
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lon, lat] },
      $maxDistance: 5000 // meters
    }
  }
}
```

---

## 📋 Collection Statistics

| Collection | Est. Records | Avg. Doc Size | Indexes | Growth |
|------------|--------------|---------------|---------|--------|
| User | 50-500 | ~300 bytes | 3 | Slow |
| RoadAsset | 100-1000 | ~1 KB | 5 | Slow |
| DamageReport | 500-5000 | ~500 bytes | 5 | Fast |
| MaintenanceSchedule | 400-4000 | ~600 bytes | 5 | Fast |

---

## 🛡️ Data Integrity Rules

1. **Orphan Prevention**: Before deleting a User, check for associated RoadAssets and DamageReports
2. **Cascade Updates**: When DamageReport status changes, update linked MaintenanceSchedule
3. **Status Transitions**: Only valid status transitions are allowed
4. **Historical Accuracy**: conditionHistory records are append-only
5. **Cost Integrity**: actualCost cannot be negative
6. **Date Validation**: scheduledDate must be future date, completionDate ≥ scheduledDate

---

## 📌 Summary

This database abstract provides a complete blueprint for creating an Entity-Relationship Diagram (ERD). It includes:

✅ All 4 entities with complete attribute definitions  
✅ All data types and constraints  
✅ Primary and foreign key relationships  
✅ Cardinality specifications (1:1, 1:N)  
✅ Unique and check constraints  
✅ Geospatial support details  
✅ Index specifications  
✅ Auto-generation patterns  
✅ Data flow dependencies  
✅ Query patterns  

**Use this document as the foundation for your ER Diagram** in tools like:
- Lucidchart
- Draw.io
- Microsoft Visio
- DBeaver
- MySQL Workbench
- Eraser.io

---

**Document Created**: April 2026  
**Database Type**: MongoDB (NoSQL)  
**Schema Version**: 1.0
