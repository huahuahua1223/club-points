const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// 上传活动图片
router.post(
  '/activities/:id/images',
  protect,
  restrictTo('admin'),
  upload.uploadActivityImage,
  upload.handleUploadErrors,
  uploadController.uploadActivityImage
);

// 删除活动图片
router.delete(
  '/activities/:activityId/images/:imageId',
  protect,
  restrictTo('admin'),
  uploadController.deleteActivityImage
);

// 设置活动封面图片
router.patch(
  '/activities/:activityId/images/:imageId/cover',
  protect,
  restrictTo('admin'),
  uploadController.setActivityCover
);

module.exports = router; 