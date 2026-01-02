import cloudinary from '../config/cloudinary.js';

class UploadService {
  // Upload single file
  async uploadFile(file, folder = 'elearning') {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      return {
        url: file.path,
        publicId: file.filename,
        format: file.format,
        resourceType: file.resource_type,
        size: file.bytes
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'image') {
    try {
      if (!publicId) {
        throw new Error('No public ID provided');
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      return result;
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      return files.map(file => ({
        url: file.path,
        publicId: file.filename,
        format: file.format,
        resourceType: file.resource_type,
        size: file.bytes,
        originalName: file.originalname
      }));
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Get file info
  async getFileInfo(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at
      };
    } catch (error) {
      throw new Error(`Get file info failed: ${error.message}`);
    }
  }

  // Extract public ID from Cloudinary URL
  extractPublicId(url) {
    try {
      if (!url) return null;
      
      // Extract public ID from Cloudinary URL
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      
      // Get the folder path
      const folderIndex = parts.indexOf('elearning');
      if (folderIndex !== -1) {
        const folderPath = parts.slice(folderIndex, -1).join('/');
        return `${folderPath}/${publicId}`;
      }
      
      return publicId;
    } catch (error) {
      console.error('Extract public ID error:', error);
      return null;
    }
  }
}

export default new UploadService();