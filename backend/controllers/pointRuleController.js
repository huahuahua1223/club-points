//创建积分规则控制器

const PointRule = require('../models/PointRule');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 获取所有积分规则（带分页和搜索）
exports.getAllPointRules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // 构建搜索条件
    const searchCondition = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    // 获取总数
    const total = await PointRule.countDocuments(searchCondition);

    // 获取分页数据
    const rules = await PointRule.find(searchCondition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        rules,
        total,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('获取积分规则列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分规则列表失败'
    });
  }
};

// 创建积分规则
exports.createRule = catchAsync(async (req, res) => {
  const rule = await PointRule.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      rule
    }
  });
});

// 获取单个积分规则
exports.getRule = catchAsync(async (req, res, next) => {
  const rule = await PointRule.findById(req.params.id);
  
  if (!rule) {
    return next(new AppError('未找到该积分规则', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      rule
    }
  });
});

// 更新积分规则
exports.updateRule = catchAsync(async (req, res, next) => {
  const rule = await PointRule.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!rule) {
    return next(new AppError('未找到该积分规则', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      rule
    }
  });
});

// 删除积分规则
exports.deleteRule = catchAsync(async (req, res, next) => {
  const rule = await PointRule.findByIdAndDelete(req.params.id);

  if (!rule) {
    return next(new AppError('未找到该积分规则', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 