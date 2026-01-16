const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const folderController = require('../controllers/folderController');
const fileController = require('../controllers/fileController');
const shareController = require('../controllers/shareController');
const activityController = require('../controllers/activityController');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CloudVault API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth routes
router.post('/auth/signup', authController.signUp);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// User routes
router.get('/users', protect, userController.getUsers);
router.get('/users/:id', protect, userController.getUserById);
router.get('/users/:id/profile', protect, userController.getUserProfile);
router.post('/users', protect, userController.createUser);
router.put('/users/:id', protect, userController.updateUser);
router.delete('/users/:id', protect, userController.deleteUser);

// Folder routes
router.get('/folders', protect, folderController.getFolders);
router.get('/folders/:id', protect, folderController.getFolderById);
router.post('/folders', protect, folderController.createFolder);
router.put('/folders/:id', protect, folderController.updateFolder);
router.delete('/folders/:id', protect, folderController.deleteFolder);

// File routes
router.get('/files', protect, fileController.getFiles);
router.get('/files/search', protect, fileController.searchFiles);
router.get('/files/:id', protect, fileController.getFileById);
router.post('/files', protect, fileController.createFile);
router.put('/files/:id', protect, fileController.updateFile);
router.delete('/files/:id', protect, fileController.deleteFile);

// Share routes
router.get('/shares/with-me', protect, shareController.getSharedWithMe);
router.get('/shares/by-me', protect, shareController.getSharedByMe);
router.post('/shares', protect, shareController.shareFile);
router.delete('/shares/:id', protect, shareController.unshareFile);

// Activity & Stats routes
router.get('/activity', protect, activityController.getActivity);
router.get('/stats', protect, activityController.getStats);

module.exports = router;
