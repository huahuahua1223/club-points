//积分的增删改查

const PointsRecord = require('../models/PointsRecord');
const User = require('../models/User');
const Reward = require('../models/Reward');

exports.getPointsHistory = async (req, res) => {
  try {
    const records = await PointsRecord.find({ user: req.params.userId })
      .populate('activity', 'title')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      data: { records }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.exchangeReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      return res.status(404).json({
        status: 'error',
        message: '奖励不存在'
      });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '奖励库存不足'
      });
    }

    const user = await User.findById(req.user._id);
    if (user.points < reward.points) {
      return res.status(400).json({
        status: 'error',
        message: '积分不足'
      });
    }

    // 扣除积分
    user.points -= reward.points;
    await user.save();

    // 减少库存
    reward.stock -= 1;
    await reward.save();

    // 创建积分记录
    await PointsRecord.create({
      user: req.user._id,
      points: -reward.points,
      type: 'spend',
      description: `兑换奖励"${reward.name}"`
    });

    res.status(200).json({
      status: 'success',
      message: '兑换成功'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};