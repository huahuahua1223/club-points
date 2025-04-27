const mongoose = require('mongoose');

const activityParticipantSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'checked-in', 'absent'],
    default: 'registered'
  },
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true  // 自动维护 createdAt / updatedAt
});

// 索引
activityParticipantSchema.index({ activity: 1 });
activityParticipantSchema.index({ user: 1 });

const ActivityParticipant = mongoose.model('ActivityParticipant', activityParticipantSchema);

module.exports = ActivityParticipant;