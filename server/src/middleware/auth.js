import { verifyToken } from '../utils/jwt.js';
import authService from '../services/authService.js';
import bcrypt from 'bcryptjs';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Find user using service
    const user = await authService.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check if user is active
    if (!authService.isUserActive(user)) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Attach user to request (without password)
    req.user = authService.excludePassword(user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};


export const checkUpdatePassword = async (req, res, next) => {
    try {
        if (!req.data) {
            req.data = {};
        }
        
        const { oldPassword, password } = req.body;
        
        if (!oldPassword || !password) {
            return res.status(400).json({ 
                message: "Both current and new passwords are required" 
            });
        }
        
        if (!req.user.password) {
            const userPassword = await authService.getUserPassword(req.user.id);
            
            if (!userPassword) {
                return res.status(404).json({ 
                    message: "User not found" 
                });
            }
            
            req.user.password = userPassword;
        }
        
        const isMatch = await bcrypt.compare(oldPassword, req.user.password);
        if (!isMatch) {
            return res.status(403).json({ 
                message: "Current password is incorrect" 
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        req.data.password = hashedPassword;
        next();
    } catch (error) {
        console.error('Password check error:', error);
          if (error.message.includes('Illegal arguments')) {
            return res.status(500).json({ 
                message: "Password verification error" 
            });
        }
        
        next(error);
    }
};