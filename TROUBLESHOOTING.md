# Troubleshooting Guide

## Common Issues & Solutions

### Backend Issues

#### 1. MongoDB Connection Error

**Error Message:**
```
Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb

# Or if using MongoDB Atlas, verify connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/road-maintenance
```

#### 2. Port 5000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Option 1: Kill the process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell as Admin):
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Use different port
# Edit backend/.env:
PORT=5001
```

#### 3. JWT Secret Not Set

**Error Message:**
```
TypeError: Cannot read property 'sign' of undefined
```

**Solution:**
```bash
# Edit backend/.env and add:
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
```

#### 4. Environment Variables Not Loading

**Error Message:**
```
MONGODB_URI is undefined
```

**Solutions:**
```bash
# Verify .env exists in backend directory
# Restart the server after changing .env
npm run dev

# Check .env format (no quotes needed):
MONGODB_URI=mongodb://localhost:27017/road-maintenance
JWT_SECRET=your_secret
PORT=5000
```

#### 5. Module Not Found Errors

**Error Message:**
```
Cannot find module 'express'
```

**Solutions:**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# Or update npm
npm install -g npm@latest
npm install
```

---

### Frontend Issues

#### 1. Cannot Connect to Backend

**Error Message:**
```
Error: Network Error
localhost:5000 refused to connect
```

**Solutions:**
1. Ensure backend is running:
```bash
# In another terminal
cd backend
npm run dev
```

2. Verify proxy in `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```

3. Check API endpoint in `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

#### 2. Blank Page or 404 Error

**Solutions:**
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Restart frontend server
cd frontend
npm start

# Check console for errors (F12)
```

#### 3. npm start Hangs or Crashes

**Error Message:**
```
Something is wrong...
kill: no process found
```

**Solutions:**
```bash
# Kill any stray Node processes
# Windows (PowerShell): 
Get-Process node | Stop-Process

# macOS/Linux:
killall node

# Restart
npm start
```

#### 4. Dependencies Won't Install

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or delete lock file and reinstall
rm package-lock.json
npm install
```

#### 5. Page Refresh Causes 404

**Only in development (handled by Create React App)**

**Solutions:**
```bash
# For production deployment, configure server to:
# 1. Return index.html for all routes
# 2. Let React Router handle routing

# Example for Netlify (_redirects file):
/* /index.html 200
```

---

### Authentication Issues

#### 1. Cannot Login

**Solutions:**
1. Verify username and password are correct
2. Check database has users:
```bash
# In MongoDB shell
use road-maintenance
db.users.find()
```

3. Verify JWT token in localStorage:
```javascript
// In browser console
localStorage.getItem('token')
```

#### 2. Token Expired

**Error Message:**
```
Token is not valid
401 Unauthorized
```

**Solutions:**
1. Clear localStorage and login again:
```javascript
localStorage.removeItem('token')
```

2. Increase token expiry in `backend/controllers/authController.js`:
```javascript
const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
  expiresIn: '30d' // or '7d', '1h', etc.
});
```

#### 3. Role-Based Access Denied

**Error Message:**
```
Manager/Admin access required
403 Forbidden
```

**Solutions:**
- Login with correct role
- Verify user role in database
- Check role enum values match:
  - `Admin`
  - `Maintenance Manager`
  - `End User/Inspector`

---

### API Issues

#### 1. 400 Bad Request

**Solutions:**
1. Check all required fields are provided
2. Validate data types (numbers, dates, etc.)
3. Check field names match API documentation
4. Use JSON format with correct Content-Type header

#### 2. 404 Not Found

**Solutions:**
- Verify resource ID is correct
- Check resource exists in database
- Ensure correct MongoDB ObjectId format

#### 3. 500 Internal Server Error

**Solutions:**
1. Check backend console for error details
2. Verify database connection
3. Check for syntax errors in controllers
4. Review error logs

#### 4. Timeout Issues

**Solutions:**
```bash
# Increase request timeout in frontend/src/services/api.js
const response = await axios({
  ...config,
  timeout: 30000 // 30 seconds
});
```

---

### Database Issues

#### 1. MongoDB Atlas Connection Fails

**Solutions:**
```bash
# 1. Verify connection string format:
mongodb+srv://username:password@cluster.mongodb.net/dbname

# 2. Check username and password (URL encoded)
# 3. Whitelist IP in MongoDB Atlas:
#    - Go to Network Access
#    - Add IP address 0.0.0.0/0 (allows all)
#    - Or add your specific IP

# 4. Test connection
mongosh "your_connection_string"
```

#### 2. Data Not Persisting

**Solutions:**
1. Verify MongoDB is running
2. Check data was actually inserted:
```bash
mongosh
use road-maintenance
db.users.find()
db.roadassets.find()
```

3. Ensure data validation errors aren't preventing save:
```bash
# Check backend console for validation errors
```

#### 3. Collections Not Created

**Solutions:**
MongoDB creates collections automatically on first insert. If collections don't exist:

```bash
# Manually create collections
mongosh
use road-maintenance
db.createCollection("users")
db.createCollection("roadassets")
db.createCollection("damagereports")
db.createCollection("maintenanceschedules")
```

---

### Performance Issues

#### 1. Slow API Response

**Solutions:**
1. Add database indexes:
```bash
# In mongosh
use road-maintenance
db.users.createIndex({ username: 1 })
db.roadassets.createIndex({ type: 1 })
db.damagereports.createIndex({ severity: 1 })
```

2. Limit query results
3. Add pagination
4. Implement caching

#### 2. High Memory Usage

**Solutions:**
```bash
# Restart Node server
npm run dev

# Check for memory leaks in chrome://inspect

# Limit concurrent connections
# Implement connection pooling
```

#### 3. Map Loading Slowly

**Solutions:**
1. Lazy load Leaflet maps
2. Reduce number of markers displayed
3. Implement clustering for many points
4. Use lighter tile layers

---

### Deployment Issues

#### 1. Environment Variables Not Set

**Solutions:**
```bash
# Heroku
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_connection_string

# Netlify
# Go to Site Settings > Environment
# Add variables there
```

#### 2. Build Fails

**Solutions:**
```bash
# Frontend
npm run build

# Check for:
# - Missing dependencies
# - TypeScript errors (if applicable)
# - Broken imports

# Backend
# Verify all modules are installed
```

---

## Debug Mode

### Enable Verbose Logging

**Backend:**
```javascript
// Add to server.js
if (process.env.DEBUG) {
  mongoose.set('debug', true);
}
```

**Frontend:**
```javascript
// Add to src/services/api.js
if (process.env.REACT_APP_DEBUG) {
  console.log('Request:', config);
}
```

### Run with Debug Enabled

```bash
# Backend
DEBUG=* npm run dev

# Frontend
REACT_APP_DEBUG=true npm start
```

---

## Getting Help

1. **Check Error Messages**: Read the full error message carefully
2. **Search Online**: Google the error message
3. **Check Logs**: Look in terminal output and browser console
4. **Isolate Issue**: Determine if it's frontend, backend, or database
5. **Stack Overflow**: https://stackoverflow.com/
6. **GitHub Issues**: Check project GitHub repo

## Crisis Management

### Everything Broken? Start Fresh

```bash
# Windows:
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules
del backend\package-lock.json
del frontend\package-lock.json

# macOS/Linux:
rm -rf backend/node_modules frontend/node_modules
rm backend/package-lock.json frontend/package-lock.json

# Then restart
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm start
```

### Reset MongoDB

```bash
mongosh
# Show all characters
show databases
use road-maintenance
db.dropDatabase()
# Exit
exit
```

Then restart the application to recreate collections.
