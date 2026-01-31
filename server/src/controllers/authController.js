import { generateTokens, verifyToken } from '../utils/jwt.js';
import authService from '../services/authService.js';
import userService from '../services/userService.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      });
    }

    // Check if user already exists
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Create user (service handles hashing and db operations)
    const user = await authService.createUser({
      email,
      password,
      firstName,
      lastName,
      role
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Check if account is active
    if (!authService.isUserActive(user)) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // Update last login
    await authService.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    const userWithoutPassword = authService.excludePassword(user);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await userService.getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user data.'
    });
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.'
      });
    }

    // Check if user exists and is active
    const user = await authService.findUserById(decoded.userId);
    if (!user || !authService.isUserActive(user)) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error refreshing token.'
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side handles token removal)
 * @access  Private
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const userId = req.user.id;

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;

    // Update user profile
    const user = await userService.updateUserProfile(userId, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};

/**
 * @route   PUT /api/auth/profile/details
 * @desc    Update user profile details (phone, country, city, etc.)
 * @access  Private
 */
export const updateProfileDetails = async (req, res) => {
  try {
    const { phoneNumber, country, city, dateOfBirth } = req.body;
    const userId = req.user.id;

    // Prepare update data
    const updateData = {};
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
      updateData.dateOfBirth = new Date(dateOfBirth);
    } else if (dateOfBirth === null || dateOfBirth === '') {
      updateData.dateOfBirth = null;
    }

    // Update or create profile details
    await userService.updateUserProfileDetails(userId, updateData);

    // Get updated user profile
    const user = await userService.getUserProfile(userId);

    res.json({
      success: true,
      message: 'Profile details updated successfully.',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile details.'
    });
  }
};


export const updatePassword = async (req, res, next) => {
    try {
        const result = await userService.updatePasswordById(
            req.user.id,
            req.data.password
        );
        res.json(result);
    } catch (error) {
        next(error);
    }
};