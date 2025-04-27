const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '奖励名称是必需的'],
    trim: true
  },
  description: {
    type: String,
    required: [true, '奖励描述是必需的'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, '所需积分是必需的'],
    min: [0, '所需积分不能小于0']
  },
  stock: {
    type: Number,
    required: [true, '库存数量是必需的'],
    min: [0, '库存数量不能小于0']
  },
  image: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
rewardSchema.index({ name: 1 });
rewardSchema.index({ status: 1 });

const Reward = mongoose.model('Reward', rewardSchema);
module.exports = Reward; 