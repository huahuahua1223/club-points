const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// 确保上传目录存在
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
};

// 活动图片存储设置
const activityImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/images/activities');
    createDirIfNotExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `activity-${req.params.id}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器 - 只接受图片文件
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new AppError('只允许上传图片文件！', 400), false);
  }
  cb(null, true);
};

// 活动图片上传中间件
exports.uploadActivityImage = multer({
  storage: activityImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
}).single('image');

// 处理上传错误
exports.handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: '文件大小不能超过5MB'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: `上传错误: ${err.message}`
    });
  }
  next(err);
}; 