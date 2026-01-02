import uploadService from '../services/uploadService.js';
import courseService from '../services/courseService.js';
import prisma from '../config/database.js';

// @desc    Upload course thumbnail
// @route   POST /api/upload/course/:courseId/thumbnail
// @access  Private (Instructor)
export const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { courseId } = req.params;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete old thumbnail if exists
    if (course.thumbnailImage) {
      const oldPublicId = uploadService.extractPublicId(course.thumbnailImage);
      if (oldPublicId) {
        await uploadService.deleteFile(oldPublicId, 'image');
      }
    }

    // Upload new thumbnail
    const fileInfo = await uploadService.uploadFile(req.file);

    // Update course with new thumbnail
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { thumbnailImage: fileInfo.url }
    });

    res.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        url: fileInfo.url,
        course: updatedCourse
      }
    });
  } catch (error) {
    console.error('Upload thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload course preview video
// @route   POST /api/upload/course/:courseId/preview-video
// @access  Private (Instructor)
export const uploadCoursePreviewVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { courseId } = req.params;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete old video if exists
    if (course.previewVideo) {
      const oldPublicId = uploadService.extractPublicId(course.previewVideo);
      if (oldPublicId) {
        await uploadService.deleteFile(oldPublicId, 'video');
      }
    }

    // Upload new video
    const fileInfo = await uploadService.uploadFile(req.file);

    // Update course with new video
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { previewVideo: fileInfo.url }
    });

    res.json({
      success: true,
      message: 'Preview video uploaded successfully',
      data: {
        url: fileInfo.url,
        course: updatedCourse
      }
    });
  } catch (error) {
    console.error('Upload preview video error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload lesson video
// @route   POST /api/upload/lesson/:lessonId/video
// @access  Private (Instructor)
export const uploadLessonVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { lessonId } = req.params;

    // Verify lesson ownership
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (lesson.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete old video if exists
    if (lesson.contentUrl) {
      const oldPublicId = uploadService.extractPublicId(lesson.contentUrl);
      if (oldPublicId) {
        await uploadService.deleteFile(oldPublicId, 'video');
      }
    }

    // Upload new video
    const fileInfo = await uploadService.uploadFile(req.file);

    // Update lesson with new video
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        contentUrl: fileInfo.url,
        contentType: 'VIDEO'
      }
    });

    res.json({
      success: true,
      message: 'Lesson video uploaded successfully',
      data: {
        url: fileInfo.url,
        lesson: updatedLesson
      }
    });
  } catch (error) {
    console.error('Upload lesson video error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload lesson resources (PDFs, documents, etc.)
// @route   POST /api/upload/lesson/:lessonId/resources
// @access  Private (Instructor)
export const uploadLessonResources = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { lessonId } = req.params;

    // Verify lesson ownership
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (lesson.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Upload files
    const filesInfo = await uploadService.uploadMultipleFiles(req.files);

    // Get existing resources
    const existingResources = lesson.resources || [];

    // Combine with new resources
    const updatedResources = [...existingResources, ...filesInfo];

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        resources: updatedResources
      }
    });

    res.json({
      success: true,
      message: 'Resources uploaded successfully',
      data: {
        resources: filesInfo,
        lesson: updatedLesson
      }
    });
  } catch (error) {
    console.error('Upload resources error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload user profile picture
// @route   POST /api/upload/profile/picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log('Upload profile picture - req.file:', req.file);
    console.log('Upload profile picture - req.files:', req.files);
    console.log('Upload profile picture - req.body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please ensure you are sending a file with the field name "image".'
      });
    }

    const userId = req.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPublicId = uploadService.extractPublicId(user.profilePicture);
      if (oldPublicId) {
        await uploadService.deleteFile(oldPublicId, 'image');
      }
    }

    // Upload new picture
    const fileInfo = await uploadService.uploadFile(req.file);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: fileInfo.url },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        bio: true
      }
    });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: fileInfo.url,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/upload/file
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await uploadService.deleteFile(publicId, resourceType);

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};