const express = require('express');
const router = express.Router();
const pointRuleController = require('../controllers/pointRuleController');
const { protect, restrictTo } = require('../middleware/auth');
const PointRule = require('../models/PointRule');

// 所有路由都需要登录验证
router.use(protect);

// 获取所有积分规则
router.get('/', pointRuleController.getAllPointRules);

// 获取单个积分规则
router.get('/:id', pointRuleController.getRule);

// 以下路由仅管理员可访问
router.use(restrictTo('admin'));

// 创建积分规则
router.post('/', async (req, res) => {
  try {
    const pointRule = await PointRule.create({
      ...req.body,
      createdBy: req.user._id, // 自动设置创建者为当前用户
    });
    res.status(201).json({
      status: 'success',
      data: pointRule,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
});

// 更新积分规则
router.patch('/:id', pointRuleController.updateRule);

// 删除积分规则
router.delete('/:id', pointRuleController.deleteRule);

module.exports = router; 