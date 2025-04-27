const mongoose = require('mongoose');

const pointRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true, unique: true },
  activityType: { type: String, required: true },
  basePoints: { type: Number, required: true },
  bonusPoints: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// 检查模型是否已经存在
const PointRule = mongoose.models.PointRule || mongoose.model('PointRule', pointRuleSchema);

module.exports = PointRule; 