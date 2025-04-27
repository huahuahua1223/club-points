const express = require('express');
const cors = require('cors');
const router = express.Router();
const {
  createActivity,
  getAllActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  startActivity,
  completeActivity,
  signupActivity,
  cancelSignupActivity,
  checkInActivity,
  getActivityParticipants,
  getActivityStats,
  setCheckInCode
} = require('../controllers/activityController');
const { protect, restrictTo } = require('../middleware/auth');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 配置 CORS 中间件
const corsOptions = {
  origin: 'http://localhost:3000', // 允许来自 localhost:3000 的请求
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的头信息
  credentials: true // 允许携带凭证（如 Cookies）
};

router.use(cors(corsOptions)); // 应用 CORS 中间件

// 所有路由都需要登录验证
router.use(protect);

// 获取所有活动（管理员和学生）
router.get('/', getAllActivities);

// 获取单个活动（管理员和学生）
// 示例路由处理函数
router.get('/:id', getActivity);

// 创建活动（仅管理员）
router.post('/', restrictTo('admin'), createActivity);

// 更新活动（仅管理员）
router.patch('/:id', restrictTo('admin'), updateActivity);

// 删除活动（仅管理员）
router.delete('/:id', restrictTo('admin'), deleteActivity);

// 开始活动（仅管理员可访问）
router.patch('/:id/start', restrictTo('admin'), startActivity);

// 结束活动（仅管理员可访问）
router.patch('/:id/complete', restrictTo('admin'), completeActivity);

// 报名活动（学生）
router.post('/:id/signup', signupActivity);

// 取消报名活动（学生）
router.delete('/:id/signup', cancelSignupActivity);

// 活动签到（学生）
router.post('/:id/checkin', checkInActivity);

//获取活动参与者信息（管理员）
router.get('/:id/participants',restrictTo('admin'), getActivityParticipants);

// 获取活动统计信息（仅管理员）
router.get('/stats/summary', restrictTo('admin'), getActivityStats);

// 设置签到码（管理员）
router.post('/:id/checkin-code', restrictTo('admin'), setCheckInCode);

module.exports = router;