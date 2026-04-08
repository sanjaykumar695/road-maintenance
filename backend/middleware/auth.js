const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

const managerAuth = (req, res, next) => {
  auth(req, res, () => {
    if (!['Admin', 'Maintenance Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Manager/Admin access required' });
    }
    next();
  });
};

module.exports = { auth, adminAuth, managerAuth };
