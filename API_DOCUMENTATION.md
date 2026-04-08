# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register User
**POST** `/auth/register`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "End User/Inspector"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "End User/Inspector"
  }
}
```

### Login User
**POST** `/auth/login`

Request:
```json
{
  "username": "john_doe",
  "password": "securepass123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "End User/Inspector"
  }
}
```

### Get Current User
**GET** `/auth/me`

Auth Header:
```
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "End User/Inspector"
  }
}
```

## Road Assets

### Get All Roads
**GET** `/roads`

Query Parameters:
- `type`: Highway | Urban Street | Bridge | Rural Path | Other (optional)
- `condition`: Excellent | Good | Fair | Poor | Critical (optional)

Example:
```
GET /roads?type=Highway&condition=Critical
```

Response:
```json
{
  "success": true,
  "count": 2,
  "roads": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "roadId": "RD-001",
      "name": "Highway 5",
      "section": "North Section",
      "type": "Highway",
      "location": {
        "type": "Point",
        "coordinates": [78.9629, 20.5937],
        "address": "Mumbai-Delhi corridor"
      },
      "length": 150,
      "width": 12,
      "condition": "Critical",
      "budgetAllocation": 500000,
      "assignedManager": {
        "_id": "607f1f77bcf86cd799439012",
        "username": "manager1"
      }
    }
  ]
}
```

### Get Single Road
**GET** `/roads/:id`

Response:
```json
{
  "success": true,
  "road": { /* road object */ }
}
```

### Create Road
**POST** `/roads`

Requires: Manager or Admin role

Request:
```json
{
  "roadId": "RD-002",
  "name": "Highway 6",
  "section": "South Section",
  "type": "Highway",
  "coordinates": [77.2090, 28.6139],
  "address": "Delhi-Agra corridor",
  "length": 200,
  "width": 12,
  "budgetAllocation": 750000
}
```

Response:
```json
{
  "success": true,
  "road": { /* created road object */ }
}
```

### Update Road
**PUT** `/roads/:id`

Requires: Manager or Admin role

Request:
```json
{
  "condition": "Poor",
  "budgetAllocation": 600000
}
```

Response:
```json
{
  "success": true,
  "road": { /* updated road object */ }
}
```

### Update Road Condition
**PUT** `/roads/:id/condition`

Request:
```json
{
  "status": "Critical",
  "description": "Major potholes and surface damage detected"
}
```

Response:
```json
{
  "success": true,
  "road": { /* updated road with condition history */ }
}
```

### Delete Road
**DELETE** `/roads/:id`

Requires: Admin role

Response:
```json
{
  "success": true,
  "message": "Road deleted"
}
```

### Get Roads Near Coordinates
**GET** `/roads/near?longitude=78.9&latitude=20.6&maxDistance=5000`

Response:
```json
{
  "success": true,
  "count": 3,
  "roads": [ /* nearby roads */ ]
}
```

## Damage Reports

### Get All Reports
**GET** `/damage-reports`

Query Parameters:
- `status`: Reported | Under Review | Scheduled | In Progress | Completed | Closed
- `severity`: Low | Medium | High | Critical
- `roadAsset`: Road asset ID

Response:
```json
{
  "success": true,
  "count": 5,
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "reportId": "DR-1704067200000-abc123def",
      "roadAsset": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Highway 5"
      },
      "reportedBy": {
        "_id": "607f1f77bcf86cd799439014",
        "username": "inspector1"
      },
      "damageType": "Potholes",
      "severity": "High",
      "description": "Large potholes on the main lane",
      "status": "Reported",
      "reportDate": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Create Damage Report
**POST** `/damage-reports`

Request:
```json
{
  "roadAsset": "507f1f77bcf86cd799439011",
  "damageType": "Potholes",
  "severity": "High",
  "description": "Large potholes causing accidents",
  "coordinates": [78.9629, 20.5937],
  "photos": ["url1", "url2"]
}
```

Response:
```json
{
  "success": true,
  "report": { /* created report */ }
}
```

### Get Critical Reports
**GET** `/damage-reports/critical`

Requires: Manager or Admin role

Response:
```json
{
  "success": true,
  "count": 3,
  "reports": [ /* high/critical severity reports */ ]
}
```

### Update Damage Report
**PUT** `/damage-reports/:id`

Request:
```json
{
  "status": "Scheduled",
  "assignedTo": "607f1f77bcf86cd799439012"
}
```

Response:
```json
{
  "success": true,
  "report": { /* updated report */ }
}
```

## Maintenance Schedules

### Get All Schedules
**GET** `/maintenance-schedules`

Query Parameters:
- `status`: Scheduled | In Progress | Completed | Cancelled
- `roadAsset`: Road asset ID

Response:
```json
{
  "success": true,
  "count": 5,
  "schedules": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "scheduleId": "MS-1704067200000-xyz789",
      "damageReport": {
        "_id": "507f1f77bcf86cd799439013",
        "reportId": "DR-1704067200000-abc123def"
      },
      "roadAsset": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Highway 5"
      },
      "scheduledDate": "2024-01-15T10:00:00Z",
      "workDescription": "Fill potholes with hot asphalt",
      "estimatedCost": 5000,
      "status": "Scheduled",
      "materialsUsed": []
    }
  ]
}
```

### Create Maintenance Schedule
**POST** `/maintenance-schedules`

Requires: Manager or Admin role

Request:
```json
{
  "damageReport": "507f1f77bcf86cd799439013",
  "roadAsset": "507f1f77bcf86cd799439011",
  "scheduledDate": "2024-01-15T10:00:00Z",
  "assignedTeam": "607f1f77bcf86cd799439012",
  "workDescription": "Fill potholes with hot asphalt",
  "estimatedCost": 5000
}
```

Response:
```json
{
  "success": true,
  "schedule": { /* created schedule */ }
}
```

### Update Maintenance Schedule
**PUT** `/maintenance-schedules/:id`

Requires: Manager or Admin role

Request:
```json
{
  "status": "Completed",
  "actualCost": 4500,
  "materialsUsed": [
    {
      "name": "Hot Asphalt",
      "quantity": 10,
      "unit": "tons",
      "cost": 4000
    }
  ],
  "completionDate": "2024-01-15T14:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "schedule": { /* updated schedule */ }
}
```

### Get Maintenance Statistics
**GET** `/maintenance-schedules/stats`

Requires: Manager or Admin role

Response:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "completed": 7,
    "inProgress": 2,
    "totalExpenditure": 45000,
    "breakdown": [
      {
        "_id": "Completed",
        "count": 7,
        "totalCost": 35000
      },
      {
        "_id": "In Progress",
        "count": 2,
        "totalCost": 10000
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Manager/Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Road not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error message"
}
```

## Headers

All requests except login/register require:
```
Authorization: Bearer {token}
Content-Type: application/json
```
