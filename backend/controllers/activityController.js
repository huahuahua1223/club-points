const Activity = require('../models/Activity');
const ActivityParticipant = require('../models/ActivityParticipant');
const User = require('../models/User');
const Points = require('../models/Points');
const PointsRecord = require('../models/PointsRecord');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// 创建活动（管理员）
exports.createActivity = catchAsync(async (req, res) => {
  const activityData = {
    ...req.body,
    organizer: req.user._id,
    participants: [], // 空数组，符合模型定义（将在参与者报名时添加对象）
    currentParticipants: 0,
    status: 'ongoing', // 初始状态为发布
  };

  try {
    const activity = await Activity.create(activityData);
    
    const populatedActivity = await Activity.findById(activity._id)
      .populate('organizer', 'name email');
    
    // 只有当 points 字段存在时才 populate
    if (activity.points) {
      await populatedActivity.populate('points');
    }

    res.status(201).json({
      success: true,
      data: populatedActivity
    });
  } catch (error) {
    console.error('创建活动错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '创建活动失败'
    });
  }
});

// 获取所有活动（管理员和学生）
exports.getAllActivities = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const queryConditions = {};
  if (req.query.title) {
    queryConditions.title = new RegExp(req.query.title, 'i');
  }
  if (req.query.type) {
    queryConditions.type = req.query.type;
  }
  if (req.query.status) {
    queryConditions.status = req.query.status;
  }

  if (req.user.role === 'student') {
    queryConditions.status = 'ongoing';
  }

  try {
    const [activities, total] = await Promise.all([
      Activity.find(queryConditions)
        .populate('organizer', 'name email')
        .populate('points')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(queryConditions),
    ]);

    const processedActivities = activities.map(activity => {
      // 确保 participants 存在且是数组
      const participants = Array.isArray(activity.participants) ? activity.participants : [];
      
      // 检查当前用户是否是参与者
      const isParticipant = participants.some(p => 
        p.user && p.user.toString() === req.user._id.toString()
      );
      
      return {
        ...activity,
        participantsCount: participants.length,
        isRegistrationOpen: activity.status === 'ongoing' && 
          (activity.maxParticipants === 0 || participants.length < activity.maxParticipants),
        isParticipant
      };
    });

    res.status(200).json({
      success: true,
      data: processedActivities,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取活动列表失败'
    });
  }
});


// 获取单个活动（管理员和学生）
exports.getActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  console.log(req.params.id);
    // .populate({
    //   path: 'participants',
    //   model: 'User',
    //   select: 'name email'
    // })
    // .populate('organizer', 'name email');

  if (!activity) {
    return new AppError('未找到该活动', 404);
  }

  // 学生只能查看已发布的活动
  if (req.user.role === 'student' && activity.status !== 'ongoing') {
    return new AppError('无权查看该活动', 403);
  }

  res.status(200).json({
    status: 'success',
    data: {
      activity,
      isParticipant: activity.participants?.includes(req.user._id) || false
    }
  });
});

// 删除活动（管理员）
exports.deleteActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return new AppError('未找到该活动', 404);
  }

  // 已发布的活动不能删除
  if (activity.status === 'ongoing') {
    return new AppError('已发布的活动不能删除', 400);
  }

  await Activity.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// 更新活动（管理员）
exports.updateActivity = catchAsync(async (req, res, next) => {
  console.log('Received PATCH request for activity update');
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  const validFields = Object.keys(Activity.schema.paths);
  const updateData = {};

  // 如果活动已发布，仅允许更新以下字段
  const allowedIfOngoing = ['description', 'location', 'startDate', 'endDate','maxParticipants'];

  for (const key of Object.keys(req.body)) {
    if (!validFields.includes(key)) continue;

    if (activity.status === 'ongoing' && !allowedIfOngoing.includes(key)) {
      continue; // 发布后不可更新除上述字段之外的
    }

    if (key === 'organizer') {
      try {
        updateData[key] = new mongoose.Types.ObjectId(req.body[key]);
      } catch (err) {
        updateData[key] = req.body[key]; // 如果转换失败，保留原始字符串
      }
    } else {
      updateData[key] = req.body[key];
    }
  }

  const updatedActivity = await Activity.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      activity: updatedActivity
    }
  });
});

// 开始活动
exports.startActivity = catchAsync(async (req, res, next) => {
  console.log(`Received request to start activity with ID: ${req.params.id}`);
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    console.log('Activity not found');
    return next(new AppError('未找到该活动', 404));
  }

  console.log(`Activity found with status: ${activity.status}`);
  if (activity.status !== 'draft') {
    return next(new AppError('活动不是草稿状态，无法开始', 400));
  }

  activity.status = 'ongoing';
  await activity.save();
  console.log('Activity status updated to ongoing');

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});


// 结束活动
exports.completeActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return new AppError('未找到该活动', 404);
  }

  if (activity.status !== 'ongoing') {
    return new AppError('活动未开始或已结束', 400);
  }

  // 更新活动状态为已完成
  activity.status = 'completed';
  await activity.save();

  // 获取所有已签到的参与者
  const checkedInParticipants = await ActivityParticipant.find({
    activity: activity._id,
    status: 'checked-in'
  });

  // 为已签到的参与者添加积分
  if (activity.points && checkedInParticipants.length > 0) {
    for (const participant of checkedInParticipants) {
      const user = await User.findById(participant.user);
      if (user) {
        // 确保有积分值
        const pointsValue = activity.points.value || 0;
        
        // 更新用户积分
        user.points = (user.points || 0) + pointsValue;
        await user.save();

        // 创建积分记录
        await PointsRecord.create({
          user: participant.user,
          points: pointsValue,
          type: 'earn',
          description: `参加活动"${activity.title}"获得积分`,
          activity: activity._id
        });
      }
    }
  }

  // 将未签到的参与者状态设置为缺席
  await ActivityParticipant.updateMany(
    { 
      activity: activity._id, 
      status: 'registered' 
    },
    { 
      status: 'absent' 
    }
  );

  res.status(200).json({
    success: true,
    message: '活动已成功结束',
    data: {
      activity
    }
  });
});

//报名活动（学生）
exports.signupActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  if (activity.status !== 'ongoing') {
    return next(new AppError('该活动未发布，无法报名', 400));
  }

  // 确保 participants 是数组
  if (!Array.isArray(activity.participants)) {
    activity.participants = [];
  }

  // 检查用户是否已报名
  const existingParticipant = activity.participants.find(p => 
    p.user && p.user.toString() === req.user._id.toString()
  );
  
  if (existingParticipant) {
    return next(new AppError('您已报名该活动', 400));
  }

  if (activity.maxParticipants > 0 && activity.participants.length >= activity.maxParticipants) {
    return next(new AppError('活动名额已满', 400));
  }

  // 创建报名时间
  const registeredAt = new Date();

  // 添加新参与者
  activity.participants.push({ 
    user: req.user._id, 
    status: 'registered',
    registeredAt
  });
  
  // 更新当前参与人数
  activity.currentParticipants = activity.participants.length;
  
  await activity.save();

  // 创建ActivityParticipant记录
  await ActivityParticipant.create({
    activity: activity._id,
    user: req.user._id,
    status: 'registered',
    registeredAt
  });

  res.status(200).json({
    status: 'success',
    data: {
      activity
    }
  });
});

exports.cancelSignupActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  if (activity.status !== 'ongoing') {
    return next(new AppError('该活动未发布，无法取消报名', 400));
  }

  // 确保 participants 是数组
  if (!Array.isArray(activity.participants)) {
    return next(new AppError('您未报名该活动', 400));
  }

  // 查找用户报名记录的索引
  const participantIndex = activity.participants.findIndex(p => 
    p.user && p.user.toString() === req.user._id.toString()
  );
  
  if (participantIndex === -1) {
    return next(new AppError('您未报名该活动', 400));
  }

  // 移除报名记录
  activity.participants.splice(participantIndex, 1);
  
  // 更新当前参与人数
  activity.currentParticipants = activity.participants.length;
  
  await activity.save();

  // 删除对应的ActivityParticipant记录
  await ActivityParticipant.findOneAndDelete({
    activity: activity._id,
    user: req.user._id
  });

  res.status(200).json({
    message: "取消报名成功"
  });
});


exports.checkInActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  if (activity.status !== 'ongoing') {
    return next(new AppError('该活动未发布或已结束，无法签到', 400));
  }

  const { checkInCode } = req.body;
  const correctCode = activity.checkInCode;

  if (!correctCode || checkInCode !== correctCode) {
    return next(new AppError('签到码错误', 400));
  }

  // 确保 participants 是数组
  if (!Array.isArray(activity.participants)) {
    return next(new AppError('您未报名该活动', 400));
  }

  // 查找参与者索引
  const participantIndex = activity.participants.findIndex(p => 
    p.user && p.user.toString() === req.user._id.toString()
  );
  
  if (participantIndex === -1) {
    return next(new AppError('您未报名该活动', 400));
  }

  // 更新签到状态
  activity.participants[participantIndex].status = 'checkedIn';
  await activity.save();

  // 更新ActivityParticipant记录的状态
  await ActivityParticipant.findOneAndUpdate(
    { activity: activity._id, user: req.user._id },
    { status: 'checked-in' }
  );

  res.status(200).json({
    status: 'success',
    message: '签到成功',
    data: { activity }
  });
});

//设置签到码
exports.setCheckInCode = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return new AppError('未找到该活动', 404);
  }

  if (!req.user.isAdmin) {
    return new AppError('只有管理员可以设置签到码', 403);
  }

  activity.checkInCode = req.body.checkInCode;
  await activity.save();

  res.status(200).json({
    status: 'success',
    message: '签到码设置成功'
  });
});



// //获取活动参与者信息（管理员）
// exports.getActivityParticipants = catchAsync(async (req, res, next) => {
//   const activity = await Activity.findById(req.params.id);

//   if (!activity) {
//     return next(new AppError('未找到该活动', 404));
//   }

//   const participants = await ActivityParticipant.find({ activity: req.params.id });
//   res.status(200).json({
//     status: 'success',
//     data: { participants }
//   });
// });

// // 获取活动统计信息（管理员）
// exports.getActivityStats = catchAsync(async (req, res) => {
//   const stats = await Activity.aggregate([
//     {
//       $group: {
//         _id: '$status',
//         count: { $sum: 1 },
//         totalParticipants: { $sum: { $size: '$participants' } }
//       }
//     }
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       stats
//     }
//   });
// });

//获取活动参与者信息（管理员）
exports.getActivityParticipants = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('未找到该活动', 404));
  }

  const participants = await ActivityParticipant.find({ activity: req.params.id })
    .populate('user', 'name studentId email avatar')
    .sort('registeredAt');

  res.status(200).json({
    success: true,
    data: participants
  });
});

// 获取活动统计信息（管理员）
exports.getActivityStats = catchAsync(async (req, res) => {
  const stats = await Activity.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalParticipants: { $sum: { $size: '$participants' } }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

