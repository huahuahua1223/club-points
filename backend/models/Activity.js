const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: [true, '请输入活动标题'], trim: true },
  description: { type: String, required: [true, '请输入活动描述'] },
  type: {
    type: String,
    required: [true, '请选择活动类型'],
    enum: ['volunteer', 'academic', 'sports', 'art', 'other']
  },
  points: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointRule',
    required: [true, '请设置活动积分'],
  },
  startDate: { type: Date, required: [true, '请设置活动开始时间'] },
  endDate: { type: Date, required: [true, '请设置活动结束时间'] },
  location: { type: String, required: [true, '请输入活动地点'] },
  maxParticipants: { type: Number, required: true, min: 1 },
  currentParticipants: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['registered', 'checked-in', 'absent'],
      default: 'registered'
    },
    registeredAt: { type: Date, default: Date.now }
  }],
  coverImage: { 
    type: String, 
    default: '/images/default-activity.jpg' 
  },
  images: [{ 
    url: { type: String, required: true },
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  requirements: String,
  tags: [{ type: String }],
  checkInCode: { type: String }  // 添加签到码字段
}, {
  timestamps: true  // 自动维护 createdAt / updatedAt
});

// 索引
activitySchema.index({ title: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ startDate: 1 });
activitySchema.index({ organizer: 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;