const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pointsHistorySchema = new mongoose.Schema({
  points: {
    type: Number,
    required: true
  },  
  type: {
    type: String,
    enum: ['earn', 'redeem'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const activityRegistrationSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'absent'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  checkedInAt: Date
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请输入用户名'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, '请输入密码'],
    select: false
  },
  email: {
    type: String,
    required: [true, '请输入邮箱'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址']
  },
  phone: {
    type: String,
    required: [true, '请输入手机号'],
    match: [/^1[3-9]\d{9}$/, '请输入有效的手机号']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (this.role === 'admin') return true;
        return /^202\d{6}$/.test(v);
      },
      message: '学号格式不正确'
    },
    required: function() {
      return this.role === 'student';
    }
  },
  college: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  class: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  avatar: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastLoginAt: Date,
  lastActivityAt: Date,
  pointsHistory: [pointsHistorySchema],
  activities: [activityRegistrationSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ points: -1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 添加积分方法
userSchema.methods.addPoints = async function(points, description, activity = null) {
  this.points = (this.points || 0) + points;
  
  // 确保 pointsHistory 是数组
  if (!this.pointsHistory) {
    this.pointsHistory = [];
  }
  
  this.pointsHistory.push({
    points,
    type: 'earn',
    description,
    activity,
    date: new Date()
  });
  await this.save();
};

// 扣除积分方法
userSchema.methods.deductPoints = async function(points, description, activity = null) {
  // 确保 points 字段已初始化
  if (!this.points) {
    this.points = 0;
  }
  
  if (this.points < points) {
    throw new Error('积分不足');
  }
  this.points -= points;
  
  // 确保 pointsHistory 是数组
  if (!this.pointsHistory) {
    this.pointsHistory = [];
  }
  
  this.pointsHistory.push({
    points: -points,
    type: 'redeem',
    description,
    activity,
    date: new Date()
  });
  await this.save();
};

// 注册活动方法
userSchema.methods.registerActivity = async function(activityId) {
  // 确保 activities 是数组
  if (!this.activities) {
    this.activities = [];
  }
  
  if (this.activities.some(a => a.activity && a.activity.toString() === activityId.toString())) {
    throw new Error('已经报名过该活动');
  }
  this.activities.push({
    activity: activityId,
    status: 'registered',
    registeredAt: new Date()
  });
  // 确保 activities 数组中的每个文档都定义了 activity 属性
  this.activities = this.activities.map(activity => ({
    ...activity,
    activity: activity.activity || null // Ensure activity is defined
  }));
  await this.save();
};

// 活动签到方法
userSchema.methods.checkInActivity = async function(activityId) {
  // 确保 activities 是数组
  if (!this.activities || !Array.isArray(this.activities)) {
    throw new Error('未报名该活动');
  }
  
  const activity = this.activities.find(
    a => a.activity && a.activity.toString() === activityId.toString()
  );
  if (!activity) {
    throw new Error('未报名该活动');
  }
  if (activity.status === 'checked-in') {
    throw new Error('已经签到过了');
  }
  activity.status = 'checked-in';
  activity.checkedInAt = new Date();
  this.lastActivityAt = new Date();
  await this.save();
};

// 更新最后活动时间
userSchema.methods.updateLastActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save();
};

// 获取积分历史方法
userSchema.methods.getPointsHistory = async function(limit = 10) {
  if (!this.pointsHistory || !Array.isArray(this.pointsHistory)) {
    return [];
  }
  return this.pointsHistory
    .sort((a, b) => b.date - a.date)
    .slice(0, limit);
};

// 获取活动历史方法
userSchema.methods.getActivitiesHistory = async function(status = null) {
  if (!this.activities || !Array.isArray(this.activities)) {
    return [];
  }
  
  let activities = this.activities;
  if (status) {
    activities = activities.filter(a => a.status === status);
  }
  return activities.sort((a, b) => b.registeredAt - a.registeredAt);
};

// 虚拟字段：活动参与次数
userSchema.virtual('activityCount').get(function() {
  return this.activities && Array.isArray(this.activities) ? this.activities.length : 0;
});

// 虚拟字段：已签到活动次数
userSchema.virtual('checkedInCount').get(function() {
  return this.activities && Array.isArray(this.activities) 
    ? this.activities.filter(a => a.status === 'checked-in').length 
    : 0;
});

// 虚拟字段：总获得积分
userSchema.virtual('totalEarnedPoints').get(function() {
  if (!this.pointsHistory || !Array.isArray(this.pointsHistory)) {
    return 0;
  }
  return this.pointsHistory
    .filter(h => h.type === 'earn')
    .reduce((sum, h) => sum + h.points, 0);
});

// 虚拟字段：总消费积分
userSchema.virtual('totalRedeemedPoints').get(function() {
  if (!this.pointsHistory || !Array.isArray(this.pointsHistory)) {
    return 0;
  }
  return this.pointsHistory
    .filter(h => h.type === 'redeem')
    .reduce((sum, h) => sum + Math.abs(h.points), 0);
});

// 创建用户前的验证中间件
userSchema.pre('validate', function(next) {
  // 如果是管理员，清空学生相关字段
  if (this.role === 'admin') {
    this.studentId = undefined;
    this.class = undefined;
    this.college = undefined;
    this.points = 0;
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;