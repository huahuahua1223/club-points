const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');

// 获取总体统计数据
router.get('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalActivities = await Activity.countDocuments();
    const totalPoints = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const pointsRanking = await User.find({ role: 'student' })
      .sort('-points')
      .limit(10)
      .select('name studentId points');

    res.json({
      status: 'success',
      data: {
        totalStudents,
        totalActivities,
        totalPoints: totalPoints[0]?.total || 0,
        pointsRanking
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;