const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { protect } = require('../middleware/auth');

// 所有路由都需要登录验证
router.use(protect);

// 获取积分历史记录
router.get('/history/:userId', pointsController.getPointsHistory);

// 兑换奖励
router.post('/exchange', pointsController.exchangeReward);

module.exports = router;