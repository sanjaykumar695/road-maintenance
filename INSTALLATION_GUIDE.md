# Installation & Setup Guide

## Prerequisites

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4 or higher (local or Atlas)
- **Git**: (optional, for version control)

### Verify Installation
```bash
node --version      # Should be v14+
npm --version       # Should be v6+
mongo --version     # Should be v4.4+
```

## Step 1: Install MongoDB

### Option A: Local MongoDB Installation

#### Windows
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer and follow the installation wizard
3. Choose "Install MongoDB as a Service" for auto-start
4. Verify installation: `mongod --version`
5. MongoDB runs on default port 27017

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl status mongodb
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get connection string (format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`)
5. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/road-maintenance
```

## Step 2: Clone/Setup Project

### Using Git
```bash
git clone <repository-url>
cd fsd_project
```

### Manual Setup
Extract the project files and navigate to `fsd_project` directory.

## Step 3: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
# On Windows:
echo. > .env
# On macOS/Linux:
touch .env

# Edit .env and add:
MONGODB_URI=mongodb://localhost:27017/road-maintenance
JWT_SECRET=your_super_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

### Verify Backend Setup
```bash
# Test the connection
npm run dev
# You should see: "Server started on port 5000" and "MongoDB Connected"
```

Press `Ctrl+C` to stop the server.

## Step 4: Setup Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# No .env file needed, proxy is configured in package.json
```

### Verify Frontend Setup
```bash
# This will open http://localhost:3000 in your browser
npm start
```

## Step 5: Running the Application

### Terminal 1: Start MongoDB
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, skip this step
```

### Terminal 2: Start Backend
```bash
cd backend
npm run dev
# Output: Server started on port 5000
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm start
# Output: Ready on http://localhost:3000
```

## Accessing the Application

Open your browser to: **http://localhost:3000**

### First Time Setup
1. Click "Register"
2. Create your first admin account
3. Login with these credentials
4. Start adding road assets and managing maintenance

## Production Deployment

### Backend Deployment (Heroku Example)
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret
heroku config:set MONGODB_URI=your_atlas_connection_string

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify Example)
```bash
# Create optimized build
cd frontend
npm run build

# Connect to Netlify via UI or CLI
# Update API endpoint in src/services/api.js to production URL
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Database connection string | `mongodb://localhost:27017/road-maintenance` |
| `JWT_SECRET` | Secret key for JWT tokens | Long random string (minimum 32 characters) |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |

### Frontend

Configure API endpoint in `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api'; // Development
// Change to production URL when deployed
```

## Troubleshooting Installation

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
# macOS/Linux:
sudo systemctl status mongodb

# Windows:
net start MongoDB

# Or check MongoDB Atlas connection string format
```

### Port Already in Use
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### npm Install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Node Version Issues
```bash
# Check current version
node --version

# Update Node.js
# Download from https://nodejs.org/

# Or use nvm (Node Version Manager)
nvm install 16
nvm use 16
```

### CORS Errors
- Ensure backend is running on port 5000
- Check proxy setting in frontend `package.json`
- Verify `cors()` middleware in backend `server.js`

### Frontend can't find backend
```bash
# Verify backend is running
curl http://localhost:5000/api/health
# Should respond: {"message": "Server is running"}

# Check frontend logs for error details
# Update API URL if needed in src/services/api.js
```

## Verification Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created in backend with correct values
- [ ] MongoDB connection successful (check at startup)
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access http://localhost:3000 in browser
- [ ] Can register and login with new account

## Next Steps

1. Read [QUICKSTART.md](QUICKSTART.md) for quick start guide
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
3. Review [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for data structure
4. Read [README.md](README.md) for full documentation
5. Try creating sample data (roads, damage reports, etc.)

## Support & Help

### Additional Resources
- MongoDB Documentation: https://docs.mongodb.com/
- Express.js Guide: https://expressjs.com/
- React Documentation: https://react.dev/
- Node.js Documentation: https://nodejs.org/docs/

### Common Issues Discussion
- Check terminal output for error messages
- Enable debug logging
- Review browser console (F12) for frontend errors
- Check MongoDB Compass for database status

## Performance Tips

1. **Database**: Add indexes for frequently queried fields
2. **API**: Use pagination for large datasets
3. **Frontend**: Lazy load components and images
4. **Caching**: Implement Redis for session data
5. **Monitoring**: Setup error tracking (Sentry, etc.)
