# Road Maintenance Record-Keeping System

A comprehensive MERN stack application for tracking road maintenance, enabling damage reporting, repair scheduling, and resource allocation with real-time updates and GIS mapping.

## Features

- **User Authentication**: Simple username/password/role-based login
  - Admin: Full system control
  - Maintenance Manager: Asset and schedule management
  - End User/Inspector: Damage reporting
  
- **Road Asset Management**: Record and manage road details
  - Unique ID, name, section, type, and location (geo-coordinates)
  - Condition history and budget allocation
  - Purchase order tracking
  
- **Damage Detection & Alerts**: 
  - Damage reporting with photos/description
  - Automatic alert generation for critical damage
  - Real-time status updates
  
- **Maintenance Scheduling**: 
  - Schedule appointments with teams
  - Track expenditure (cost, materials, dates)
  - Maintenance completion tracking
  
- **Dashboards**: 
  - Complete overview of road assets
  - Filter by type (highways, urban streets, bridges, rural paths)
  - Critical alerts and status monitoring
  
- **GIS Integration**: 
  - Interactive map view of all road assets
  - Location-based queries

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

### Frontend
- **UI Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Mapping**: Leaflet & React-Leaflet
- **Styling**: CSS3

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas connection)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/road-maintenance
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```
The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## Database Setup

### MongoDB Connection
The application uses MongoDB for data persistence. Ensure MongoDB is running:

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
Update the `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/road-maintenance
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Road Assets
- `GET /api/roads` - Get all roads (with filters)
- `GET /api/roads/:id` - Get specific road
- `POST /api/roads` - Create new road (Manager+)
- `PUT /api/roads/:id` - Update road (Manager+)
- `PUT /api/roads/:id/condition` - Update road condition
- `DELETE /api/roads/:id` - Delete road (Admin)
- `GET /api/roads/near` - Get roads near coordinates

### Damage Reports
- `GET /api/damage-reports` - Get all reports (with filters)
- `GET /api/damage-reports/:id` - Get specific report
- `POST /api/damage-reports` - Create damage report
- `PUT /api/damage-reports/:id` - Update report
- `GET /api/damage-reports/critical` - Get critical reports (Manager+)

### Maintenance Schedules
- `GET /api/maintenance-schedules` - Get all schedules
- `GET /api/maintenance-schedules/:id` - Get specific schedule
- `POST /api/maintenance-schedules` - Create schedule (Manager+)
- `PUT /api/maintenance-schedules/:id` - Update schedule (Manager+)
- `GET /api/maintenance-schedules/stats` - Get statistics (Manager+)

## User Roles & Permissions

### Admin
- View all road assets and reports
- Create and manage road assets
- Schedule maintenance
- View all schedules and statistics
- Manage system settings

### Maintenance Manager
- View assigned road assets
- Create and manage road assets
- Schedule and manage maintenance
- View reports and statistics
- Update damage status

### End User/Inspector
- View dashboard
- Report damage with photos/description
- View their own reports
- View road asset information

## Project Structure

```
fsd_project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── RoadAsset.js
│   │   ├── DamageReport.js
│   │   └── MaintenanceSchedule.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roadAssetController.js
│   │   ├── damageReportController.js
│   │   └── maintenanceController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── roads.js
│   │   ├── damageReports.js
│   │   └── maintenance.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── ProtectedRoute.js
    │   │   └── *.css
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── RoadManagement.js
    │   │   ├── DamageReporting.js
    │   │   ├── MaintenanceScheduling.js
    │   │   ├── MapView.js
    │   │   └── *.css
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── package.json
    └── README.md
```

## Usage Guide

### 1. User Registration
- Go to `/register`
- Fill in username, email, password
- Select role (Admin, Maintenance Manager, End User/Inspector)
- Click Register
- You'll be logged in automatically

### 2. Dashboard
- View summary statistics
- See recent road assets
- View critical damage reports (if Manager/Admin)

### 3. Road Management
- View all road assets with filtering
- Create new road (Manager+)
- Update road condition
- View location on map

### 4. Damage Reporting
- Report new damage with photos
- Specify severity level
- System auto-alerts for critical damage

### 5. Maintenance Scheduling
- Create maintenance schedules from damage reports
- Track work progress
- Record expenditure and materials
- View maintenance statistics

### 6. Maps
- View all roads on interactive map
- Click markers for detailed road information
- Check condition status with color coding

## Color Coding

### Road Condition
- Green: Excellent/Good
- Yellow: Fair
- Orange: Poor
- Red: Critical

### Damage Severity
- Green: Low
- Yellow: Medium
- Orange: High
- Red: Critical

## Default Test Credentials

You can create accounts with any username/password. Some test scenarios:

**Admin Account:**
- Username: admin
- Password: admin123
- Role: Admin

**Manager Account:**
- Username: manager
- Password: manager123
- Role: Maintenance Manager

**Inspector Account:**
- Username: inspector
- Password: inspector123
- Role: End User/Inspector

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access if using MongoDB Atlas

### Port Already in Use
```bash
# Change port in .env or kill process using the port
```

### Frontend can't connect to Backend
- Ensure backend is running on port 5000
- Check proxy in frontend `package.json`
- Verify CORS settings in backend

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

1. **Database Indexing**: Ensure MongoDB indexes are created for frequent queries
2. **Pagination**: Consider adding pagination for large datasets
3. **Caching**: Implement caching for static road data
4. **Lazy Loading**: Load maps only when needed

## Security Recommendations

1. Change `JWT_SECRET` in production
2. Use environment variables for sensitive data
3. Enable HTTPS in production
4. Implement rate limiting
5. Add input validation on frontend
6. Use MongoDB authentication

## Future Enhancements

- Email notifications for alerts
- Real-time updates using WebSockets
- Advanced analytics and reporting
- Mobile app
- AI-based damage detection from satellite imagery
- Budget forecasting
- Automated work order generation
- Multi-language support
- PDF report generation

## Contributing

Feel free to fork and submit pull requests with improvements.

## License

This project is open source.

## Support

For issues and questions, please contact the development team.
