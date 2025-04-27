//积分记录
const mongoose = require('mongoose');

const pointRuleSchema = new mongoose.Schema({
  ruleName: {
    type: String,
    required: [true, '请输入规则名称'],
    unique: true,
    trim: true
  },
  activityType: {
    type: String,
    required: [true, '请选择活动类型']
  },
  basePoints: {
    type: Number,
    required: [true, '请输入基础积分'],
    min: [0, '积分不能为负数']
  },
  bonusPoints: {
    type: Number,
    required: [true, '请输入奖励积分'],
    min: [0, '积分不能为负数']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 索引
pointRuleSchema.index({ ruleName: 1 });

module.exports = mongoose.model('PointRule', pointRuleSchema);