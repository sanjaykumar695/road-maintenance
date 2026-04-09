# Database and Road Management System Redesign

## Overview
The road management system has been completely redesigned with a simplified database schema and improved role-based accessibility. Only End Users/Inspectors can add new roads, while Admins and Managers can view and manage damage reports.

## Key Changes

### 1. Simplified RoadAsset Schema

#### Old Schema (Complex)
```
- roadId, name, section, type
- location with address nested
- length, width, assignedManager
- condition, conditionHistory
- budgetAllocation, lastMaintenanceDate
- purchaseOrders
```

#### New Schema (Simplified)
```
- roadId (Unique identifier)
- roadName (Name of the road)
- roadType (Highway, Urban Street, Bridge, Rural Path, Other)
- address (Complete road address)
- location (GeoJSON Point with coordinates)
- condition (Excellent, Good, Fair, Poor, Critical)
- createdBy (Reference to End User who added it)
- timestamps (createdAt, updatedAt)
```

### 2. Role-Based Road Management

#### End User/Inspector
✅ **Can:**
- Add new roads using a simplified form
- Click "📍 Get Location" button to auto-fetch current coordinates
- View all roads added by any end user
- Report damage on roads

❌ **Cannot:**
- Edit or delete roads
- View only damage they reported

#### Admin & Maintenance Manager
✅ **Can:**
- View all roads with details
- View all damage reports
- Assign damage reports to managers
- Update road condition
- Filter roads by type

❌ **Cannot:**
- Add new roads
- Delete roads (except Admin with explicit permissions)

### 3. Frontend Changes

#### Road Management Page (`RoadManagement.js`)
**New Features:**
- **Location Fetch Button**: Click "📍 Get Location" to automatically fetch user's current GPS coordinates
- **Simplified Form**: Only requires:
  - Road ID
  - Road Name
  - Road Type
  - Road Address
  - (Location auto-fills from GPS or manual entry)

**Display:**
- Shows roads in card format instead of table
- Displays Road ID, Name, Type, Address, Condition
- Shows who added the road (created by username)
- Filter by road type
- Auto-refresh every 30 seconds

#### Damage Reporting Page (`DamageReporting.js`)
**Updates:**
- Road selection dropdown now shows: `{roadId} - {roadName} ({address})`
- Organized form with labeled groups
- Clearer labels for all fields
- Optional coordinates (uses road's default location if not provided)

#### Dashboard
**Updates:**
- Road Assets Overview table shows:
  - Road ID, Name, Type, Address, Condition
  - Added By (the end user who added it)
- No longer shows "Manager" column (roads not assigned to managers)
- Real-time updates every 30 seconds

#### Map View (`MapView.js`)
**Updates:**
- Shows road popups with:
  - Road Name
  - Road ID
  - Type
  - Address
  - Condition
  - Added by (username)
- Auto-refresh every 30 seconds for newly added roads

### 4. Backend Changes

#### Road Controller Updates
**createRoad()**
```javascript
- Only End User/Inspector role allowed
- Simplified parameters: roadId, roadName, roadType, address, coordinates
- Sets condition to 'Fair' by default
- Records createdBy user ID
```

**updateRoadCondition()**
```javascript
- Only Admin/Manager can update condition
- Simple update: just change condition status
```

**getAllRoads()**
```javascript
- Filter by: roadType or condition
- Returns: all roads in system
- Includes createdBy user details
```

**deleteRoad()**
```javascript
- Admin only
- Removes road from system
```

#### Routes (`roads.js`)
```javascript
GET    /api/roads              - Get all roads (auth required)
GET    /api/roads/:id          - Get single road (auth required)
POST   /api/roads              - Create road (End User only)
PUT    /api/roads/:id/condition - Update condition (Admin/Manager only)
DELETE /api/roads/:id          - Delete road (Admin only)
GET    /api/roads/near         - Get roads near coordinates (auth required)
```

### 5. Database Seeding

#### New Seed Script (`seedDatabase.js`)
Automatically:
- Clears existing RoadAsset and User collections
- Creates sample users:
  - **End User**: inspector_john (inspector@example.com)
  - **Manager**: manager_mike (manager@example.com)
  - **Admin**: admin_anna (admin@example.com)
- Creates 6 sample road assets across major Indian cities:
  - RD-001: Mumbai-Pune Highway
  - RD-002: Delhi Ring Road
  - RD-003: Bangalore-Airport Road
  - RD-004: Chennai Inner Ring Road
  - RD-005: Kolkata Bypass
  - RD-006: Ahmedabad-Vadodara Highway

#### Run Seed Script
```bash
npm run seed
# or
node seedDatabase.js
```

### 6. Workflow Examples

#### End User Adding a Road
1. Navigate to "Road Assets Management" (Road Management page)
2. Click "📍 Add New Road" button
3. Fill in:
   - Road ID (e.g., RD-007)
   - Road Name (e.g., Hyderabad Outer Ring Road)
   - Road Type (select from dropdown)
   - Road Address
4. Click "📍 Get Location" to auto-fill coordinates
5. Click "Add Road" to submit
6. Confirmation message appears
7. Road appears immediately on map and in road list

#### Reporting Damage
1. Navigate to "Damage Reporting"
2. Click "📢 Report New Damage"
3. Select road from dropdown (shows address)
4. Select damage type (Potholes, Cracks, etc.)
5. Select severity (Low, Medium, High, Critical)
6. Enter description
7. Optionally add photo URL
8. Submit report
9. Damage appears on dashboard
10. Manager sees it in assignments

#### Manager Completing Work
1. Go to "My Assignments"
2. See pending assignments
3. Click "Accept" to accept
4. Click "Complete" to mark as done
5. Add completion notes
6. Click "Mark as Complete"
7. Work appears in "Recently Completed Work" on Dashboard
8. Admin/Inspector see activity in Activity Log

## Technical Details

### Coordinates Format
All roads use GeoJSON Point format:
```javascript
location: {
  type: "Point",
  coordinates: [longitude, latitude]  // Note: longitude first!
}
```

### Sample Coordinates Used in Seed Data
- Mumbai: [73.8567, 19.0760]
- Delhi: [77.2245, 28.6139]
- Bangalore: [77.7064, 13.1939]
- Chennai: [80.2707, 13.0827]
- Kolkata: [88.3668, 22.5726]
- Ahmedabad: [72.5458, 23.0225]

### Geolocation API
The "📍 Get Location" button uses HTML5 Geolocation API:
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const { latitude, longitude } = position.coords;
  // Auto-fills coordinates in form
});
```

## Database Changes Summary

| Field | Old Schema | New Schema | Change |
|-------|-----------|-----------|--------|
| roadId | ✓ | ✓ | Unchanged |
| name | ✓ | ✗ | Removed |
| roadName | ✗ | ✓ | **Added** |
| section | ✓ | ✗ | Removed |
| type | ✓ | ✗ | Removed |
| roadType | ✗ | ✓ | **Added** |
| address (nested) | ✓ | ✓ | Simplified to top level |
| length | ✓ | ✗ | Removed |
| width | ✓ | ✗ | Removed |
| assignedManager | ✓ | ✗ | Removed |
| condition | ✓ | ✓ | Unchanged |
| conditionHistory | ✓ | ✗ | Removed |
| budgetAllocation | ✓ | ✗ | Removed |
| lastMaintenanceDate | ✓ | ✗ | Removed |
| purchaseOrders | ✓ | ✗ | Removed |
| createdBy | ✓ | ✓ | Now required |

## Files Modified

### Backend
- ✅ `models/RoadAsset.js` - Simplified schema
- ✅ `controllers/roadAssetController.js` - Updated logic
- ✅ `routes/roads.js` - Updated routes
- ✅ `seedDatabase.js` - **NEW** - Database seeding script
- ✅ `package.json` - Added seed script

### Frontend
- ✅ `pages/RoadManagement.js` - Completely redesigned
- ✅ `pages/DamageReporting.js` - Updated road selection & form
- ✅ `pages/Dashboard.js` - Updated field names
- ✅ `pages/MapView.js` - Updated popup content
- ✅ `pages/MaintenanceScheduling.js` - Updated field names
- ✅ `pages/ManagerAssignments.js` - Updated field names
- ✅ `pages/Roads.css` - New styling for cards, location button
- ✅ `pages/DamageReporting.css` - Improved form layouts
- ✅ `components/ActivityLog.js` - Updated field names

## Testing Checklist

- [ ] Run `npm run seed` to populate database with sample data
- [ ] Login as inspector_john and add a new road with location
- [ ] Verify road appears on map and in road list
- [ ] Login as manager_mike and see road in assignments
- [ ] Report damage on a road as inspector
- [ ] Manager accepts and completes work
- [ ] Verify activity appears on Admin dashboard
- [ ] Filter roads by type
- [ ] Check that Manager/Admin cannot add roads
- [ ] Verify coordinates are correctly formatted [longitude, latitude]
- [ ] Test location button in multiple browsers
- [ ] Verify all role-based permissions work

## Notes

1. **Password Default**: All seed users have password "password123" - change these in production
2. **Coordinates**: Always use [longitude, latitude] format, not [latitude, longitude]
3. **Geolocation**: Requires HTTPS in production or localhost for testing
4. **Auto-refresh**: All pages auto-refresh at different intervals for real-time updates
5. **Backward Compatibility**: Old road data in database needs migration if using existing data
6. **Fresh Start**: Use `npm run seed` for fresh database with no old data conflicts
