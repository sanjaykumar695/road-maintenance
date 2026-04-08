# Quick Start Guide for Road Maintenance System

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas - update MONGODB_URI in backend/.env
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: **http://localhost:5000**

### 5. Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on: **http://localhost:3000**

## Access the Application

Open your browser and go to **http://localhost:3000**

## Test Login Credentials

Register new users with any username/password or use these test accounts:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | admin | admin123 | admin@test.com |
| Manager | manager | manager123 | manager@test.com |
| Inspector | inspector | inspector123 | inspector@test.com |

## Main Features to Try

1. **Dashboard** - View system overview and statistics
2. **Roads** - Add and manage road assets
3. **Reports** - Report damage and view reports
4. **Maintenance** - Schedule and track maintenance
5. **Map** - View all roads on interactive map

## Troubleshooting

### Backend won't start?
- Check if port 5000 is already in use
- Ensure MongoDB is running
- Check .env file configuration

### Frontend won't connect to backend?
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy setting in frontend package.json

### MongoDB connection fails?
- Start MongoDB: `mongod`
- Or update MONGODB_URI to use MongoDB Atlas cloud connection

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/road-maintenance
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

### Frontend
No .env file needed. Update API URL in `src/services/api.js` if backend is on different URL.

## Project Structure

```
fsd_project/
├── backend/          # Node.js/Express backend
├── frontend/         # React frontend
└── README.md        # Full documentation
```

## Next Steps

1. Create admin account first
2. Add road assets (as admin/manager)
3. Report damage (as inspector)
4. Schedule maintenance (as manager)
5. View everything on the map and dashboard

Enjoy using the Road Maintenance System!
