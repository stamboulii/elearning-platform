// import express from 'express';
// import {
//   uploadCourseThumbnail,
//   uploadCoursePreviewVideo,
//   uploadLessonVideo,
//   uploadLessonResources,
//   uploadProfilePicture,
//   deleteFile
// } from '../controllers/uploadController.js';
// import {
//   uploadImage,
//   uploadVideo,
//   uploadDocument,
//   uploadMultiple,
//   handleUploadError
// } from '../middleware/upload.js';
// import { protect, authorize } from '../middleware/auth.js';

// const router = express.Router();

// // All routes require authentication
// router.use(protect);

// // Profile picture upload
// router.post(
//   '/profile/picture',
//   uploadImage.single('image'),
//   handleUploadError,
//   uploadProfilePicture
// );

// // Course uploads (Instructor only)
// router.post(
//   '/course/:courseId/thumbnail',
//   authorize('INSTRUCTOR', 'ADMIN'),
//   uploadImage.single('thumbnail'),
//   handleUploadError,
//   uploadCourseThumbnail
// );

// router.post(
//   '/course/:courseId/preview-video',
//   authorize('INSTRUCTOR', 'ADMIN'),
//   uploadVideo.single('video'),
//   handleUploadError,
//   uploadCoursePreviewVideo
// );

// // Lesson uploads (Instructor only)
// router.post(
//   '/lesson/:lessonId/video',
//   authorize('INSTRUCTOR', 'ADMIN'),
//   uploadVideo.single('video'),
//   handleUploadError,
//   uploadLessonVideo
// );

// router.post(
//   '/lesson/:lessonId/resources',
//   authorize('INSTRUCTOR', 'ADMIN'),
//   uploadMultiple.array('resources', 10),
//   handleUploadError,
//   uploadLessonResources
// );

// // Delete file
// router.delete('/file', deleteFile);

// export default router;



import express from 'express';
import {
  uploadCourseThumbnail,
  uploadCoursePreviewVideo,
  uploadLessonVideo,
  uploadLessonResources,
  uploadProfilePicture,
  deleteFile
} from '../controllers/uploadController.js';
import {
  uploadImage,
  uploadVideo,
  uploadDocument,
  uploadMultiple,
  handleUploadError
} from '../middleware/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /upload/profile/picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/profile/picture', uploadImage.single('image'), handleUploadError, uploadProfilePicture);

/**
 * @swagger
 * /upload/course/{courseId}/thumbnail:
 *   post:
 *     summary: Upload course thumbnail
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/course/:courseId/thumbnail', authorize('INSTRUCTOR', 'ADMIN'), uploadImage.single('thumbnail'), handleUploadError, uploadCourseThumbnail);

/**
 * @swagger
 * /upload/course/{courseId}/preview-video:
 *   post:
 *     summary: Upload course preview video
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Preview video uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/course/:courseId/preview-video', authorize('INSTRUCTOR', 'ADMIN'), uploadVideo.single('video'), handleUploadError, uploadCoursePreviewVideo);

/**
 * @swagger
 * /upload/lesson/{lessonId}/video:
 *   post:
 *     summary: Upload lesson video
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lesson video uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/lesson/:lessonId/video', authorize('INSTRUCTOR', 'ADMIN'), uploadVideo.single('video'), handleUploadError, uploadLessonVideo);

/**
 * @swagger
 * /upload/lesson/{lessonId}/resources:
 *   post:
 *     summary: Upload lesson resources
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Resources uploaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/lesson/:lessonId/resources', authorize('INSTRUCTOR', 'ADMIN'), uploadMultiple.array('resources', 10), handleUploadError, uploadLessonResources);

/**
 * @swagger
 * /upload/file:
 *   delete:
 *     summary: Delete file from cloud storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *               resourceType:
 *                 type: string
 *                 enum: [image, video, raw]
 *                 default: image
 *     responses:
 *       200:
 *         description: File deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/file', deleteFile);

export default router;