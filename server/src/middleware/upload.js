import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import path from 'path';

// File type validation
const fileFilter = (req, file, cb) => {
  // Allowed image extensions
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed video extensions
  const videoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  // Allowed document extensions
  const documentTypes = /pdf|doc|docx|txt|ppt|pptx|xls|xlsx/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  console.log('File filter - fieldname:', file.fieldname, 'mimetype:', mimetype, 'extname:', extname);

  if (file.fieldname === 'image' || file.fieldname === 'thumbnail') {
    const isValidImage = imageTypes.test(extname) && mimetype.startsWith('image/');
    if (isValidImage) {
      return cb(null, true);
    } else {
      return cb(new Error(`Only image files are allowed (jpeg, jpg, png, gif, webp). Received: ${extname} with mimetype: ${mimetype}`));
    }
  }

  if (file.fieldname === 'video') {
    const isValidVideo = videoTypes.test(extname) && mimetype.startsWith('video/');
    if (isValidVideo) {
      return cb(null, true);
    } else {
      return cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, mkv)'));
    }
  }

  if (file.fieldname === 'document' || file.fieldname === 'resource' || file.fieldname === 'resources') {
    const isValidDocument = documentTypes.test(extname);
    if (isValidDocument) {
      return cb(null, true);
    } else {
      return cb(new Error('Only document files are allowed (pdf, doc, docx, txt, ppt, xls)'));
    }
  }

  // Default: accept the file if fieldname doesn't match known types
  console.log('File filter - accepting file with fieldname:', file.fieldname);
  cb(null, true);
};

// Storage for images (course thumbnails, profile pictures)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Storage for videos (course lessons)
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
  }
});

// Storage for documents (resources, PDFs)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elearning/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx']
  }
});

// Upload middleware for images
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Upload middleware for videos
export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

// Upload middleware for documents
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

// Multiple files upload
export const uploadMultiple = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB for images.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please use the correct field name.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    // Check if it's a file validation error
    if (error.message && error.message.includes('Only image files')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
  
  next();
};