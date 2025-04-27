const fs = require('fs');
const path = require('path');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Activity = require('../models/Activity');

// 上传活动图片
exports.uploadActivityImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('请上传图片文件', 400));
  }

  const activityId = req.params.id;
  
  // 检查活动是否存在
  const activity = await Activity.findById(activityId);
  if (!activity) {
    // 删除已上传的文件
    fs.unlinkSync(req.file.path);
    return next(new AppError('未找到该活动', 404));
  }

  // 图片URL (相对路径)
  const imageUrl = `/images/activities/${req.file.filename}`;
  
  // 保存图片信息到活动记录
  const imageInfo = {
    url: imageUrl,
    description: req.body.description || '',
    uploadedAt: new Date()
  };

  // 添加到活动的图片数组
  activity.images.push(imageInfo);

  // 如果是第一张图片或指定为封面，则设置为封面
  if (req.body.isCover === 'true' || activity.images.length === 1) {
    activity.coverImage = imageUrl;
  }

  await activity.save();

  res.status(200).json({
    status: 'success',
    data: {
      image: imageInfo
    }
  });
});

// 删除活动图片
exports.deleteActivityImage = catchAsync(async (req, res, next) => {
  const { activityId, imageId } = req.params;

  // 查找活动
  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  // 查找图片
  const imageIndex = activity.images.findIndex(img => img._id.toString() === imageId);
  if (imageIndex === -1) {
    return next(new AppError('未找到该图片', 404));
  }

  const imageToDelete = activity.images[imageIndex];
  
  // 从文件系统中删除图片
  try {
    const filePath = path.join(__dirname, '..', 'public', imageToDelete.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('删除文件失败:', err);
    // 继续执行，至少从数据库中删除记录
  }

  // 从活动记录中删除图片
  activity.images.splice(imageIndex, 1);

  // 如果删除的是封面图片，且还有其他图片，则设置第一张为封面
  if (activity.coverImage === imageToDelete.url && activity.images.length > 0) {
    activity.coverImage = activity.images[0].url;
  } else if (activity.coverImage === imageToDelete.url) {
    // 如果没有其他图片，则设置为默认封面
    activity.coverImage = '/images/default-activity.jpg';
  }

  await activity.save();

  res.status(200).json({
    status: 'success',
    message: '图片已删除'
  });
});

// 设置活动封面图片
exports.setActivityCover = catchAsync(async (req, res, next) => {
  const { activityId, imageId } = req.params;

  // 查找活动
  const activity = await Activity.findById(activityId);
  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  // 查找图片
  const image = activity.images.find(img => img._id.toString() === imageId);
  if (!image) {
    return next(new AppError('未找到该图片', 404));
  }

  // 设置为封面
  activity.coverImage = image.url;
  await activity.save();

  res.status(200).json({
    status: 'success',
    data: {
      coverImage: activity.coverImage
    }
  });
}); 